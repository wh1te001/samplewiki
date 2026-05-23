namespace SampleWiki.DTOs;

/// <summary>DTO для создания/редактирования альбома</summary>
public class CreateAlbumRequest
{
    public required string Title { get; set; }
    public int? ReleaseYear { get; set; }
    public string? Description { get; set; }
    public int ArtistId { get; set; }
}

/// <summary>DTO для ответа с информацией об альбоме</summary>
public class AlbumDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public int? ReleaseYear { get; set; }
    public string? Description { get; set; }
    public int ArtistId { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>DTO альбома с полной информацией</summary>
public class AlbumDetailDto : AlbumDto
{
    public required ArtistDto Artist { get; set; }
    public List<TrackDto> Tracks { get; set; } = new();
    public List<ArtworkDto> Artworks { get; set; } = new();
}
