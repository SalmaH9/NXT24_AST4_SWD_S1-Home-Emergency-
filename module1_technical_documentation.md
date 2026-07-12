# Technical Documentation: Module 1 (Authentication & Users)

This document provides a comprehensive technical guide for **Module 1 (Authentication & Users)** of the Service Marketplace Platform. It is designed to align Backend, Frontend, Mobile, QA, and DevOps teams.

---

## 1. Project Overview

### What Module 1 Does
Module 1 manages the core foundation of the platform: **identity, security, profiles, subscription compliance, and moderation**. It handles the registration of multiple user categories, authorization levels via JSON Web Tokens (JWT), validation of documents uploaded for verification, account warnings/moderation, subscription tracking, and user account status lifecycles.

### Business Purpose
*   **Trust and Safety**: Enables a verified marketplace by enforcing identity checks (PDF/Image verifications) before Providers and Companies can bid on or accept jobs.
*   **Flexible Access Control**: Segregates the platform into four primary roles: Admins, Customers, Providers, and Companies, each having dedicated profile schemas.
*   **Moderation Controls**: Provides Administrators with warning and suspension systems to discipline bad actors, immediately terminating active sessions to secure the marketplace.
*   **Monetization Engine**: Integrates a dynamic subscription plan structure allowing users to purchase memberships and tracking expirations just-in-time.

---

## 2. Backend Architecture

### Layered Architecture & Project Breakdown
The system is built using **Clean Architecture** patterns, divided into four projects:

```
[ Marketplace.API ] ────────► [ Marketplace.Infrastructure ] 
        │                                  │
        └───────────► [ Marketplace.Application ] ◄──────────┘
                                   │
                                   ▼
                           [ Marketplace.Domain ]
```

1.  **Marketplace.Domain**: The core domain layer. It contains entities, enums, value objects, and base types. It has **zero external dependencies** and does not reference any other project.
2.  **Marketplace.Application**: The core business logic layer. It defines DTOs, service interfaces, data validators (FluentValidation), mapping rules (AutoMapper), and repository interfaces.
3.  **Marketplace.Infrastructure**: The implementation layer. It handles persistence (EF Core, SQL Server), generic repository instantiations, ASP.NET Identity stores, file storage services, and JWT token generation.
4.  **Marketplace.API**: The presentation layer. It manages controllers, HTTP route registration, global exception middlewares, Swagger documentation configurations, and DI mapping hooks.

### Directory Structures
*   **Domain**: `Entities/`, `Enums/`, `Common/`
*   **Application**: `DTOs/`, `Validators/`, `Mappings/`, `Interfaces/` (Persistence/Services), `Services/`
*   **Infrastructure**: `Persistence/` (DbContext, Configurations, Repositories), `Services/`
*   **API**: `Controllers/`, `Middleware/`, `Extensions/`

### Patterns & Core Concerns
*   **Repository Pattern**: Custom entities use `IGenericRepository<T>` to decouple EF Core queries from business services.
*   **Unit of Work**: Bundles all repository updates into transaction boundaries, committing changes atomically via `CompleteAsync()`.
*   **DTO Pattern**: Prevents domain entity exposure. All input parameters and API responses are translated through tailored Data Transfer Objects.
*   **AutoMapper**: Automates DTO mapping, reducing boilerplate code.
*   **FluentValidation**: Isolates validation rules from the business logic, executing rules automatically before requests reach controller actions.
*   **Global Exception Handling**: Custom middleware intercepts unhandled runtime exceptions, outputting RFC-compliant Problem Details formats with unique trace IDs.
*   **Dependency Injection**: Registers services using loose coupling with lifetime scopes (Scoped for database concerns, Singleton/Transient for helper services).

---

## 3. Technology Stack

| Component | Technology | Exact Version | Description |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | .NET Runtime | `8.0` (compiled with .NET 9.0 SDK) | Server execution environment |
| **Database Engine** | SQL Server | `2022 / LocalDB` | RDBMS |
| **Identity Management** | ASP.NET Core Identity | `8.0.0` (via EF stores) | User and role management |
| **Object-Relational Mapper** | Entity Framework Core | `8.0.0` | Database persistence |
| **SQL Server Driver** | EF Core SQL Server | `8.0.0` | SQL Server connectivity |
| **Authentication Token** | Microsoft JwtBearer | `8.0.0` | JWT Authentication middleware |
| **JWT Generation** | System.IdentityModel.Tokens.Jwt | `8.0.0` | Low-level token builder |
| **Object Mapping** | AutoMapper | `13.0.1` | DTO projection engine |
| **Data Validation** | FluentValidation DI | `11.9.2` | Input validation pipeline |
| **API Documentation** | Swashbuckle.AspNetCore | `6.6.2` | Swagger UI generation |

---

## 4. Database Schema & Relationships

The database is built on SQL Server using EF Core code-first mappings:

```
                  +-------------------+
                  |       Users       | (Identity)
                  +-------------------+
                     |  |  |  |  |  |
        +------------+  |  |  |  |  +-----------+
        |               |  |  |  +---------+    |
   (1:1)               /   |  \             \   | (1:Many)
        v             /    |   \             \  v
+-------------------+  |   |    \             +--------------------+
| CustomerProfiles  |  |   |     \            |   RefreshTokens    |
+-------------------+  |   |      \           +--------------------+
                       |   |       v
+-------------------+  |   |    +--------------------+
| ProviderProfiles  |<-+   |    |    UserWarnings    |
+-------------------+      |    +--------------------+
                           v
+-------------------+   +--------------------+
|  CompanyProfiles  |   |  SubmittedDocs     |
+-------------------+   +--------------------+
                           |
                        (Many:1)
                           v
                        +--------------------+
                        | SubscriptionPlans  |
                        +--------------------+
```

### Table Dictionary
1.  **Users**: Maps to `ApplicationUser` (storing standard Identity fields like hashes, concurrency tokens, lockout parameters, plus custom status fields and suspension details).
2.  **Roles**: Standard Identity roles (`Admin`, `Customer`, `Provider`, `Company`).
3.  **UserRoles**: Junction table joining Users to Roles.
4.  **CustomerProfiles**: One-to-one relationship with `Users`. Stores language preferences and addresses.
5.  **ProviderProfiles**: One-to-one relationship with `Users`. Stores bios, category, experience years, availability, and average ratings.
6.  **CompanyProfiles**: One-to-one relationship with `Users`. Stores corporate details (name, registration number, employee count).
7.  **VerificationDocuments**: Stores relative URL paths to uploaded documents, status (Pending, Approved, Rejected), and auditor comments. Relates 1-to-many with `Users`.
8.  **SubscriptionPlans**: Dynamic catalog containing plan name, description, cost, duration, and status.
9.  **Subscriptions**: Stores user membership instances, price paid, payment references, and active durations. Relates 1-to-many with `Users`.
10. **UserWarnings**: Moderation warnings issued to users, tracking title, reason, severity, and auditor admin GUID.
11. **RefreshTokens**: Tracks token rotation, expiration, and reuse revocation logs.

---

## 5. Authentication & Moderation Flow

### User Registration
1.  Frontend calls `POST /api/auth/register` with role specification.
2.  Identity creates `ApplicationUser` and hashes the password.
3.  Based on the requested role, a record is added to `CustomerProfiles`, `ProviderProfiles`, or `CompanyProfiles` inside a transaction block.
4.  **Initial Status Assignment**: Customers are set to `Active` immediately. Providers and Companies are set to `Pending` until they upload verification documents.

### User Login & Session Rotation
1.  User posts credentials to `POST /api/auth/login`.
2.  Service checks `user.Status`. If `Suspended` or `Inactive`, the login is rejected with a `400 Bad Request`.
3.  Password check is processed via `SignInManager`.
4.  Upon success, a JWT (expires in 15 mins) and a Refresh Token (expires in 7 days) are generated and returned.
5.  **Refresh Token Rotation (RTR)**: When rotating tokens via `POST /api/auth/refresh-token`, the old refresh token is marked as revoked. If a client attempts to reuse a revoked refresh token (replay attack), the service immediately terminates all active refresh tokens for that user ID, forcing them to log in again.

### Moderation (Warnings & Suspension)
*   **Warnings**: Admins issue compliance warnings. Each warning is saved in the database under `UserWarnings` with a severity index.
*   **Suspension**: Admins call `PUT /api/admin/users/{userId}/suspend`.
    1.  User status is updated to `Suspended`.
    2.  Suspension reason, date, and admin ID are recorded.
    3.  All active refresh tokens for the suspended user are immediately marked as revoked in the database.
    4.  Subsequent login and refresh attempts are blocked.

### Status Promotion
*   A `Pending` provider/company uploads documents (`POST /api/documents/upload`).
*   An admin approves the document (`PUT /api/admin/documents/{id}/approve`).
*   The system checks the user status. If status is `Pending`, it is promoted to `Active` (verified), enabling their marketplace capabilities.

---

## 6. REST API Endpoint Catalog

| HTTP Method | URL | Auth Required | Required Role | Request DTO | Response DTO | Expected HTTP Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | No | Anyone | `RegisterRequestDto` | `bool` | `200 OK`, `400 Bad Request` | Registers a new user and creates their profile. |
| **POST** | `/api/auth/login` | No | Anyone | `LoginRequestDto` | `LoginResponseDto` | `200 OK`, `400 Bad Request` | Authenticates user and returns JWT + Refresh Token. |
| **POST** | `/api/auth/refresh-token` | No | Anyone | `RefreshTokenRequestDto` | `LoginResponseDto` | `200 OK`, `400 Bad Request` | Rotates expired JWT using refresh tokens (with RTR security). |
| **GET** | `/api/profile` | Yes | Authenticated | None | `UserProfileDto` | `200 OK`, `401 Unauthorized` | Retrieves profile and role details. |
| **GET** | `/api/profile/me` | Yes | Authenticated | None | `UserCompleteInfoDto` | `200 OK`, `401 Unauthorized` | Retrieves extended account security info. |
| **PUT** | `/api/profile` | Yes | Authenticated | `UpdateProfileRequestDto` | `bool` | `200 OK`, `400 Bad Request` | Updates allowed profile properties. |
| **POST** | `/api/documents/upload` | Yes | Provider, Company | Multipart Form | `List<DocumentDto>` | `200 OK`, `400 Bad Request` | Uploads verification files (PDF/Images < 5MB). |
| **GET** | `/api/documents/my-documents` | Yes | Provider, Company | None | `List<DocumentDto>` | `200 OK`, `401 Unauthorized` | Lists user's own uploads. |
| **GET** | `/api/admin/documents/pending` | Yes | Admin | None | `List<DocumentDto>` | `200 OK`, `403 Forbidden` | Retrieves all documents awaiting review. |
| **PUT** | `/api/admin/documents/{id}/approve` | Yes | Admin | None | `bool` | `200 OK`, `404 NotFound` | Approves document (triggers status promotion). |
| **PUT** | `/api/admin/documents/{id}/reject` | Yes | Admin | `ReviewDocumentRequestDto` | `bool` | `200 OK`, `400 Bad Request` | Rejects document with audit reason comments. |
| **GET** | `/api/admin/users` | Yes | Admin | None (Query page) | `PaginatedListDto<AdminUserSummaryDto>` | `200 OK`, `403 Forbidden` | Lists all users with pagination. |
| **GET** | `/api/admin/users/{id}` | Yes | Admin | None | `AdminUserDetailDto` | `200 OK`, `404 NotFound` | Retrieves complete user information. |
| **GET** | `/api/admin/users/search` | Yes | Admin | `UserSearchFilterDto` (Query) | `PaginatedListDto<AdminUserSummaryDto>` | `200 OK`, `400 Bad Request` | Performs filtered, sorted, paginated search. |
| **POST** | `/api/admin/users/{userId}/warnings` | Yes | Admin | `CreateWarningDto` | `WarningDto` | `200 OK`, `404 NotFound` | Issues warning to a user. |
| **GET** | `/api/admin/users/{userId}/warnings` | Yes | Admin | None | `List<WarningDto>` | `200 OK`, `404 NotFound` | Lists warning logs of a user. |
| **DELETE**| `/api/admin/users/warnings/{warningId}`| Yes | Admin | None | `bool` | `200 OK`, `404 NotFound` | Retracts/deletes a warning record. |
| **PUT** | `/api/admin/users/{userId}/suspend` | Yes | Admin | `SuspendUserRequestDto` | `bool` | `200 OK`, `404 NotFound` | Suspends account and revokes active tokens. |
| **PUT** | `/api/admin/users/{userId}/unsuspend` | Yes | Admin | None | `bool` | `200 OK`, `404 NotFound` | Unsuspends user account. |
| **POST** | `/api/admin/subscriptions` | Yes | Admin | `CreateSubscriptionPlanDto` | `SubscriptionPlanDto` | `200 OK`, `400 Bad Request` | Adds a new subscription plan option. |
| **PUT** | `/api/admin/subscriptions/{id}` | Yes | Admin | `UpdateSubscriptionPlanDto` | `SubscriptionPlanDto` | `200 OK`, `404 NotFound` | Modifies an existing subscription plan. |
| **DELETE**| `/api/admin/subscriptions/{id}` | Yes | Admin | None | `bool` | `200 OK`, `404 NotFound` | Soft-deletes/deactivates a plan. |
| **GET** | `/api/subscriptions` | Yes | Authenticated | None | `List<SubscriptionPlanDto>` | `200 OK`, `401 Unauthorized` | Lists active plans. |
| **POST** | `/api/subscriptions/{subscriptionId}/subscribe` | Yes | Authenticated | None | `UserSubscriptionDto` | `200 OK`, `400 Bad Request` | Subscribes current user to a plan. |
| **GET** | `/api/subscriptions/my-subscription` | Yes | Authenticated | None | `UserSubscriptionDto` | `200 OK`, `204 NoContent` | Returns current user's subscription details. |

---

## 7. DTO Specifications

### Request DTOs
*   `RegisterRequestDto`: Emails (string, required), Password (string, required), FullName (string, required), Role (string: Customer/Provider/Company).
*   `LoginRequestDto`: Email (string, required), Password (string, required).
*   `RefreshTokenRequestDto`: AccessToken (string, required), RefreshToken (string, required).
*   `UpdateProfileRequestDto`: User-level fields (`FullName`, `PhoneNumber`) and role-specific profile details.
*   `ReviewDocumentRequestDto`: ReviewComments (string, required for rejection).
*   `UserSearchFilterDto`: SearchTerm, RoleFilter, StatusFilter, PageNumber (int), PageSize (int), SortBy (string), SortDescending (bool).
*   `CreateWarningDto`: Title (string), Reason (string), SeverityLevel (string: Low/Medium/High).
*   `SuspendUserRequestDto`: Reason (string).
*   `CreateSubscriptionPlanDto`: Name, Description, Price, DurationInDays, IsActive.
*   `UpdateSubscriptionPlanDto`: Name, Description, Price, DurationInDays, IsActive.

### Response DTOs
*   `LoginResponseDto`: AccessToken (JWT string), RefreshToken (GUID string), AccessTokenExpiresAt (DateTime).
*   `UserProfileDto`: FullName, Email, PhoneNumber, Role, Status, and matching role profile details.
*   `UserCompleteInfoDto`: Profile details plus security config (`TwoFactorEnabled`, `LockoutEnd`, etc.).
*   `DocumentDto`: Id, UserId, DocumentType, DocumentUrl, Status, ReviewComments, CreatedAt.
*   `AdminUserSummaryDto`: Id, FullName, Email, Role, Status, IsVerified (bool), CreatedAt.
*   `AdminUserDetailDto`: Complete user info, lockout attributes, profiles, and document uploads list.
*   `PaginatedListDto<T>`: Items list, PageIndex, TotalPages, TotalCount, Navigation booleans.
*   `WarningDto`: Id, UserId, IssuedBy, Title, Reason, SeverityLevel, CreatedAt.
*   `SubscriptionPlanDto`: Id, Name, Description, Price, DurationInDays, IsActive.
*   `UserSubscriptionDto`: Id, SubscriptionPlanId, PlanName, Status, StartDate, EndDate, PricePaid, PaymentReference.

---

## 8. Validation Rules (FluentValidation)

*   `RegisterRequestValidator`:
    *   `Email`: Required, valid email format, unique in database.
    *   `FullName`: Required, between 2 and 150 characters.
    *   `Password`: Required, minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 non-alphanumeric character.
    *   `Role`: Must be one of: `Customer`, `Provider`, `Company`.
*   `LoginRequestValidator`:
    *   `Email`: Required, valid format.
    *   `Password`: Required.
*   `UpdateProfileRequestValidator`:
    *   `FullName`: Required if supplied, max 150 characters.
    *   `PhoneNumber`: Required if supplied, matches international formats.
    *   `CustomerProfile`: Language max 10 chars.
    *   `ProviderProfile`: Bio max 1000 chars, category max 100, experience >= 0.
    *   `CompanyProfile`: Company name max 150, website URL format.
*   `UserSearchFilterValidator`:
    *   `PageNumber`: >= 1.
    *   `PageSize`: between 1 and 100.
    *   `SortBy`: restricted to: `CreatedAt`, `FullName`, `Email`, `Status` (blocks SQL injections).
*   `CreateWarningValidator`:
    *   `Title`: Required, max 200.
    *   `Reason`: Required, max 500.
    *   `SeverityLevel`: Must be `Low`, `Medium`, or `High`.
*   `SuspendUserRequestValidator`:
    *   `Reason`: Required, max 500.
*   `CreateSubscriptionPlanValidator` / `UpdateSubscriptionPlanValidator`:
    *   `Name`: Required, max 100.
    *   `Description`: Max 500.
    *   `Price`: >= 0.
    *   `DurationInDays`: >= 1.

---

## 9. Security Features

### A. JWT Configuration
Tokens are signed with a HMACSHA256 signature using a secure key. The token includes Claims:
*   `ClaimTypes.NameIdentifier` / `sub`: User GUID.
*   `ClaimTypes.Email`: User email.
*   `ClaimTypes.Role`: User role.
JWTs have a short lifetime (15 minutes) to mitigate token theft risk.

### B. Refresh Token Rotation (RTR)
*   Provides session persistence.
*   If a refresh token is used, it is invalidated immediately. A new refresh token is issued.
*   **Replay Attack Mitigation**: If a revoked refresh token is presented, the system assumes a token compromise occurred. It instantly revokes all active sessions for that user ID, forcing all client devices to log out.

### C. Suspension Controls
When a user is suspended:
*   `user.Status` is set to `Suspended`.
*   All active refresh tokens are revoked instantly in the database.
*   The authentication services block access on login and refresh attempts.

### D. File Upload Security
To prevent malicious script execution on our web server:
1.  **File Size Limits**: Enforced strictly at the controller level (max 5MB).
2.  **MIME/Extension Whitelisting**: Only `.pdf`, `.jpg`, `.jpeg`, and `.png` extensions are accepted.
3.  **Magic Byte Signature Verification**: Looks at the start bytes of the uploaded file stream to confirm the content matches the extension (e.g. `%PDF` for PDF, `FF D8` for JPEG) to prevent renamed scripts from being executed.
4.  **GUID Renaming**: Files are saved on disk named as randomly generated GUIDs inside `wwwroot/uploads/verification-documents/`, preventing path traversal attacks.

---

## 10. Project Configuration (`appsettings.json`)

The application's runtime options are configured inside `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MarketplaceDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "JwtSettings": {
    "Secret": "SuperSecure32ByteLongSecretKeyHereForHS256Signature",
    "Issuer": "MarketplaceAPI",
    "Audience": "MarketplaceClients",
    "ExpiryMinutes": 15
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Middleware Pipeline Execution Order
1.  `ExceptionHandlingMiddleware` (Intercepts all errors and maps to Problem Details).
2.  `UseRouting()`
3.  `UseAuthentication()` (Resolves Bearer JWT claims).
4.  `UseAuthorization()` (Enforces role policies).
5.  `UseEndpoints()`

---

## 11. Frontend Integration Guide

All authenticated requests must supply the Bearer JWT inside the HTTP Authorization header:

```http
Authorization: Bearer <AccessToken>
```

### API Integration Example: Upload Documents
*   **Method**: `POST`
*   **Endpoint**: `/api/documents/upload`
*   **Headers**:
    ```http
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    Content-Type: multipart/form-data
    ```
*   **Request Payload**:
    ```
    Form Fields:
      type: IDCard
      files: [binary file data]
    ```
*   **Response Payload (200 OK)**:
    ```json
    [
      {
        "id": "7d9b7f58-c2b2-4d1a-be10-09a8246cb4ef",
        "userId": "d6e8a5b2-32a1-43e9-98fd-8b3f6f1c4e72",
        "documentType": "IDCard",
        "documentUrl": "/uploads/verification-documents/8f2c3d5a-be11-4c12-bd88-02ea9e1a1234.pdf",
        "status": "Pending",
        "reviewedBy": null,
        "reviewComments": null,
        "createdAt": "2026-07-11T23:55:00Z"
      }
    ]
    ```

### Error Response Example (400 Bad Request)
Returned when payload validations fail:
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "00-845bc8df3b4421b8f102ca142e01a4e2-a4e92a831b-00",
  "errors": {
    "Password": [
      "Password must contain at least 1 uppercase letter.",
      "Password must be at least 8 characters long."
    ]
  }
}
```

---

## 12. Testing Guide (Swagger & Postman)

### Step-by-Step QA Manual Testing Flow
1.  **Register a User**:
    *   Call `POST /api/auth/register` with role `Provider`.
    *   Assert status is `200 OK` (true).
2.  **Authenticate**:
    *   Call `POST /api/auth/login` using the registered credentials.
    *   Assert status `200 OK`, copy `accessToken` and `refreshToken` fields.
3.  **Access Profiles**:
    *   Add Bearer JWT token in Swagger/Postman headers.
    *   Call `GET /api/profile/me`. Assert status is `200 OK` and `Status` is `Pending`.
4.  **Upload Documents**:
    *   Call `POST /api/documents/upload` using `multipart/form-data` with `type: IDCard` and attach a file.
    *   Assert `200 OK` and copy the returned `id` (Document Guid).
5.  **Admin Review**:
    *   Log in as an administrator to obtain an admin token. Set as Bearer header.
    *   Call `PUT /api/admin/documents/{id}/approve` using the document GUID. Assert status `200 OK`.
6.  **Verify Promotion**:
    *   Re-authenticate as the provider user and call `GET /api/profile`.
    *   Assert that `Status` has been promoted to `Active`.
7.  **Test Suspension Security**:
    *   As Admin, call `PUT /api/admin/users/{userId}/suspend` on the provider user. Assert `200 OK`.
    *   Attempt to call `POST /api/auth/refresh-token` or `POST /api/auth/login` with the provider credentials.
    *   Assert that the server rejects access with `400 Bad Request` or `InvalidOperationException`.

---

## 13. Deployment Requirements

*   **Runtime Environment**: Install the .NET 8.0 Hosting Bundle or .NET 8.0 SDK.
*   **RDBMS Server**: SQL Server 2019+ or LocalDB (development environment).
*   **Database Initial Setup**: Run Entity Framework migrations to seed tables:
    ```powershell
    dotnet ef database update --project src/Marketplace.Infrastructure --startup-project src/Marketplace.API
    ```
*   **Required Configurations**:
    *   Set production Connection String inside environment variables or appsettings.
    *   Set `JwtSettings:Secret` to a secure 256-bit key in Azure/AWS App Config or OS environment variables.

---

## 14. Future Improvements

1.  **Logging Service (Serilog)**: Replace console logging with Serilog to sink logs to Elasticsearch, Seq, or AWS CloudWatch.
2.  **Distributed Caching (Redis)**: Cache user profiles and active subscription states to decrease SQL Server read pressure.
3.  **Rate Limiting**: Protect endpoints against brute-force attacks by introducing ASP.NET Core Rate Limiting Middleware.
4.  **Containerization (Docker)**: Implement a multi-stage Dockerfile to containerize the API.
5.  **Background Tasks (Hangfire)**: Set up Hangfire jobs to scan and expire subscriptions nightly.
6.  **CI/CD Pipelines**: Build GitHub Actions or GitLab CI configurations to automate unit testing, linting, and container deployment.
