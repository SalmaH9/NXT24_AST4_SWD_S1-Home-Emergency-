using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Files;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Infrastructure.Options;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;

namespace HomeEmergency.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _rootFolder;
    private readonly string _publicFolder;
    private readonly string _verificationFolder;
    private readonly FileExtensionContentTypeProvider _contentTypeProvider = new();

    public LocalFileStorageService(IOptions<StorageOptions> options)
    {
        var storageOptions = options.Value;
        _rootFolder = Path.Combine(Directory.GetCurrentDirectory(), storageOptions.RootPath);
        _publicFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        _verificationFolder = storageOptions.VerificationFolder;

        Directory.CreateDirectory(_rootFolder);
        Directory.CreateDirectory(_publicFolder);
    }

    public async Task<string> SaveProtectedFileAsync(Stream fileStream, string fileName, string folderName)
    {
        return await SaveFileInternalAsync(fileStream, fileName, folderName, _rootFolder, isPublic: false);
    }

    public async Task<string> SavePublicFileAsync(Stream fileStream, string fileName, string folderName)
    {
        return await SaveFileInternalAsync(fileStream, fileName, folderName, _publicFolder, isPublic: true);
    }

    public Task<StoredFileDownloadDto> OpenReadAsync(string storedPath)
    {
        if (string.IsNullOrWhiteSpace(storedPath))
        {
            throw new FileNotFoundException("Stored file path is missing.");
        }

        var normalizedPath = NormalizeStoredPath(storedPath);
        var absolutePath = ResolveAbsolutePath(normalizedPath);

        if (!File.Exists(absolutePath))
        {
            throw new FileNotFoundException("Stored file not found.");
        }

        if (!_contentTypeProvider.TryGetContentType(absolutePath, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return Task.FromResult(new StoredFileDownloadDto
        {
            Content = new FileStream(absolutePath, FileMode.Open, FileAccess.Read, FileShare.Read),
            ContentType = contentType,
            DownloadFileName = Path.GetFileName(absolutePath)
        });
    }

    public void DeleteFile(string storedPath)
    {
        if (string.IsNullOrWhiteSpace(storedPath))
        {
            return;
        }

        var normalizedPath = NormalizeStoredPath(storedPath);
        var absolutePath = ResolveAbsolutePath(normalizedPath);

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

    private async Task<string> SaveFileInternalAsync(Stream fileStream, string fileName, string folderName, string baseFolder, bool isPublic)
    {
        var cleanFileName = Path.GetFileName(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(cleanFileName)}";
        var safeFolderName = Path.GetFileName(folderName);
        var targetDirectory = Path.Combine(baseFolder, safeFolderName);

        if (!Directory.Exists(targetDirectory))
        {
            Directory.CreateDirectory(targetDirectory);
        }

        var filePath = Path.Combine(targetDirectory, uniqueFileName);

        using (var destinationStream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(destinationStream);
        }

        return isPublic
            ? $"/uploads/{safeFolderName}/{uniqueFileName}"
            : $"{safeFolderName}/{uniqueFileName}";
    }

    private string NormalizeStoredPath(string storedPath)
    {
        return storedPath.Replace('\\', '/').TrimStart('/');
    }

    private string ResolveAbsolutePath(string normalizedPath)
    {
        var candidatePath = normalizedPath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase)
            ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", normalizedPath.Replace('/', Path.DirectorySeparatorChar))
            : Path.Combine(_rootFolder, normalizedPath.Replace('/', Path.DirectorySeparatorChar));

        var fullPath = Path.GetFullPath(candidatePath);
        var allowedRoot = normalizedPath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase)
            ? Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads"))
            : Path.GetFullPath(_rootFolder);

        if (!fullPath.StartsWith(allowedRoot, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Invalid file path.");
        }

        if (normalizedPath.StartsWith(_verificationFolder, StringComparison.OrdinalIgnoreCase) ||
            normalizedPath.StartsWith("uploads/verification-documents", StringComparison.OrdinalIgnoreCase))
        {
            return fullPath;
        }

        return fullPath;
    }
}

