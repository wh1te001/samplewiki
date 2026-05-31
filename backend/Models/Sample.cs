namespace SampleWiki.Models;

public class Sample : BaseEntity
{
    public SampleType Type { get; set; } = SampleType.Sample;

    /// <summary>Время начала сэмпла в треке (в секундах)</summary>
    public int? StartTimeSeconds { get; set; }

    /// <summary>Трек, который содержит сэмпл (sampler)</summary>
    public int TrackId { get; set; }

    public Track Track { get; set; } = null!;

    /// <summary>Трек, который был засемплирован (source)</summary>
    public int SampledTrackId { get; set; }

    public Track SampledTrack { get; set; } = null!;
}
