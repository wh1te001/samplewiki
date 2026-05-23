namespace SampleWiki.Models;

public class Sample : BaseEntity
{
    /// <summary>Название сэмпла (например: "The weight from The Band")</summary>
    public required string Title { get; set; }

    /// <summary>Тип сэмпла (Sample, Interpolation, Cover, Remix)</summary>
    public SampleType Type { get; set; } = SampleType.Sample;

    /// <summary>Описание сэмпла и связи с оригиналом</summary>
    public string? Description { get; set; }

    /// <summary>Платформа источника (Youtube, Soundcloud, Bandcamp)</summary>
    public PlatformType Platform { get; set; } = PlatformType.Youtube;

    /// <summary>ID видео/трека на платформе</summary>
    public required string PlatformId { get; set; }

    /// <summary>Временной код начала сэмпла (в формате HH:MM:SS)</summary>
    public required string StartTime { get; set; }

    /// <summary>Временной код конца сэмпла (в формате HH:MM:SS)</summary>
    public required string EndTime { get; set; }

    /// <summary>ID трека, в котором использован сэмпл (внешний ключ)</summary>
    public int TrackId { get; set; }

    /// <summary>Связь: Трек, в котором использован сэмпл</summary>
    public Track Track { get; set; } = null!;

    /// <summary>Связь: Artworks (обложки) в сэмпле</summary>
    public ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
}
