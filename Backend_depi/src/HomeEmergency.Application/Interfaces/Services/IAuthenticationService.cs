using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Auth;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IAuthenticationService
{
    Task<bool> RegisterAsync(RegisterRequestDto request);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string ipAddress);
    Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, string ipAddress);
}

