using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWiki.Data;
using SampleWiki.DTOs;

namespace SampleWiki.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<AlbumsController> _logger;

    public AlbumsController(AppDbContext dbContext, ILogger<AlbumsController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>Получить альбом по ID с треками, исполнителем и обложками</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAlbumById(int id)
    {
        try
        {
            var album = await _dbContext.Albums
                .Include(a => a.Artist)
                .Include(a => a.Tracks)
                .Include(a => a.Artworks)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (album == null)
                return NotFound(new { error = "Альбом не найден" });

            var result = new AlbumDetailDto
            {
                Id = album.Id,
                Title = album.Title,
                ReleaseYear = album.ReleaseYear,
                Description = album.Description,
                ArtistId = album.ArtistId,
                ImageUrl = album.Artworks.FirstOrDefault()?.ImageUrl,
                CreatedAt = album.CreatedAt,
                UpdatedAt = album.UpdatedAt,
                Artist = new ArtistDto
                {
                    Id = album.Artist.Id,
                    Name = album.Artist.Name,
                    Description = album.Artist.Description,
                    WikiLink = album.Artist.WikiLink,
                    CreatedAt = album.Artist.CreatedAt,
                    UpdatedAt = album.Artist.UpdatedAt
                },
                Tracks = album.Tracks.Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DurationSeconds = t.DurationSeconds,
                    TrackNumber = t.TrackNumber,
                    Genre = t.Genre,
                    ResourceUrl = t.ResourceUrl,
                    AlbumId = t.AlbumId,
                    ArtistId = t.ArtistId,
                    ArtistName = album.Artist.Name,
                    UserId = t.UserId,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                }).ToList(),
                Artworks = album.Artworks.Select(aw => new ArtworkDto
                {
                    Id = aw.Id,
                    Title = aw.Title,
                    ImageUrl = aw.ImageUrl,
                    Description = aw.Description,
                    AlbumId = aw.AlbumId,
                    CreatedAt = aw.CreatedAt,
                    UpdatedAt = aw.UpdatedAt
                }).ToList()
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении альбома: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }
}
