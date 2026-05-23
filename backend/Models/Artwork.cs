namespace SampleWiki.Models;

public class Artwork : BaseEntity
{
    /// <summary>Название обложки или артворка</summary>
    public required string Title { get; set; }

    /// <summary>URL на обложку или изображение</summary>
    public required string ImageUrl { get; set; }

    /// <summary>Описание или примечания об обложке</summary>
    public string? Description { get; set; }

    /// <summary>ID альбома, к которому относится обложка (опционально)</summary>
    public int? AlbumId { get; set; }

    /// <summary>ID сэмпла, если обложка относится к сэмплу (опционально)</summary>
    public int? SampleId { get; set; }

    /// <summary>Связь: Альбом (если применимо)</summary>
    public Album? Album { get; set; }

    /// <summary>Связь: Сэмпл (если применимо)</summary>
    public Sample? Sample { get; set; }
}
