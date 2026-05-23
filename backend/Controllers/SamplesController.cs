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
                .Select(s => new SampleDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Type = s.Type.ToString(),
                    Description = s.Description,
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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSampleById(int id)
    {
        try
        {
            var sample = await _dbContext.Samples
                .Include(s => s.Track)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sample == null)
                return NotFound(new { error = "Сэмпл не найден" });

            var result = new SampleDetailDto
            {
                Id = sample.Id,
                Title = sample.Title,
                Type = sample.Type.ToString(),
                Description = sample.Description,
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
                    ResourceUrl = sample.Track.ResourceUrl,
                    AlbumId = sample.Track.AlbumId,
                    ArtistId = sample.Track.ArtistId,
                    UserId = sample.Track.UserId,
                    CreatedAt = sample.Track.CreatedAt,
                    UpdatedAt = sample.Track.UpdatedAt
                }
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
                .Where(s => s.TrackId == trackId)
                .Select(s => new SampleDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Type = s.Type.ToString(),
                    Description = s.Description,
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
                Title = request.Title,
                Type = sampleType,
                Description = request.Description,
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

            sample.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var result = new SampleDto
            {
                Id = sample.Id,
                Title = sample.Title,
                Type = sample.Type.ToString(),
                Description = sample.Description,
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
