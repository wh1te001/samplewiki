using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWiki.Data;
using SampleWiki.DTOs;
using SampleWiki.Models;

namespace SampleWiki.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtistsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<ArtistsController> _logger;

    public ArtistsController(AppDbContext dbContext, ILogger<ArtistsController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>Получить всех исполнителей</summary>
    [HttpGet]
    public async Task<IActionResult> GetAllArtists()
    {
        try
        {
            var artists = await _dbContext.Artists
                .Select(a => new ArtistDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Description = a.Description,
                    WikiLink = a.WikiLink,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    TrackCount = a.Tracks.Count
                })
                .ToListAsync();

            return Ok(artists);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении исполнителей: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Получить исполнителя по ID с альбомами и треками</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetArtistById(int id)
    {
        try
        {
            var artist = await _dbContext.Artists
                .Include(a => a.Albums)
                .ThenInclude(a => a.Artworks)
                .Include(a => a.Tracks)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (artist == null)
                return NotFound(new { error = "Исполнитель не найден" });

            var result = new ArtistDetailDto
            {
                Id = artist.Id,
                Name = artist.Name,
                Description = artist.Description,
                WikiLink = artist.WikiLink,
                CreatedAt = artist.CreatedAt,
                UpdatedAt = artist.UpdatedAt,
                Albums = artist.Albums.Select(a => new AlbumDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    ReleaseYear = a.ReleaseYear,
                    Description = a.Description,
                    ArtistId = a.ArtistId,
                    ImageUrl = a.Artworks.FirstOrDefault()?.ImageUrl,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                }).ToList(),
                Tracks = artist.Tracks.Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DurationSeconds = t.DurationSeconds,
                    TrackNumber = t.TrackNumber,
                    Genre = t.Genre,
                    AlbumId = t.AlbumId,
                    ArtistId = t.ArtistId,
                    UserId = t.UserId,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                }).ToList()
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении исполнителя: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Создать новогоисполнителя</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateArtist([FromBody] CreateArtistRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest("Некорректные данные");

            var artist = new Artist
            {
                Name = request.Name,
                Description = request.Description,
                WikiLink = request.WikiLink
            };

            _dbContext.Artists.Add(artist);
            await _dbContext.SaveChangesAsync();

            var result = new ArtistDto
            {
                Id = artist.Id,
                Name = artist.Name,
                Description = artist.Description,
                WikiLink = artist.WikiLink,
                CreatedAt = artist.CreatedAt,
                UpdatedAt = artist.UpdatedAt
            };

            _logger.LogInformation("✅ Создан исполнитель: {Name}", request.Name);

            return CreatedAtAction(nameof(GetArtistById), new { id = artist.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при создании исполнителя: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Обновить исполнителя</summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateArtist(int id, [FromBody] CreateArtistRequest request)
    {
        try
        {
            var artist = await _dbContext.Artists.FindAsync(id);
            if (artist == null)
                return NotFound(new { error = "Исполнитель не найден" });

            artist.Name = request.Name;
            artist.Description = request.Description;
            artist.WikiLink = request.WikiLink;
            artist.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var result = new ArtistDto
            {
                Id = artist.Id,
                Name = artist.Name,
                Description = artist.Description,
                WikiLink = artist.WikiLink,
                CreatedAt = artist.CreatedAt,
                UpdatedAt = artist.UpdatedAt
            };

            _logger.LogInformation("✅ Обновлен исполнитель: {Name}", artist.Name);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при обновлении исполнителя: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Удалить исполнителя</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteArtist(int id)
    {
        try
        {
            var artist = await _dbContext.Artists.FindAsync(id);
            if (artist == null)
                return NotFound(new { error = "Исполнитель не найден" });

            _dbContext.Artists.Remove(artist);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("✅ Удален исполнитель: {Name}", artist.Name);

            return Ok(new { message = "Исполнитель удален" });
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при удалении исполнителя: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }
}
