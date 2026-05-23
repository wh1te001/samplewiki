namespace SampleWiki.Models;

public class Track : BaseEntity
{
    /// <summary>Название трека (например: "Come Together")</summary>
    public required string Title { get; set; }

    /// <summary>Длительность трека в секундах</summary>
    public int DurationSeconds { get; set; }

    /// <summary>Номер трека в альбоме</summary>
    public int? TrackNumber { get; set; }

    /// <summary>Жанр трека</summary>
    public string? Genre { get; set; }

    /// <summary>Ссылка на ресурс (YouTube, Spotify и т.д.)</summary>
    public string? ResourceUrl { get; set; }

    /// <summary>ID альбома (внешний ключ)</summary>
    public int AlbumId { get; set; }

    /// <summary>ID исполнителя (внешний ключ)</summary>
    public int ArtistId { get; set; }

    /// <summary>ID пользователя, добавившего трек</summary>
    public int UserId { get; set; }

    /// <summary>Связь: Альбом трека</summary>
    public Album Album { get; set; } = null!;

    /// <summary>Связь: Исполнитель трека</summary>
    public Artist Artist { get; set; } = null!;

    /// <summary>Связь: Пользователь, добавивший трек</summary>
    public User User { get; set; } = null!;

    /// <summary>Связь: Сэмплы из этого трека</summary>
    public ICollection<Sample> Samples { get; set; } = new List<Sample>();

    /// <summary>Связь: История правок трека</summary>
    public ICollection<Revision> Revisions { get; set; } = new List<Revision>();
}
