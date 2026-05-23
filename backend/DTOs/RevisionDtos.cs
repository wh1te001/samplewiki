namespace SampleWiki.DTOs;

/// <summary>DTO для ответа с информацией о правке</summary>
public class RevisionDto
{
    public int Id { get; set; }
    public required string ChangeType { get; set; } // "Created", "Updated", "Deleted"
    public required string EntityName { get; set; }
    public int EntityId { get; set; }
    public required string Description { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public int UserId { get; set; }
    public int? TrackId { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>DTO правки с полной информацией</summary>
public class RevisionDetailDto : RevisionDto
{
    public required UserDto User { get; set; }
    public TrackDto? Track { get; set; }
}
