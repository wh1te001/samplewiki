namespace SampleWiki.DTOs;

public class CreateSampleRequest
{
    public required string Title { get; set; }
    public required string Type { get; set; }
    public string? Description { get; set; }
    public int TrackId { get; set; }
}

public class UpdateSampleRequest
{
    public string? Title { get; set; }
    public string? Type { get; set; }
    public string? Description { get; set; }
}

public class SampleDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Type { get; set; }
    public string? Description { get; set; }
    public int TrackId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SampleDetailDto : SampleDto
{
    public required TrackDto Track { get; set; }
}
