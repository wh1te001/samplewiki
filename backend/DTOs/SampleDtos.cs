namespace SampleWiki.DTOs;

/// <summary>DTO для создания/редактирования сэмпла</summary>
public class CreateSampleRequest
{
    public required string Title { get; set; }
    public required string Type { get; set; } // "Sample", "Interpolation", "Cover", "Remix"
    public string? Description { get; set; }
    public required string Platform { get; set; } // "Youtube", "Soundcloud", "Bandcamp"
    public required string PlatformId { get; set; }
    public required string StartTime { get; set; } // HH:MM:SS
    public required string EndTime { get; set; }   // HH:MM:SS
    public int TrackId { get; set; }
}

/// <summary>DTO для редактирования сэмпла</summary>
public class UpdateSampleRequest
{
    public string? Title { get; set; }
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
}

/// <summary>DTO для ответа с информацией о сэмпле</summary>
public class SampleDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Type { get; set; }
    public string? Description { get; set; }
    public required string Platform { get; set; }
    public required string PlatformId { get; set; }
    public required string StartTime { get; set; }
    public required string EndTime { get; set; }
    public int TrackId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>DTO сэмпла с полной информацией</summary>
public class SampleDetailDto : SampleDto
{
    public required TrackDto Track { get; set; }
    public List<ArtworkDto> Artworks { get; set; } = new();
}
