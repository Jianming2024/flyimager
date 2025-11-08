using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Api.Services;

/// <summary>
/// Abstraction over image storage (e.g. S3/Tigris).
/// </summary>
public interface IImageStorageService
{
    Task UploadAsync(
        string key,
        Stream content,
        string contentType,
        CancellationToken ct = default);

    Task<(Stream Content, string ContentType)?> GetAsync(
        string key,
        CancellationToken ct = default);

    Task DeleteAsync(
        string key,
        CancellationToken ct = default);
}