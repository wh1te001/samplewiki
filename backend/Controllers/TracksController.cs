using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWiki.Data;
using SampleWiki.DTOs;
using SampleWiki.Models;

namespace SampleWiki.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TracksController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<TracksController> _logger;

    public TracksController(AppDbContext dbContext, ILogger<TracksController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>Получить все треки</summary>
    [HttpGet]
    public async Task<IActionResult> GetAllTracks()
    {
        try
        {
            var tracks = await _dbContext.Tracks
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DurationSeconds = t.DurationSeconds,
                    TrackNumber = t.TrackNumber,
                    Genre = t.Genre,
                    ResourceUrl = t.ResourceUrl,
                    AlbumId = t.AlbumId,
                    ArtistId = t.ArtistId,
                    UserId = t.UserId,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();

            return Ok(tracks);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении треков: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Получить трек по ID с полной информацией</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTrackById(int id)
    {
        try
        {
            var track = await _dbContext.Tracks
                .Include(t => t.Album)
                .ThenInclude(a => a.Artworks)
                .Include(t => t.Album)
                .ThenInclude(a => a.Artist)
                .Include(t => t.Artist)
                .Include(t => t.User)
                .Include(t => t.Samples)
                .Include(t => t.Revisions)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (track == null)
                return NotFound(new { error = "Трек не найден" });

            var result = new TrackDetailDto
            {
                Id = track.Id,
                Title = track.Title,
                DurationSeconds = track.DurationSeconds,
                TrackNumber = track.TrackNumber,
                Genre = track.Genre,
                ResourceUrl = track.ResourceUrl,
                AlbumId = track.AlbumId,
                ArtistId = track.ArtistId,
                UserId = track.UserId,
                CreatedAt = track.CreatedAt,
                UpdatedAt = track.UpdatedAt,
                Album = new AlbumDto
                {
                    Id = track.Album.Id,
                    Title = track.Album.Title,
                    ReleaseYear = track.Album.ReleaseYear,
                    ArtistId = track.Album.ArtistId,
                    ImageUrl = track.Album.Artworks.FirstOrDefault()?.ImageUrl,
                    CreatedAt = track.Album.CreatedAt,
                    UpdatedAt = track.Album.UpdatedAt
                },
                Artist = new ArtistDto
                {
                    Id = track.Artist.Id,
                    Name = track.Artist.Name,
                    CreatedAt = track.Artist.CreatedAt,
                    UpdatedAt = track.Artist.UpdatedAt
                },
                User = new UserDto
                {
                    Id = track.User.Id,
                    Username = track.User.Username,
                    Email = track.User.Email,
                    Role = track.User.Role.ToString(),
                    IsActive = track.User.IsActive,
                    CreatedAt = track.User.CreatedAt
                },
                Samples = track.Samples.Select(s => new SampleDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Type = s.Type.ToString(),
                    Description = s.Description,
                    Platform = s.Platform.ToString(),
                    PlatformId = s.PlatformId,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    TrackId = s.TrackId,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                }).ToList(),
                Revisions = track.Revisions.Select(r => new RevisionDto
                {
                    Id = r.Id,
                    ChangeType = r.ChangeType.ToString(),
                    EntityName = r.EntityName,
                    EntityId = r.EntityId,
                    Description = r.Description,
                    OldValues = r.OldValues,
                    NewValues = r.NewValues,
                    UserId = r.UserId,
                    TrackId = r.TrackId,
                    CreatedAt = r.CreatedAt
                }).ToList()
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении трека: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Получить треки по альбому</summary>
    [HttpGet("album/{albumId}")]
    public async Task<IActionResult> GetTracksByAlbum(int albumId)
    {
        try
        {
            var tracks = await _dbContext.Tracks
                .Where(t => t.AlbumId == albumId)
                .OrderBy(t => t.TrackNumber)
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DurationSeconds = t.DurationSeconds,
                    TrackNumber = t.TrackNumber,
                    Genre = t.Genre,
                    ResourceUrl = t.ResourceUrl,
                    AlbumId = t.AlbumId,
                    ArtistId = t.ArtistId,
                    UserId = t.UserId,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();

            return Ok(tracks);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении треков альбома: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Создать новый трек</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateTrack([FromBody] CreateTrackRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest("Некорректные данные");

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("Пользователь не аутентифицирован");

            var track = new Track
            {
                Title = request.Title,
                DurationSeconds = request.DurationSeconds,
                TrackNumber = request.TrackNumber,
                Genre = request.Genre,
                ResourceUrl = request.ResourceUrl,
                AlbumId = request.AlbumId,
                ArtistId = request.ArtistId,
                UserId = userId
            };

            _dbContext.Tracks.Add(track);
            await _dbContext.SaveChangesAsync();

            var result = new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                DurationSeconds = track.DurationSeconds,
                TrackNumber = track.TrackNumber,
                Genre = track.Genre,
                ResourceUrl = track.ResourceUrl,
                AlbumId = track.AlbumId,
                ArtistId = track.ArtistId,
                UserId = track.UserId,
                CreatedAt = track.CreatedAt,
                UpdatedAt = track.UpdatedAt
            };

            _logger.LogInformation("✅ Создан трек: {Title}", request.Title);

            return CreatedAtAction(nameof(GetTrackById), new { id = track.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при создании трека: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Обновить трек</summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateTrack(int id, [FromBody] UpdateTrackRequest request)
    {
        try
        {
            var track = await _dbContext.Tracks.FindAsync(id);
            if (track == null)
                return NotFound(new { error = "Трек не найден" });

            if (!string.IsNullOrEmpty(request.Title))
                track.Title = request.Title;
            if (request.DurationSeconds.HasValue)
                track.DurationSeconds = request.DurationSeconds.Value;
            if (request.TrackNumber.HasValue)
                track.TrackNumber = request.TrackNumber.Value;
            if (!string.IsNullOrEmpty(request.Genre))
                track.Genre = request.Genre;
            if (!string.IsNullOrEmpty(request.ResourceUrl))
                track.ResourceUrl = request.ResourceUrl;

            track.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var result = new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                DurationSeconds = track.DurationSeconds,
                TrackNumber = track.TrackNumber,
                Genre = track.Genre,
                ResourceUrl = track.ResourceUrl,
                AlbumId = track.AlbumId,
                ArtistId = track.ArtistId,
                UserId = track.UserId,
                CreatedAt = track.CreatedAt,
                UpdatedAt = track.UpdatedAt
            };

            _logger.LogInformation("✅ Обновлен трек: {Title}", track.Title);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при обновлении трека: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Удалить трек</summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteTrack(int id)
    {
        try
        {
            var track = await _dbContext.Tracks.FindAsync(id);
            if (track == null)
                return NotFound(new { error = "Трек не найден" });

            _dbContext.Tracks.Remove(track);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("✅ Удален трек: {Title}", track.Title);

            return Ok(new { message = "Трек удален" });
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при удалении трека: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }
}
