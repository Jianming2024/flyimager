using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess;

public class ImageSharing
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public string Id { get; set; } = null!;
    public string UploaderUserId { get; set; } = null!;
    public string ObjectKey { get; set; } = null!; // S3/Tigris key
    public string FileName { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}