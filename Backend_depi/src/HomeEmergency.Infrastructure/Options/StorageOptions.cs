namespace HomeEmergency.Infrastructure.Options;

public class StorageOptions
{
    public const string SectionName = "Storage";

    public string RootPath { get; set; } = "App_Data";
    public string VerificationFolder { get; set; } = "verification-documents";
    public string AdvertisementFolder { get; set; } = "advertisements";
}
