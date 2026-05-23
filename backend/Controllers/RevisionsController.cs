using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWiki.Data;
using SampleWiki.DTOs;

namespace SampleWiki.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RevisionsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<RevisionsController> _logger;

    public RevisionsController(AppDbContext dbContext, ILogger<RevisionsController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>Получить все правки (история изменений)</summary>
    [HttpGet]
    public async Task<IActionResult> GetAllRevisions()
    {
        try
        {
            var revisions = await _dbContext.Revisions
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new RevisionDto
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
                })
                .ToListAsync();

            return Ok(revisions);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении правок: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Получить правку по ID</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRevisionById(int id)
    {
        try
        {
            var revision = await _dbContext.Revisions
                .Include(r => r.User)
                .Include(r => r.Track)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (revision == null)
                return NotFound(new { error = "Правка не найдена" });

            var result = new RevisionDetailDto
            {
                Id = revision.Id,
                ChangeType = revision.ChangeType.ToString(),
                EntityName = revision.EntityName,
                EntityId = revision.EntityId,
                Description = revision.Description,
                OldValues = revision.OldValues,
                NewValues = revision.NewValues,
                UserId = revision.UserId,
                TrackId = revision.TrackId,
                CreatedAt = revision.CreatedAt,
                User = new UserDto
                {
                    Id = revision.User.Id,
                    Username = revision.User.Username,
                    Email = revision.User.Email,
                    Role = revision.User.Role.ToString(),
                    IsActive = revision.User.IsActive,
                    CreatedAt = revision.User.CreatedAt
                },
                Track = revision.Track != null ? new TrackDto
                {
                    Id = revision.Track.Id,
                    Title = revision.Track.Title,
                    DurationSeconds = revision.Track.DurationSeconds,
                    TrackNumber = revision.Track.TrackNumber,
                    Genre = revision.Track.Genre,
                    AlbumId = revision.Track.AlbumId,
                    ArtistId = revision.Track.ArtistId,
                    UserId = revision.Track.UserId,
                    CreatedAt = revision.Track.CreatedAt,
                    UpdatedAt = revision.Track.UpdatedAt
                } : null
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении правки: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Получить правки по треку</summary>
    [HttpGet("track/{trackId}")]
    public async Task<IActionResult> GetRevisionsByTrack(int trackId)
    {
        try
        {
            var revisions = await _dbContext.Revisions
                .Where(r => r.TrackId == trackId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new RevisionDto
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
                })
                .ToListAsync();

            return Ok(revisions);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении правок трека: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Получить правки по пользователю</summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetRevisionsByUser(int userId)
    {
        try
        {
            var revisions = await _dbContext.Revisions
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new RevisionDto
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
                })
                .ToListAsync();

            return Ok(revisions);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении правок пользователя: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }
}
