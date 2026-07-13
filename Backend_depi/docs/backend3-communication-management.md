# Backend 3 Communication Management

## Implemented modules

- Solution repair and workspace safety foundations
- Consistent exception handling and FluentValidation execution through MVC
- Current user abstraction
- Development-only admin bootstrap
- Protected verification-document download flow
- Refresh-token hashing with legacy-token compatibility
- Chats and messages
- SignalR chat and notification hubs
- Persistent notifications
- Ratings
- Advertisements
- AI conversation history
- Admin dashboard APIs
- Analytics APIs
- Focused automated tests

## Architecture

- Domain entities and enums live in `HomeEmergency.Domain`
- DTOs, validators, and service interfaces live in `HomeEmergency.Application`
- EF Core persistence, service implementations, and design-time factory live in `HomeEmergency.Infrastructure`
- Controllers, middleware, filters, and SignalR hubs live in `HomeEmergency.API`

## Entities

- `Chat`
- `ChatParticipant`
- `Message`
- `Notification`
- `Rating`
- `Advertisement`
- `AdvertisementCategory`
- `AIConversation`
- `AIMessage`

## Relationships

- `Chat` 1..n `ChatParticipant`
- `Chat` 1..n `Message`
- `ApplicationUser` 1..n `Notification`
- `ApplicationUser` 1..n `Rating` as sender and receiver
- `ProviderProfile` 1..n `Rating`
- `ApplicationUser` 1..n `Advertisement`
- `Advertisement` 1..n `AdvertisementCategory`
- `ApplicationUser` 1..n `AIConversation`
- `AIConversation` 1..n `AIMessage`

## Enums

- `ChatType`
- `MessageType`
- `NotificationType`
- `NotificationReferenceType`
- `RatingStage`
- `AdvertisementStatus`
- `AIMessageRole`

## API endpoints

### Auth and shared safety

- `GET /api/documents/{id}/download`
- `GET /api/admin/documents/{id}/download`

### Chats

- `POST /api/chats`
- `GET /api/chats`
- `GET /api/chats/{chatId}`
- `GET /api/chats/{chatId}/messages`
- `POST /api/chats/{chatId}/messages`
- `PUT /api/chats/{chatId}/messages/{messageId}`
- `DELETE /api/chats/{chatId}/messages/{messageId}`
- `POST /api/chats/{chatId}/read`

### Notifications

- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PUT /api/notifications/{id}/read`
- `PUT /api/notifications/read-all`
- `POST /api/admin/notifications`

### Ratings

- `POST /api/ratings`
- `GET /api/ratings/received`
- `GET /api/ratings/given`
- `GET /api/providers/{providerId}/ratings`
- `GET /api/users/{userId}/rating-summary`

### Advertisements

- `POST /api/advertisements`
- `GET /api/advertisements/my`
- `GET /api/advertisements/{id}`
- `PUT /api/advertisements/{id}`
- `DELETE /api/advertisements/{id}`
- `POST /api/advertisements/{id}/submit`
- `GET /api/advertisements/active`
- `GET /api/advertisements/category/{categoryId}`
- `GET /api/admin/advertisements`
- `PUT /api/admin/advertisements/{id}/approve`
- `PUT /api/admin/advertisements/{id}/reject`
- `PUT /api/admin/advertisements/{id}/cancel`

### AI history

- `POST /api/ai-conversations`
- `GET /api/ai-conversations`
- `GET /api/ai-conversations/{id}`
- `POST /api/ai-conversations/{id}/messages`
- `PUT /api/ai-conversations/{id}/archive`

### Admin dashboard

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/dashboard/recent-activity`
- `GET /api/admin/dashboard/user-growth`
- `GET /api/admin/dashboard/rating-overview`
- `GET /api/admin/dashboard/advertisement-overview`
- `GET /api/admin/dashboard/communication-overview`

### Analytics

- `GET /api/admin/analytics/users`
- `GET /api/admin/analytics/communications`
- `GET /api/admin/analytics/ratings`
- `GET /api/admin/analytics/advertisements`
- `GET /api/admin/analytics/ai`
- `GET /api/admin/analytics/service-demand`

## Authentication and roles

- JWT bearer auth is required for all protected endpoints
- SignalR hubs accept JWT in the `access_token` query string
- Roles used: `Admin`, `Customer`, `Provider`, `Company`

## SignalR hub usage

- Chat hub: `/hubs/chat`
- Notification hub: `/hubs/notifications`
- `ChatHub.JoinChat(chatId)` joins only if the caller is an active chat participant
- Notification hub auto-joins a per-user group on connect

## Notification integration usage

- New chat messages trigger `NewMessage`
- Document approval/rejection triggers verification notifications
- Warning creation triggers `WarningIssued`
- Suspension triggers `AccountSuspended`
- Advertisement approval/rejection triggers advertisement notifications

## Advertisement status flow

- Company creates `Draft`
- Company submits `Pending`
- Admin approves to effective `Scheduled` or `Active` based on dates
- Admin rejects to `Rejected`
- Admin or owner cancel to `Cancelled`
- End date moves approved ads to effective `Expired` at query time

## Rating eligibility rules

- Sender cannot rate themselves
- Rating value must be from 1 to 5
- Duplicate ratings for the same sender, receiver, service reference, and stage are blocked
- Because service-request and service-execution modules are not present in this repository, deep completion validation is deferred to future integration

## AI history integration contract

- The backend persists conversation headers and messages only
- No fake AI response generation is performed
- External AI modules should call the AI conversation endpoints or service layer and store both user and assistant messages

## Admin dashboard response structure

- Summary endpoint returns counts for users, subscriptions, advertisements, chats, messages, ratings, warnings, AI conversations, and verification workload
- Overview endpoints return compact aggregate DTOs for their area

## Analytics filters

- Supported query parameters: `from`, `to`, `groupBy`
- Current implementation validates date ranges
- `service-demand` returns a documented empty result because the repository has no service-request/location model

## Configuration keys

- `ConnectionStrings__DefaultConnection`
- `JwtSettings__Secret`
- `JwtSettings__Issuer`
- `JwtSettings__Audience`
- `JwtSettings__ExpiryInMinutes`
- `SeedAdmin__Enabled`
- `SeedAdmin__Email`
- `SeedAdmin__Password`
- `SeedAdmin__FullName`
- `Storage__RootPath`
- `Storage__VerificationFolder`
- `Storage__AdvertisementFolder`

## Migration

- `AddCommunicationManagementModules`

## Local run commands

```powershell
dotnet restore HomeEmergency.sln
dotnet build HomeEmergency.sln
dotnet ef migrations list --project src/HomeEmergency.Infrastructure --startup-project src/HomeEmergency.API
dotnet run --project src/HomeEmergency.API
```

## Test commands

```powershell
dotnet test HomeEmergency.sln
```

## Known limitations

- The repository does not contain `ServiceRequest`, `ServiceExecution`, `Examination`, `ServiceCategory`, provider-acceptance, tracking, or location entities.
- Chat, rating, advertisement-category, and analytics integration therefore use nullable external reference IDs and documented seams instead of hard foreign keys to missing modules.
- Advertisement categories are stored as raw `Guid` references until the service-category module exists.
- Real-time broadcast delivery is prepared with hubs, but REST remains the source of truth.
- The project still references `AutoMapper 13.0.1`, which `dotnet restore/build/test` reports as having a known high-severity advisory.

## Future integration points

- Replace raw external IDs with foreign keys once service-request, execution, examination, and category modules are merged
- Add domain-driven eligibility checks for ratings and provider-provider chats once request/examination participation data exists
- Broadcast persisted chat and notification events from controllers/services to SignalR clients
