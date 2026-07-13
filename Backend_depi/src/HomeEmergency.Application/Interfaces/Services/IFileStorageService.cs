using System.IO;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Files;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IFileStorageService
{
    Task<string> SaveProtectedFileAsync(Stream fileStream, string fileName, string folderName);
    Task<string> SavePublicFileAsync(Stream fileStream, string fileName, string folderName);
    Task<StoredFileDownloadDto> OpenReadAsync(string storedPath);
    void DeleteFile(string storedPath);
    bool ValidateFileSignature(Stream fileStream, string expectedExtension);
}

