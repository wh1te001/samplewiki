namespace SampleWiki.Models;

public class Sample : BaseEntity
{
    public required string Title { get; set; }

    public SampleType Type { get; set; } = SampleType.Sample;

    public string? Description { get; set; }

    public string? SourceUrl { get; set; }

    public int TrackId { get; set; }

    public Track Track { get; set; } = null!;
}
