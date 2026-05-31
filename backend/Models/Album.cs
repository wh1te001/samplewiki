namespace SampleWiki.Models;

public class Album : BaseEntity
{
    /// <summary>Название альбома (например: "Abbey Road")</summary>
    public required string Title { get; set; }

    /// <summary>Год выпуска альбома</summary>
    public int? ReleaseYear { get; set; }

    /// <summary>ID исполнителя (внешний ключ)</summary>
    public int ArtistId { get; set; }

    /// <summary>Связь: Исполнитель альбома</summary>
    public Artist Artist { get; set; } = null!;

    /// <summary>Связь: Треки в альбоме</summary>
    public ICollection<Track> Tracks { get; set; } = new List<Track>();

    /// <summary>Связь: Обложки альбома</summary>
    public ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
}
