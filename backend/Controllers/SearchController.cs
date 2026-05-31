using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWiki.Data;
using SampleWiki.DTOs;

namespace SampleWiki.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<SearchController> _logger;

    public SearchController(AppDbContext dbContext, ILogger<SearchController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpGet("artists")]
    public async Task<IActionResult> SearchArtists([FromQuery] string q)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 1)
                return Ok(new List<ArtistSearchResult>());

            var artists = await _dbContext.Artists
                .Where(a => EF.Functions.Like(a.Name, $"%{q}%"))
                .Take(10)
                .Select(a => new ArtistSearchResult
                {
                    Id = a.Id,
                    Name = a.Name,
                    ImageUrl = a.Albums
                        .SelectMany(al => al.Artworks)
                        .Select(aw => aw.ImageUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(artists);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при поиске артистов: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    [HttpGet("tracks")]
    public async Task<IActionResult> SearchTracks([FromQuery] string q, [FromQuery] int? artistId = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 1)
                return Ok(new List<TrackSearchResult>());

            var query = _dbContext.Tracks
                .Include(t => t.Artist)
                .Include(t => t.Album).ThenInclude(a => a.Artworks)
                .AsQueryable();

            if (artistId.HasValue)
                query = query.Where(t => t.ArtistId == artistId.Value);

            var tracks = await query
                .Where(t => EF.Functions.Like(t.Title, $"%{q}%"))
                .Take(10)
                .Select(t => new TrackSearchResult
                {
                    Id = t.Id,
                    Title = t.Title,
                    ArtistId = t.ArtistId,
                    ArtistName = t.Artist.Name,
                    Genre = t.Genre,
                    ResourceUrl = t.ResourceUrl,
                    AlbumTitle = t.Album.Title,
                    AlbumImageUrl = t.Album.Artworks.Select(aw => aw.ImageUrl).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(tracks);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при поиске треков: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }
}
