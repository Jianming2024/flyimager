using Api.Models;
using Microsoft.AspNetCore.Http;

namespace Api.Services;

public interface IImageService
{
    Task<UploadResult> UploadAsync(
        IFormFile file,
        string userId,
        CancellationToken ct = default);

    Task<IReadOnlyList<ImageListItem>> ListAsync(
        string userId,
        int page,
        int pageSize,
        string? q,
        string? sort,
        CancellationToken ct = default);

    Task<(Stream Content, string ContentType)?> GetContentAsync(
        string id,
        CancellationToken ct = default);

    /// <summary>
    /// Returns true if image was deleted, false if not found.
    /// </summary>
    Task<bool> DeleteAsync(
        string id,
        string userId,
        CancellationToken ct = default);
}