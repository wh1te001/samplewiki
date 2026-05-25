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

    [HttpGet]
    public async Task<IActionResult> GetAllSamples()
    {
        try
        {
            var samples = await _dbContext.Samples
                .Include(s => s.SampledTrack).ThenInclude(t => t.Artist)
                .Select(s => new SampleDto
                {
                    Id = s.Id,
                    Type = s.Type.ToString(),
                    Description = s.Description,
                    StartTimeSeconds = s.StartTimeSeconds,
                    TrackId = s.TrackId,
                    SampledTrackId = s.SampledTrackId,
                    SampledTrackTitle = s.SampledTrack.Title,
                    SampledTrackArtistName = s.SampledTrack.Artist.Name,
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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSampleById(int id)
    {
        try
        {
            var sample = await _dbContext.Samples
                .Include(s => s.Track).ThenInclude(t => t.Album).ThenInclude(a => a.Artworks)
                .Include(s => s.Track).ThenInclude(t => t.Artist)
                .Include(s => s.SampledTrack).ThenInclude(t => t.Album).ThenInclude(a => a.Artworks)
                .Include(s => s.SampledTrack).ThenInclude(t => t.Artist)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sample == null)
                return NotFound(new { error = "Сэмпл не найден" });

            var result = new SampleDetailDto
            {
                Id = sample.Id,
                Type = sample.Type.ToString(),
                Description = sample.Description,
                StartTimeSeconds = sample.StartTimeSeconds,
                TrackId = sample.TrackId,
                SampledTrackId = sample.SampledTrackId,
                CreatedAt = sample.CreatedAt,
                UpdatedAt = sample.UpdatedAt,
                Track = MapTrackDto(sample.Track),
                SampledTrack = MapTrackDto(sample.SampledTrack)
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении сэмпла: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    [HttpGet("track/{trackId}")]
    public async Task<IActionResult> GetSamplesByTrack(int trackId)
    {
        try
        {
            var samples = await _dbContext.Samples
                .Include(s => s.SampledTrack).ThenInclude(t => t.Artist)
                .Where(s => s.TrackId == trackId)
                .Select(s => new SampleDto
                {
                    Id = s.Id,
                    Type = s.Type.ToString(),
                    Description = s.Description,
                    StartTimeSeconds = s.StartTimeSeconds,
                    TrackId = s.TrackId,
                    SampledTrackId = s.SampledTrackId,
                    SampledTrackTitle = s.SampledTrack.Title,
                    SampledTrackArtistName = s.SampledTrack.Artist.Name,
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

            var sample = new Sample
            {
                Type = sampleType,
                Description = request.Description,
                StartTimeSeconds = request.StartTimeSeconds,
                TrackId = request.TrackId,
                SampledTrackId = request.SampledTrackId
            };

            _dbContext.Samples.Add(sample);
            await _dbContext.SaveChangesAsync();

            var result = new SampleDto
            {
                Id = sample.Id,
                Type = sample.Type.ToString(),
                Description = sample.Description,
                StartTimeSeconds = sample.StartTimeSeconds,
                TrackId = sample.TrackId,
                SampledTrackId = sample.SampledTrackId,
                CreatedAt = sample.CreatedAt,
                UpdatedAt = sample.UpdatedAt
            };

            _logger.LogInformation("✅ Создан сэмпл: Track {TrackId} samples {SampledTrackId}", request.TrackId, request.SampledTrackId);

            return CreatedAtAction(nameof(GetSampleById), new { id = sample.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при создании сэмпла: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateSample(int id, [FromBody] UpdateSampleRequest request)
    {
        try
        {
            var sample = await _dbContext.Samples.FindAsync(id);
            if (sample == null)
                return NotFound(new { error = "Сэмпл не найден" });

            if (!string.IsNullOrEmpty(request.Type))
            {
                if (!Enum.TryParse<SampleType>(request.Type, out var sampleType))
                    return BadRequest("Неверный тип сэмпла");
                sample.Type = sampleType;
            }
            if (!string.IsNullOrEmpty(request.Description))
                sample.Description = request.Description;
            if (request.StartTimeSeconds.HasValue)
                sample.StartTimeSeconds = request.StartTimeSeconds;
            if (request.SampledTrackId.HasValue)
                sample.SampledTrackId = request.SampledTrackId.Value;

            sample.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var result = new SampleDto
            {
                Id = sample.Id,
                Type = sample.Type.ToString(),
                Description = sample.Description,
                StartTimeSeconds = sample.StartTimeSeconds,
                TrackId = sample.TrackId,
                SampledTrackId = sample.SampledTrackId,
                CreatedAt = sample.CreatedAt,
                UpdatedAt = sample.UpdatedAt
            };

            _logger.LogInformation("✅ Обновлен сэмпл #{Id}", sample.Id);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при обновлении сэмпла: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

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

            _logger.LogInformation("✅ Удален сэмпл #{Id}", id);

            return Ok(new { message = "Сэмпл удален" });
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при удалении сэмпла: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    private static TrackDto MapTrackDto(Track t)
    {
        return new TrackDto
        {
            Id = t.Id,
            Title = t.Title,
            DurationSeconds = t.DurationSeconds,
            TrackNumber = t.TrackNumber,
            Genre = t.Genre,
            ResourceUrl = t.ResourceUrl,
            AlbumId = t.AlbumId,
            ArtistId = t.ArtistId,
            ArtistName = t.Artist?.Name,
            UserId = t.UserId,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        };
    }
}
