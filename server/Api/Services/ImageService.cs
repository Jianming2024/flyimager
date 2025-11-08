using Api.Models;
using DataAccess;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class ImageService : IImageService
{
    private readonly AppDbContext _db;
    private readonly IImageStorageService _storage;

    public ImageService(AppDbContext db, IImageStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    public async Task<UploadResult> UploadAsync(
        IFormFile file,
        string userId,
        CancellationToken ct = default)
    {
        if (file.Length == 0)
        {
            throw new InvalidOperationException("File is empty.");
        }

        var entity = new ImageFile
        {
            UploaderUserId = userId,
            FileName = file.FileName,
            ContentType = file.ContentType,
            UploadAtUtc = DateTime.UtcNow
        };

        _db.ImageFiles.Add(entity);
        await _db.SaveChangesAsync(ct);

        await using var stream = file.OpenReadStream();
        await _storage.UploadAsync(entity.Id, stream, file.ContentType, ct);

        return new UploadResult
        {
            Id = entity.Id,
            Url = $"/api/images/{entity.Id}",
            CreatedAtUtc = entity.UploadAtUtc
        };
    }

    public async Task<IReadOnlyList<ImageListItem>> ListAsync(
        string userId,
        int page,
        int pageSize,
        string? q,
        string? sort,
        CancellationToken ct = default)
    {
        var query = _db.ImageFiles.AsNoTracking()
            .Where(x => x.UploaderUserId == userId);

        if (!string.IsNullOrWhiteSpace(q))
        {
            query = query.Where(x => x.FileName.Contains(q));
        }

        query = sort switch
        {
            "createdAt" => query.OrderBy(x => x.UploadAtUtc),
            "-createdAt" or null or "" => query.OrderByDescending(x => x.UploadAtUtc),
            _ => query.OrderByDescending(x => x.UploadAtUtc)
        };

        var skip = (page - 1) * pageSize;

        var items = await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(ct);

        return items
            .Select(x => new ImageListItem
            {
                Id = x.Id,
                FileName = x.FileName,
                CreatedAtUtc = x.UploadAtUtc
            })
            .ToList();
    }

    public async Task<(Stream Content, string ContentType)?> GetContentAsync(
        string id,
        CancellationToken ct = default)
    {
        var entity = await _db.ImageFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (entity is null)
        {
            return null;
        }

        var storage = await _storage.GetAsync(entity.Id, ct);
        if (storage is null)
        {
            return null;
        }

        return (storage.Value.Content, entity.ContentType);
    }

    public async Task<bool> DeleteAsync(
        string id,
        string userId,
        CancellationToken ct = default)
    {
        var entity = await _db.ImageFiles.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
        {
            return false;
        }

        if (entity.UploaderUserId != userId)
        {
            throw new UnauthorizedAccessException("You are not allowed to delete this image.");
        }

        _db.ImageFiles.Remove(entity);
        await _db.SaveChangesAsync(ct);

        await _storage.DeleteAsync(entity.Id, ct);
        return true;
    }
}
