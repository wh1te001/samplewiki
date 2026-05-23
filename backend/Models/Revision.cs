namespace SampleWiki.Models;

public class Revision : BaseEntity
{
    /// <summary>Тип операции (Created, Updated, Deleted)</summary>
    public ChangeType ChangeType { get; set; }

    /// <summary>Название сущности, которая была изменена</summary>
    public required string EntityName { get; set; }

    /// <summary>ID измененной сущности</summary>
    public int EntityId { get; set; }

    /// <summary>Описание изменений</summary>
    public required string Description { get; set; }

    /// <summary>Старые значения (JSON)</summary>
    public string? OldValues { get; set; }

    /// <summary>Новые значения (JSON)</summary>
    public string? NewValues { get; set; }

    /// <summary>ID пользователя, сделавшего изменение (внешний ключ)</summary>
    public int UserId { get; set; }

    /// <summary>ID трека, к которому относится правка (опционально)</summary>
    public int? TrackId { get; set; }

    /// <summary>Связь: Пользователь, сделавший правку</summary>
    public User User { get; set; } = null!;

    /// <summary>Связь: Трек, к которому относится правка</summary>
    public Track? Track { get; set; }
}
