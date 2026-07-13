using System.IO;

namespace HomeEmergency.Application.DTOs.Files;

public class StoredFileDownloadDto
{
    public Stream Content { get; set; } = Stream.Null;
    public string ContentType { get; set; } = "application/octet-stream";
    public string DownloadFileName { get; set; } = "file";
}
