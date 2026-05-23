namespace SampleWiki.DTOs;

/// <summary>DTO для создания/редактирования трека</summary>
public class CreateTrackRequest
{
    public required string Title { get; set; }
    public int DurationSeconds { get; set; }
    public int? TrackNumber { get; set; }
    public string? Genre { get; set; }
    public string? ResourceUrl { get; set; }
    public int AlbumId { get; set; }
    public int ArtistId { get; set; }
}

/// <summary>DTO для редактирования трека (минимальная информация)</summary>
public class UpdateTrackRequest
{
    public string? Title { get; set; }
    public int? DurationSeconds { get; set; }
    public int? TrackNumber { get; set; }
    public string? Genre { get; set; }
    public string? ResourceUrl { get; set; }
}

/// <summary>DTO для ответа с информацией о треке</summary>
public class TrackDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public int DurationSeconds { get; set; }
    public int? TrackNumber { get; set; }
    public string? Genre { get; set; }
    public string? ResourceUrl { get; set; }
    public int AlbumId { get; set; }
    public int ArtistId { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>DTO трека с полной информацией</summary>
public class TrackDetailDto : TrackDto
{
    public required AlbumDto Album { get; set; }
    public required ArtistDto Artist { get; set; }
    public required UserDto User { get; set; }
    public List<SampleDto> Samples { get; set; } = new();
    public List<RevisionDto> Revisions { get; set; } = new();
}
