namespace SampleWiki.DTOs;

/// <summary>DTO для создания/редактирования обложки</summary>
public class CreateArtworkRequest
{
    public required string Title { get; set; }
    public required string ImageUrl { get; set; }
    public string? Description { get; set; }
    public int? AlbumId { get; set; }
    public int? SampleId { get; set; }
}

/// <summary>DTO для редактирования обложки</summary>
public class UpdateArtworkRequest
{
    public string? Title { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
}

/// <summary>DTO для ответа с информацией об обложке</summary>
public class ArtworkDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string ImageUrl { get; set; }
    public string? Description { get; set; }
    public int? AlbumId { get; set; }
    public int? SampleId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
