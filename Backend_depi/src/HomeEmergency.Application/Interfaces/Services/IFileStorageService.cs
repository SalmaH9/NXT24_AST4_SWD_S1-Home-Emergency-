using System.IO;
using System.Threading.Tasks;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderName);
    void DeleteFile(string fileUrl);
    bool ValidateFileSignature(Stream fileStream, string expectedExtension);
}

