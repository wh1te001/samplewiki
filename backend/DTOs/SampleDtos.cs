namespace SampleWiki.DTOs;

public class CreateSampleRequest
{
    public required string Type { get; set; }
    public string? Description { get; set; }
    public int? StartTimeSeconds { get; set; }
    public int TrackId { get; set; }
    public int SampledTrackId { get; set; }
}

public class UpdateSampleRequest
{
    public string? Type { get; set; }
    public string? Description { get; set; }
    public int? StartTimeSeconds { get; set; }
    public int? SampledTrackId { get; set; }
}

public class SampleDto
{
    public int Id { get; set; }
    public required string Type { get; set; }
    public string? Description { get; set; }
    public int? StartTimeSeconds { get; set; }
    public int TrackId { get; set; }
    public int SampledTrackId { get; set; }
    public string? SampledTrackTitle { get; set; }
    public string? SampledTrackArtistName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SampleDetailDto : SampleDto
{
    public required TrackDto Track { get; set; }
    public required TrackDto SampledTrack { get; set; }
}
