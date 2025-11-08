namespace Api.Models;

public class UploadResult
{
    public string Id { get; set; } = null!;
    public string Url { get; set; } = null!;
    public DateTime CreatedAtUtc { get; set; }
}

public class ImageListItem
{
    public string Id { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public DateTime CreatedAtUtc { get; set; }
}