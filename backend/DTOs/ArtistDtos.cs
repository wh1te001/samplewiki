namespace SampleWiki.DTOs;

/// <summary>DTO для создания/редактирования исполнителя</summary>
public class CreateArtistRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? WikiLink { get; set; }
}

/// <summary>DTO для ответа с информацией об исполнителе</summary>
public class ArtistDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? WikiLink { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>DTO исполнителя с альбомами и треками</summary>
public class ArtistDetailDto : ArtistDto
{
    public List<AlbumDto> Albums { get; set; } = new();
    public List<TrackDto> Tracks { get; set; } = new();
}
