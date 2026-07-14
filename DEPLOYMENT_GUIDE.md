# Fixora Production Deployment Guide

This document serves as the official production deployment guide for the **Fixora** platform. It covers system requirements, build pipelines, hosting environments, production configurations, and security recommendations.

---

## 1. Introduction
This guide explains how to compile, publish, and host the Fixora marketplace system in commercial environments. It covers:
- Self-hosted infrastructures (IIS, Linux VPS, Docker).
- Cloud platforms (Azure App Services, AWS Elastic Beanstalk).
- Static CDN hosting for the vanilla HTML/CSS/JS frontend (Vercel, Netlify).

---

## 2. System Requirements

### Frontend Requirements
- Static Web Hosting Server (IIS, Nginx, Apache, Netlify, Vercel, AWS S3).
- SSL/TLS Certificate (HTTPS is mandatory for SignalR secure handshakes).

### Backend Requirements
- .NET 8.0 Runtime & ASP.NET Core Hosting Bundle.
- Operating System: Windows Server 2019+, Ubuntu 20.04+, or Docker Engine 20.10+.

### Database Requirements
- Microsoft SQL Server 2019+ (Express, Standard, or Azure SQL).
- Persistent storage for file attachments (local directories or cloud object storage).

---

## 3. Repository Setup
Clone the codebase and examine the structure:
```bash
git clone https://github.com/SalmaH9/NXT24_AST4_SWD_S1-Home-Emergency-.git
cd NXT24_AST4_SWD_S1-Home-Emergency-
```

The repository separates backend business layers (`Backend_depi`) from static user interfaces (`fixora`).

---

## 4. Backend Deployment

### Publish Commands Pipeline
Navigate to the backend solution and execute:
```bash
# 1. Restore NuGet dependencies
dotnet restore HomeEmergency.sln

# 2. Build the projects
dotnet build HomeEmergency.sln --configuration Release

# 3. Run automated tests
dotnet test tests/HomeEmergency.Tests/HomeEmergency.Tests.csproj --configuration Release

# 4. Publish the API application
dotnet publish src/HomeEmergency.API/HomeEmergency.API.csproj --configuration Release --output ./publish
```

This generates a compiled production package in the `./publish` directory ready for deployment.

---

## 5. Database Deployment

### SQL Connection Setup
Ensure your connection string in `appsettings.Production.json` or Environment Variables points to the production SQL server:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=tcp:sql-server.database.windows.net,1433;Initial Catalog=HomeEmergencyDb;Persist Security Info=False;User ID=adminUser;Password=SecurePassword;MultipleActiveResultSets=True;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
}
```

### Apply Migrations
Apply database migrations from the CLI:
```bash
dotnet ef database update --project src/HomeEmergency.Infrastructure --startup-project src/HomeEmergency.API --context ApplicationDbContext
```

---

## 6. Frontend Deployment

Since the frontend is static HTML/CSS/JS, it can be deployed to any static web server:

### Netlify / Vercel
1. Set the root deployment directory to `fixora`.
2. Configure environment endpoints in `fixora/js/config.js` to point to your live backend domain:
   ```javascript
   const CONFIG = {
       API_BASE_URL: "https://api.fixora.com/api/",
       HUB_BASE_URL: "https://api.fixora.com/hubs/"
   };
   ```

### IIS (Internet Information Services)
1. Add a new Website in IIS Manager.
2. Point the physical path to the `fixora` directory.
3. Bind the website to port `80` (HTTP) and `443` (HTTPS) with an active SSL certificate.

---

## 7. Backend Hosting Options

### Option A: Azure App Services
- Create an **Azure App Service** instance select Linux/Windows with **.NET 8** stack.
- Link your Git repository or deploy the `./publish` folder using ZIP deploy.
- Configure app configurations directly in the App Service Portal.

### Option B: Linux VPS with Docker
Build and run via Dockerfile:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/HomeEmergency.API/HomeEmergency.API.csproj", "API/"]
RUN dotnet restore "API/HomeEmergency.API.csproj"
COPY . .
WORKDIR "/src/src/HomeEmergency.API"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HomeEmergency.API.dll"]
```

---

## 8. Environment Variables Reference

| Variable Name | Description | Example Value |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | Environment State | `Production` |
| `ConnectionStrings__DefaultConnection` | Database Connection string | `Server=tcp:production-db;...` |
| `Jwt__Key` | Secret key signing JWT tokens | `SuperSecret32CharLengthStringVal!` |
| `Jwt__Issuer` | Valid token issuer | `https://api.fixora.com` |

---

## 9. Production Configuration

### `appsettings.Production.json`
Enable strict configurations:
- Set logging levels to `Warning` or `Error`.
- Ensure `DetailedErrors` are disabled.

### CORS Configuration
CORS policies in `Program.cs` must restrict accepted origins:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("ProductionCorsPolicy", policy => {
        policy.WithOrigins("https://fixora.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});
```

---

## 10. SignalR Deployment Requirements

- **WebSocket Protocol**: Ensure WebSockets are enabled on your cloud host (e.g. toggle WebSockets ON in Azure App Service Configuration).
- **Reverse Proxy**: If hosting behind Nginx, configure Nginx to forward headers:
  ```nginx
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  ```
- **Sticky Sessions (ARP)**: If scaling horizontally to multiple servers, implement a **Redis Backplane** (`Microsoft.AspNetCore.SignalR.StackExchangeRedis`) to sync message queues across instances.

---

## 11. Security Recommendations

1. **HTTPS Only**: Enforce redirection middleware (`app.UseHttpsRedirection()`) and enforce HSTS.
2. **File Validation**: Documents uploaded by providers must be saved in non-executable partitions.
3. **Database Safeguards**: Restrict database user rights, allowing read/write operations without granting DB Owner permissions.

---

## 12. CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml` to automate testing and builds:
```yaml
name: Fixora CI/CD

on:
  push:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
    - name: Restore dependencies
      run: dotnet restore
    - name: Build
      run: dotnet build --no-restore --configuration Release
    - name: Test
      run: dotnet test --no-build --verbosity normal
```

---

## 13. Troubleshooting Common Issues

### Issue: SignalR connection fails with `401 Unauthorized`
* **Cause**: Token not sent in query parameters.
* **Solution**: Ensure your frontend setup attaches the bearer token as a query parameter during the negotiation phase.

### Issue: Database migration fails during deploy
* **Cause**: Backend host IP blocked by database firewall.
* **Solution**: Check DB server whitelist rules and allow the backend service IP to access port `1433`.

---

## 14. Deployment Commands Summary

```bash
# Compile and Build
dotnet build HomeEmergency.sln --configuration Release

# Execute Tests
dotnet test

# Compile Output Publish Files
dotnet publish src/HomeEmergency.API/HomeEmergency.API.csproj -c Release -o ./publish

# EF Migrations Deploy
dotnet ef database update --project src/HomeEmergency.Infrastructure --startup-project src/HomeEmergency.API
```

---

## 15. Final Notes
- **Platform Version**: `Fixora v1.0.0`
- **Document Version**: `v1.0.0-Production-Ready-Deployment-Guide`
- **Release Date**: July 2026
