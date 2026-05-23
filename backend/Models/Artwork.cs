namespace SampleWiki.Models;

public class Artwork : BaseEntity
{
    public required string Title { get; set; }

    public required string ImageUrl { get; set; }

    public string? Description { get; set; }

    public int AlbumId { get; set; }

    public Album Album { get; set; } = null!;
}
