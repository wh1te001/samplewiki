namespace SampleWiki.DTOs;

public class CreateArtworkRequest
{
    public required string Title { get; set; }
    public required string ImageUrl { get; set; }
    public string? Description { get; set; }
    public int AlbumId { get; set; }
}

public class UpdateArtworkRequest
{
    public string? Title { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
}

public class ArtworkDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string ImageUrl { get; set; }
    public string? Description { get; set; }
    public int AlbumId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
