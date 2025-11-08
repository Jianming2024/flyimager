using Amazon.S3;
using Amazon.S3.Model;
using Api.Services;
using Microsoft.Extensions.Options;

namespace Api.Services;

/// <summary>
/// Stores images in an S3-compatible object storage (e.g. Fly.io Tigris).
/// </summary>
public class S3ImageStorageService : IImageStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3ImageStorageService(IOptions<S3Options> options)
    {
        var opt = options.Value;

        _bucketName = opt.BucketName;

        _s3Client = new AmazonS3Client(
            opt.AwsAccessKeyId,
            opt.AwsSecretAccessKey,
            new AmazonS3Config
            {
                ServiceURL = opt.AwsEndpointUrlS3,
                UseHttp = false
            });
    }

    public async Task UploadAsync(
        string key,
        Stream content,
        string contentType,
        CancellationToken ct = default)
    {
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            UseChunkEncoding = false
        };

        await _s3Client.PutObjectAsync(request, ct);
    }

    public async Task<(Stream Content, string ContentType)?> GetAsync(
        string key,
        CancellationToken ct = default)
    {
        try
        {
            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            var response = await _s3Client.GetObjectAsync(request, ct);

            return (response.ResponseStream, response.Headers.ContentType);
        }
        catch (AmazonS3Exception ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }

            throw;
        }
    }

    public async Task DeleteAsync(
        string key,
        CancellationToken ct = default)
    {
        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = key
        };

        await _s3Client.DeleteObjectAsync(request, ct);
    }
}
