using System.Collections.Generic;
using System.Security.Claims;
using HomeEmergency.Domain.Entities;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(ApplicationUser user, IList<string> roles);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}

