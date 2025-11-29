using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class BlobStorageService : IBlobStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName;
        private readonly ILogger<BlobStorageService> _logger;

        public BlobStorageService(IConfiguration configuration, ILogger<BlobStorageService> logger)
        {
            var connectionString = configuration["AzureBlobStorage:ConnectionString"];
            _containerName = configuration["AzureBlobStorage:ContainerName"] ?? "assets";
            _blobServiceClient = new BlobServiceClient(connectionString);
            _logger = logger;
        }

        public async Task<string> UploadFileAsync(IFormFile file, string folder, string? fileName = null)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File cannot be null or empty");
            }

            ValidateFolder(folder);

            // Generate unique filename if not provided
            if (string.IsNullOrEmpty(fileName))
            {
                var extension = Path.GetExtension(file.FileName);
                fileName = $"{Guid.NewGuid()}{extension}";
            }

            var blobName = $"{folder}/{fileName}";

            try
            {
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

                var blobClient = containerClient.GetBlobClient(blobName);

                using var stream = file.OpenReadStream();
                var uploadOptions = new BlobUploadOptions
                {
                    HttpHeaders = new BlobHttpHeaders
                    {
                        ContentType = file.ContentType
                    },
                    Metadata = new Dictionary<string, string>
                    {
                        { "OriginalFileName", file.FileName },
                        { "UploadedAt", DateTime.UtcNow.ToString("O") },
                        { "Folder", folder }
                    }
                };

                await blobClient.UploadAsync(stream, uploadOptions);

                _logger.LogInformation("File uploaded successfully: {BlobName}", blobName);

                // Return the blob URL (without SAS token for now)
                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file to blob storage: {FileName}", fileName);
                throw;
            }
        }

        public async Task<string> UploadFileAsync(Stream stream, string folder, string fileName, string contentType)
        {
            if (stream == null || stream.Length == 0)
            {
                throw new ArgumentException("Stream cannot be null or empty");
            }

            ValidateFolder(folder);

            var blobName = $"{folder}/{fileName}";

            try
            {
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

                var blobClient = containerClient.GetBlobClient(blobName);

                var uploadOptions = new BlobUploadOptions
                {
                    HttpHeaders = new BlobHttpHeaders
                    {
                        ContentType = contentType
                    },
                    Metadata = new Dictionary<string, string>
                    {
                        { "UploadedAt", DateTime.UtcNow.ToString("O") },
                        { "Folder", folder }
                    }
                };

                stream.Position = 0; // Reset stream position
                await blobClient.UploadAsync(stream, uploadOptions);

                _logger.LogInformation("File uploaded successfully: {BlobName}", blobName);

                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading stream to blob storage: {FileName}", fileName);
                throw;
            }
        }

        public async Task<bool> DeleteFileAsync(string fileUrl)
        {
            try
            {
                var uri = new Uri(fileUrl);
                var blobName = uri.AbsolutePath.TrimStart('/');
                
                // Remove container name from blob name if it's included
                if (blobName.StartsWith(_containerName + "/"))
                {
                    blobName = blobName.Substring(_containerName.Length + 1);
                }

                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                var blobClient = containerClient.GetBlobClient(blobName);

                var response = await blobClient.DeleteIfExistsAsync();
                
                if (response.Value)
                {
                    _logger.LogInformation("File deleted successfully: {BlobName}", blobName);
                }
                else
                {
                    _logger.LogWarning("File not found for deletion: {BlobName}", blobName);
                }

                return response.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file from blob storage: {FileUrl}", fileUrl);
                return false;
            }
        }

        public async Task<bool> DeleteFileAsync(string folder, string fileName)
        {
            ValidateFolder(folder);

            var blobName = $"{folder}/{fileName}";

            try
            {
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                var blobClient = containerClient.GetBlobClient(blobName);

                var response = await blobClient.DeleteIfExistsAsync();

                if (response.Value)
                {
                    _logger.LogInformation("File deleted successfully: {BlobName}", blobName);
                }
                else
                {
                    _logger.LogWarning("File not found for deletion: {BlobName}", blobName);
                }

                return response.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file from blob storage: {BlobName}", blobName);
                return false;
            }
        }

        public async Task<string> GetFileUrlWithSasTokenAsync(string folder, string fileName, int expiryHours = 24)
        {
            ValidateFolder(folder);

            var blobName = $"{folder}/{fileName}";

            try
            {
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                var blobClient = containerClient.GetBlobClient(blobName);

                // Check if blob exists
                if (!await blobClient.ExistsAsync())
                {
                    throw new FileNotFoundException($"File not found: {blobName}");
                }

                // Generate SAS token
                if (blobClient.CanGenerateSasUri)
                {
                    var sasBuilder = new BlobSasBuilder
                    {
                        BlobContainerName = _containerName,
                        BlobName = blobName,
                        Resource = "b", // b for blob
                        ExpiresOn = DateTimeOffset.UtcNow.AddHours(expiryHours)
                    };

                    sasBuilder.SetPermissions(BlobSasPermissions.Read);

                    var sasUri = blobClient.GenerateSasUri(sasBuilder);
                    return sasUri.ToString();
                }
                else
                {
                    // If we can't generate SAS (e.g., using connection string without account key),
                    // return the direct URL (note: this won't work with private containers)
                    _logger.LogWarning("Cannot generate SAS token for blob: {BlobName}", blobName);
                    return blobClient.Uri.ToString();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating SAS URL for file: {BlobName}", blobName);
                throw;
            }
        }

        public async Task<bool> FileExistsAsync(string folder, string fileName)
        {
            ValidateFolder(folder);

            var blobName = $"{folder}/{fileName}";

            try
            {
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                var blobClient = containerClient.GetBlobClient(blobName);

                var response = await blobClient.ExistsAsync();
                return response.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if file exists: {BlobName}", blobName);
                return false;
            }
        }

        private static void ValidateFolder(string folder)
        {
            var allowedFolders = new[] { "avartars", "company-logos", "cvs", "licenses" };
            
            if (string.IsNullOrEmpty(folder) || !allowedFolders.Contains(folder.ToLower()))
            {
                throw new ArgumentException($"Invalid folder name. Allowed folders: {string.Join(", ", allowedFolders)}");
            }
        }
    }
}