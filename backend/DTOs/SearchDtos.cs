namespace SampleWiki.DTOs;

public class ArtistSearchResult
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? ImageUrl { get; set; }
}

public class TrackSearchResult
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public int ArtistId { get; set; }
    public string? ArtistName { get; set; }
    public string? Genre { get; set; }
    public string? ResourceUrl { get; set; }
    public string? AlbumTitle { get; set; }
    public string? AlbumImageUrl { get; set; }
}

public class SubmitSampleRequest
{
    public required string SampleType { get; set; }
    public int? StartTimeSeconds { get; set; }

    public int? SamplerArtistId { get; set; }
    public string? SamplerArtistName { get; set; }

    public int? SamplerTrackId { get; set; }
    public string? SamplerTrackTitle { get; set; }
    public string? SamplerTrackGenre { get; set; }
    public string? SamplerTrackResourceUrl { get; set; }

    public string? SamplerAlbumTitle { get; set; }
    public int? SamplerAlbumReleaseYear { get; set; }
    public string? SamplerAlbumImageUrl { get; set; }

    public int? OriginalArtistId { get; set; }
    public string? OriginalArtistName { get; set; }

    public int? OriginalTrackId { get; set; }
    public string? OriginalTrackTitle { get; set; }
    public string? OriginalTrackGenre { get; set; }
    public string? OriginalTrackResourceUrl { get; set; }

    public string? OriginalAlbumTitle { get; set; }
    public int? OriginalAlbumReleaseYear { get; set; }
    public string? OriginalAlbumImageUrl { get; set; }
}
