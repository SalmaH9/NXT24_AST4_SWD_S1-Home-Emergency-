using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HomeEmergency.Application.DTOs.Verification;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.API.Controllers;

[Authorize(Roles = "Provider,Company")]
[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private const long MaxFileSizeInBytes = 5 * 1024 * 1024; // 5MB

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    /// <summary>
    /// Uploads one or more verification documents (PDF, JPG, JPEG, PNG).
    /// </summary>
    /// <param name="type">The type of verification document being uploaded.</param>
    /// <param name="files">The collection of files to upload.</param>
    /// <returns>A list of uploaded document metadata.</returns>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<DocumentDto>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UploadDocuments([FromForm] DocumentType type, [FromForm] IFormFileCollection files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest("No files were uploaded.");
        }

        var userId = GetUserId();
        var uploadedDocs = new List<DocumentDto>();

        foreach (var file in files)
        {
            // 1. Enforce file size check
            if (file.Length > MaxFileSizeInBytes)
            {
                return BadRequest($"File '{file.FileName}' exceeds the maximum allowed size of 5MB.");
            }

            // 2. Open stream and save
            using (var stream = file.OpenReadStream())
            {
                var docDto = await _documentService.UploadDocumentAsync(userId, stream, file.FileName, type);
                uploadedDocs.Add(docDto);
            }
        }

        return Ok(uploadedDocs);
    }

    /// <summary>
    /// Retrieves all verification documents uploaded by the currently authenticated user.
    /// </summary>
    /// <returns>A list of user documents.</returns>
    [HttpGet("my-documents")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<DocumentDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMyDocuments()
    {
        var userId = GetUserId();
        var documents = await _documentService.GetUserDocumentsAsync(userId);
        return Ok(documents);
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        return userId;
    }
}

