using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ImagesController : ControllerBase
{
    private readonly IImageService _imageService;
    private readonly ILogger<ImagesController> _logger;

    public ImagesController(IImageService imageService, ILogger<ImagesController> logger)
    {
        _imageService = imageService;
        _logger = logger;
    }

    /// <summary>
    /// POST /api/images
    /// Upload an image (multipart/form-data, field name "file").
    /// </summary>
    [HttpPost]
    [Authorize]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UploadResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<UploadResult>> Upload([FromForm] IFormFile? file, CancellationToken ct)
    {
        if (file is null)
        {
            return BadRequest("File is required.");
        }

        var userId = User.FindFirst("sub")?.Value ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _imageService.UploadAsync(file, userId, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Upload failed");
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// GET /api/images
    /// List images for current user.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<ImageListItem>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ImageListItem>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? sort = "-createdAt",
        CancellationToken ct = default)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var items = await _imageService.ListAsync(userId, page, pageSize, q, sort, ct);
        return Ok(items);
    }

    /// <summary>
    /// GET /api/images/{id}
    /// Return the image binary.
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous] // or [Authorize] if you want to restrict viewing
    public async Task<IActionResult> Get(string id, CancellationToken ct)
    {
        var result = await _imageService.GetContentAsync(id, ct);
        if (result is null)
        {
            return NotFound();
        }

        var (content, contentType) = result.Value;
        return File(content, contentType);
    }

    /// <summary>
    /// DELETE /api/images/{id}
    /// Delete an image (only uploader can delete).
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        try
        {
            var deleted = await _imageService.DeleteAsync(id, userId, ct);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
