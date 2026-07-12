using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HomeEmergency.Application.DTOs.Verification;
using HomeEmergency.Application.Interfaces.Services;

namespace HomeEmergency.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/documents")]
public class AdminDocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public AdminDocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    /// <summary>
    /// Retrieves all pending verification documents in the system.
    /// </summary>
    /// <returns>A list of pending documents.</returns>
    [HttpGet("pending")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<DocumentDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPendingDocuments()
    {
        var documents = await _documentService.GetPendingDocumentsAsync();
        return Ok(documents);
    }

    /// <summary>
    /// Approves an uploaded verification document and promotes the user's status to Active if applicable.
    /// </summary>
    /// <param name="id">The GUID identifier of the document.</param>
    /// <returns>True if approval succeeds.</returns>
    [HttpPut("{id}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveDocument(Guid id)
    {
        var adminId = GetAdminUserId();
        var result = await _documentService.ApproveDocumentAsync(id, adminId);
        return Ok(result);
    }

    /// <summary>
    /// Rejects an uploaded verification document and logs the rejection reasons.
    /// </summary>
    /// <param name="id">The GUID identifier of the document.</param>
    /// <param name="request">Rejection comment parameters.</param>
    /// <returns>True if rejection succeeds.</returns>
    [HttpPut("{id}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectDocument(Guid id, [FromBody] ReviewDocumentRequestDto request)
    {
        var adminId = GetAdminUserId();
        var result = await _documentService.RejectDocumentAsync(id, adminId, request);
        return Ok(result);
    }

    private Guid GetAdminUserId()
    {
        var adminIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(adminIdString) || !Guid.TryParse(adminIdString, out var adminId))
        {
            throw new UnauthorizedAccessException("Administrator is not authenticated.");
        }

        return adminId;
    }
}

