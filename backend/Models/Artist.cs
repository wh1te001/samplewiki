namespace SampleWiki.Models;

public class Artist : BaseEntity
{
    /// <summary>Имя исполнителя (например: "The Beatles")</summary>
    public required string Name { get; set; }

    /// <summary>Описание творчества исполнителя</summary>
    public string? Description { get; set; }

    /// <summary>URL на профиль в Wikipedia или другой источник информации</summary>
    public string? WikiLink { get; set; }

    /// <summary>Связь: Альбомы исполнителя</summary>
    public ICollection<Album> Albums { get; set; } = new List<Album>();

    /// <summary>Связь: Треки, как исполнитель оригинального произведения</summary>
    public ICollection<Track> Tracks { get; set; } = new List<Track>();
}
