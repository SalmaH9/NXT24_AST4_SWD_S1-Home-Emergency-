namespace HomeEmergency.Domain.Enums;

public enum NotificationType
{
    ServiceRequestCreated = 1,
    ProviderAccepted = 2,
    ExaminationSubmitted = 3,
    ExaminationAccepted = 4,
    ExaminationRejected = 5,
    NewMessage = 6,
    SubscriptionExpiring = 7,
    SubscriptionExpired = 8,
    VerificationApproved = 9,
    VerificationRejected = 10,
    WarningIssued = 11,
    AccountSuspended = 12,
    AdvertisementApproved = 13,
    AdvertisementRejected = 14,
    AdvertisementExpiring = 15,
    System = 16
}
