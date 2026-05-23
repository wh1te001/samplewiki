using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWiki.Data;
using SampleWiki.DTOs;
using SampleWiki.Models;

namespace SampleWiki.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SamplesController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<SamplesController> _logger;

    public SamplesController(AppDbContext dbContext, ILogger<SamplesController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>Получить все сэмплы</summary>
    [HttpGet]
    public async Task<IActionResult> GetAllSamples()
    {
        try
        {
            var samples = await _dbContext.Samples
                .Select(s => new SampleDto
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
                })
                .ToListAsync();

            return Ok(samples);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении сэмплов: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Получить сэмпл по ID</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSampleById(int id)
    {
        try
        {
            var sample = await _dbContext.Samples
                .Include(s => s.Track)
                .Include(s => s.Artworks)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sample == null)
                return NotFound(new { error = "Сэмпл не найден" });

            var result = new SampleDetailDto
            {
                Id = sample.Id,
                Title = sample.Title,
                Type = sample.Type.ToString(),
                Description = sample.Description,
                Platform = sample.Platform.ToString(),
                PlatformId = sample.PlatformId,
                StartTime = sample.StartTime,
                EndTime = sample.EndTime,
                TrackId = sample.TrackId,
                CreatedAt = sample.CreatedAt,
                UpdatedAt = sample.UpdatedAt,
                Track = new TrackDto
                {
                    Id = sample.Track.Id,
                    Title = sample.Track.Title,
                    DurationSeconds = sample.Track.DurationSeconds,
                    TrackNumber = sample.Track.TrackNumber,
                    Genre = sample.Track.Genre,
                    AlbumId = sample.Track.AlbumId,
                    ArtistId = sample.Track.ArtistId,
                    UserId = sample.Track.UserId,
                    CreatedAt = sample.Track.CreatedAt,
                    UpdatedAt = sample.Track.UpdatedAt
                },
                Artworks = sample.Artworks.Select(a => new ArtworkDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    ImageUrl = a.ImageUrl,
                    Description = a.Description,
                    AlbumId = a.AlbumId,
                    SampleId = a.SampleId,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                }).ToList()
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении сэмпла: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Получить сэмплы по треку</summary>
    [HttpGet("track/{trackId}")]
    public async Task<IActionResult> GetSamplesByTrack(int trackId)
    {
        try
        {
            var samples = await _dbContext.Samples
                .Where(s => s.TrackId == trackId)
                .Select(s => new SampleDto
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
                })
                .ToListAsync();

            return Ok(samples);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении сэмплов трека: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Создать новый сэмпл</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateSample([FromBody] CreateSampleRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest("Некорректные данные");

            if (!Enum.TryParse<SampleType>(request.Type, out var sampleType))
                return BadRequest("Неверный тип сэмпла");

            if (!Enum.TryParse<PlatformType>(request.Platform, out var platformType))
                return BadRequest("Неверная платформа");

            var sample = new Sample
            {
                Title = request.Title,
                Type = sampleType,
                Description = request.Description,
                Platform = platformType,
                PlatformId = request.PlatformId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                TrackId = request.TrackId
            };

            _dbContext.Samples.Add(sample);
            await _dbContext.SaveChangesAsync();

            var result = new SampleDto
            {
                Id = sample.Id,
                Title = sample.Title,
                Type = sample.Type.ToString(),
                Description = sample.Description,
                Platform = sample.Platform.ToString(),
                PlatformId = sample.PlatformId,
                StartTime = sample.StartTime,
                EndTime = sample.EndTime,
                TrackId = sample.TrackId,
                CreatedAt = sample.CreatedAt,
                UpdatedAt = sample.UpdatedAt
            };

            _logger.LogInformation("✅ Создан сэмпл: {Title}", request.Title);

            return CreatedAtAction(nameof(GetSampleById), new { id = sample.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при создании сэмпла: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Обновить сэмпл</summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateSample(int id, [FromBody] UpdateSampleRequest request)
    {
        try
        {
            var sample = await _dbContext.Samples.FindAsync(id);
            if (sample == null)
                return NotFound(new { error = "Сэмпл не найден" });

            if (!string.IsNullOrEmpty(request.Title))
                sample.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Type))
            {
                if (!Enum.TryParse<SampleType>(request.Type, out var sampleType))
                    return BadRequest("Неверный тип сэмпла");
                sample.Type = sampleType;
            }
            if (!string.IsNullOrEmpty(request.Description))
                sample.Description = request.Description;
            if (!string.IsNullOrEmpty(request.StartTime))
                sample.StartTime = request.StartTime;
            if (!string.IsNullOrEmpty(request.EndTime))
                sample.EndTime = request.EndTime;

            sample.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var result = new SampleDto
            {
                Id = sample.Id,
                Title = sample.Title,
                Type = sample.Type.ToString(),
                Description = sample.Description,
                Platform = sample.Platform.ToString(),
                PlatformId = sample.PlatformId,
                StartTime = sample.StartTime,
                EndTime = sample.EndTime,
                TrackId = sample.TrackId,
                CreatedAt = sample.CreatedAt,
                UpdatedAt = sample.UpdatedAt
            };

            _logger.LogInformation("✅ Обновлен сэмпл: {Title}", sample.Title);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при обновлении сэмпла: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>Удалить сэмпл</summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteSample(int id)
    {
        try
        {
            var sample = await _dbContext.Samples.FindAsync(id);
            if (sample == null)
                return NotFound(new { error = "Сэмпл не найден" });

            _dbContext.Samples.Remove(sample);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("✅ Удален сэмпл: {Title}", sample.Title);

            return Ok(new { message = "Сэмпл удален" });
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при удалении сэмпла: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }
}
