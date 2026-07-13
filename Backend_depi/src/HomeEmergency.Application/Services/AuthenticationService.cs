using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using HomeEmergency.Application.DTOs.Auth;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public AuthenticationService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtTokenGenerator jwtTokenGenerator,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> RegisterAsync(RegisterRequestDto request)
    {
        // 1. Check if email is already taken
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        // 2. Map request properties to ApplicationUser
        // Default Status: Customers are active immediately, Providers/Companies are Pending until documents are uploaded and verified
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            Status = request.Role == "Customer" ? AccountStatus.Active : AccountStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        // 3. Create the user using Identity (manages hashing automatically)
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"User registration failed: {errors}");
        }

        // 4. Assign the role to the user
        var roleResult = await _userManager.AddToRoleAsync(user, request.Role);
        if (!roleResult.Succeeded)
        {
            // Clean up created user on failure
            await _userManager.DeleteAsync(user);
            var errors = string.Join(" ", roleResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Role assignment failed: {errors}");
        }

        // 5. Create the corresponding profile table row
        try
        {
            if (request.Role == "Customer")
            {
                var profile = new CustomerProfile
                {
                    UserId = user.Id,
                    PreferredLanguage = "en",
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.CustomerProfiles.AddAsync(profile);
            }
            else if (request.Role == "Provider")
            {
                var profile = new ProviderProfile
                {
                    UserId = user.Id,
                    ServiceCategory = "General",
                    AvailabilityStatus = "Offline",
                    AverageRating = 0.00m,
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.ProviderProfiles.AddAsync(profile);
            }
            else if (request.Role == "Company")
            {
                var profile = new CompanyProfile
                {
                    UserId = user.Id,
                    CompanyName = request.FullName, // Default company name to user's full name
                    RegistrationNumber = "PENDING-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.CompanyProfiles.AddAsync(profile);
            }

            // Commit profiles inside transaction boundary
            await _unitOfWork.CompleteAsync();
        }
        catch (Exception ex)
        {
            // Roll back user registration on profile creation failure
            await _userManager.DeleteAsync(user);
            throw new InvalidOperationException($"Failed to create user profile: {ex.Message}");
        }

        return true;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string ipAddress)
    {
        // 1. Fetch user by email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || user.IsDeleted)
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        // 2. Prevent logins for suspended/inactive users
        if (user.Status == AccountStatus.Suspended)
        {
            throw new InvalidOperationException("Your account has been suspended. Please contact support.");
        }
        if (user.Status == AccountStatus.Inactive)
        {
            throw new InvalidOperationException("Your account is currently inactive.");
        }

        // 3. Verify password via Identity SignInManager (lockoutOnFailure = true)
        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (result.IsLockedOut)
        {
            throw new InvalidOperationException("This account is locked out due to multiple failed login attempts. Please try again later.");
        }
        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        // 4. Resolve roles and generate JWT access token
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user, roles);

        // 5. Generate secure refresh token
        var refreshTokenString = GenerateSecureToken();

        // 6. Save the refresh token to the database
        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = HashToken(refreshTokenString),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedByIp = ipAddress
        };

        await _unitOfWork.RefreshTokens.AddAsync(refreshToken);
        await _unitOfWork.CompleteAsync();

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenString,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(15) // Matching token descriptor expiration
        };
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, string ipAddress)
    {
        // 1. Parse and extract claims from the expired access token
        var principal = _jwtTokenGenerator.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null)
        {
            throw new InvalidOperationException("Invalid access token.");
        }

        // Extract sub/NameIdentifier claim
        var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? principal.FindFirst("sub");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new InvalidOperationException("Invalid token properties.");
        }

        // 2. Fetch the corresponding Refresh Token record
        var refreshTokenHash = HashToken(request.RefreshToken);
        var tokensList = await _unitOfWork.RefreshTokens.FindAsync(
            r => r.TokenHash == refreshTokenHash || r.Token == request.RefreshToken);
        var storedToken = tokensList.FirstOrDefault();

        if (storedToken == null)
        {
            throw new InvalidOperationException("Invalid refresh token.");
        }

        // 3. Verify security properties
        if (storedToken.UserId != userId)
        {
            throw new InvalidOperationException("Token owner mismatch.");
        }

        // 4. Replay Attack Detection: If token is already revoked, invalidate the user's entire session family!
        if (storedToken.IsRevoked)
        {
            var activeTokens = await _unitOfWork.RefreshTokens.FindAsync(
                r => r.UserId == userId && r.RevokedAt == null && r.ExpiresAt > DateTime.UtcNow);
            
            foreach (var activeToken in activeTokens)
            {
                activeToken.RevokedAt = DateTime.UtcNow;
                activeToken.RevokedByIp = ipAddress;
            }
            await _unitOfWork.CompleteAsync();

            throw new InvalidOperationException("Security warning: Reuse of revoked refresh token detected. All active sessions have been terminated.");
        }

        if (storedToken.IsExpired)
        {
            throw new InvalidOperationException("Session expired. Please log in again.");
        }

        // 5. Fetch user and verify account status
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.IsDeleted || user.Status == AccountStatus.Suspended)
        {
            throw new InvalidOperationException("User account is disabled or suspended.");
        }

        // 6. Generate fresh tokens
        var roles = await _userManager.GetRolesAsync(user);
        var newAccessToken = _jwtTokenGenerator.GenerateAccessToken(user, roles);
        var newRefreshTokenString = GenerateSecureToken();

        // 7. Perform rotation: revoke the old token and insert the new one
        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.RevokedByIp = ipAddress;
        storedToken.ReplacedByToken = newRefreshTokenString;
        storedToken.ReplacedByTokenHash = HashToken(newRefreshTokenString);
        storedToken.Token = null;
        storedToken.TokenHash ??= refreshTokenHash;

        var newRefreshToken = new RefreshToken
        {
            UserId = userId,
            TokenHash = HashToken(newRefreshTokenString),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedByIp = ipAddress
        };

        await _unitOfWork.RefreshTokens.AddAsync(newRefreshToken);
        await _unitOfWork.CompleteAsync();

        return new LoginResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshTokenString,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(15)
        };
    }

    private string GenerateSecureToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(randomBytes);
    }

    private static string HashToken(string token)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hashBytes);
    }
}

