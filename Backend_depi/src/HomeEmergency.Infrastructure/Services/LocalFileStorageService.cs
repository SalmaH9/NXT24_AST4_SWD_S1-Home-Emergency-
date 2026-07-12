using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using HomeEmergency.Application.Interfaces.Services;

namespace HomeEmergency.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadFolder;

    public LocalFileStorageService()
    {
        // Default local path, typically wwwroot/uploads
        _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        
        if (!Directory.Exists(_uploadFolder))
        {
            Directory.CreateDirectory(_uploadFolder);
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderName)
    {
        var cleanFileName = Path.GetFileName(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(cleanFileName)}";
        var targetDirectory = Path.Combine(_uploadFolder, folderName);

        if (!Directory.Exists(targetDirectory))
        {
            Directory.CreateDirectory(targetDirectory);
        }

        var filePath = Path.Combine(targetDirectory, uniqueFileName);

        using (var destinationStream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(destinationStream);
        }

        // Returns relative URL to access the file
        return $"/uploads/{folderName}/{uniqueFileName}";
    }

    public void DeleteFile(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl)) return;

        // Extract relative file path from URL
        var relativePath = fileUrl.Replace("/", Path.DirectorySeparatorChar.ToString()).TrimStart(Path.DirectorySeparatorChar);
        var absolutePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

        if (File.Exists(absolutePath))
        {
            File.Delete(absolutePath);
        }
    }

    public bool ValidateFileSignature(Stream fileStream, string expectedExtension)
    {
        // Simple magic bytes verification mapping for standard graduation project documents
        var signatures = new Dictionary<string, byte[][]>
        {
            { ".pdf", new[] { new byte[] { 0x25, 0x50, 0x44, 0x46 } } }, // %PDF
            { ".png", new[] { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
            { ".jpg", new[] { new byte[] { 0xFF, 0xD8, 0xFF } } },
            { ".jpeg", new[] { new byte[] { 0xFF, 0xD8, 0xFF } } }
        };

        var ext = expectedExtension.ToLower();
        if (!signatures.ContainsKey(ext)) return false;

        var maxSignatureLength = 8;
        var buffer = new byte[maxSignatureLength];
        var bytesRead = fileStream.Read(buffer, 0, maxSignatureLength);
        
        // Reset stream position so it can be read again for saving
        fileStream.Position = 0;

        foreach (var signature in signatures[ext])
        {
            if (bytesRead < signature.Length) continue;

            var matches = true;
            for (var i = 0; i < signature.Length; i++)
            {
                if (buffer[i] != signature[i])
                {
                    matches = false;
                    break;
                }
            }
            if (matches) return true;
        }

        return false;
    }
}

