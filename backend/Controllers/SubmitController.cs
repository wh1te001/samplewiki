using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWiki.Data;
using SampleWiki.DTOs;
using SampleWiki.Models;
using System.Security.Claims;

namespace SampleWiki.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmitController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<SubmitController> _logger;

    public SubmitController(AppDbContext dbContext, ILogger<SubmitController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> SubmitSample([FromBody] SubmitSampleRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { error = "Пользователь не авторизован" });

            if (!Enum.TryParse<SampleType>(request.SampleType, out var sampleType))
                return BadRequest(new { error = "Неверный тип сэмпла" });

            // ============ SAMPLER SIDE ============
            var samplerTrack = await ResolveTrack(
                request.SamplerTrackId,
                request.SamplerTrackTitle,
                request.SamplerArtistId,
                request.SamplerArtistName,
                request.SamplerAlbumTitle,
                request.SamplerAlbumReleaseYear,
                request.SamplerAlbumImageUrl,
                request.SamplerTrackGenre,
                request.SamplerTrackResourceUrl,
                userId
            );

            // ============ ORIGINAL SIDE ============
            var originalTrack = await ResolveTrack(
                request.OriginalTrackId,
                request.OriginalTrackTitle,
                request.OriginalArtistId,
                request.OriginalArtistName,
                request.OriginalAlbumTitle,
                request.OriginalAlbumReleaseYear,
                request.OriginalAlbumImageUrl,
                request.OriginalTrackGenre,
                request.OriginalTrackResourceUrl,
                userId
            );

            // ============ CREATE SAMPLE ============
            var sample = new Sample
            {
                Type = sampleType,
                StartTimeSeconds = request.StartTimeSeconds,
                TrackId = samplerTrack.Id,
                SampledTrackId = originalTrack.Id
            };

            _dbContext.Samples.Add(sample);

            // Revisions
            _dbContext.Revisions.Add(new Revision
            {
                TrackId = samplerTrack.Id,
                UserId = userId,
                EntityName = "Sample",
                EntityId = sample.Id,
                Description = $"Добавлен сэмпл: {samplerTrack.Title} ← {originalTrack.Title}"
            });

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("✅ Создан сэмпл #{Id}: {Sampler} ← {Original}",
                sample.Id, samplerTrack.Title, originalTrack.Title);

            return Ok(new
            {
                sampleId = sample.Id,
                samplerTrackId = samplerTrack.Id,
                originalTrackId = originalTrack.Id,
                trackUrl = $"/track.html?id={samplerTrack.Id}",
                sampleUrl = $"/sample.html?id={sample.Id}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при создании сэмпла: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    private async Task<Track> ResolveTrack(
        int? existingTrackId,
        string? trackTitle,
        int? artistId,
        string? artistName,
        string? albumTitle,
        int? albumReleaseYear,
        string? albumImageUrl,
        string? genre,
        string? resourceUrl,
        int userId)
    {
        // If existing track ID provided, use it
        if (existingTrackId.HasValue)
        {
            var track = await _dbContext.Tracks
                .Include(t => t.Artist)
                .FirstOrDefaultAsync(t => t.Id == existingTrackId.Value);

            if (track != null)
                return track;
        }

        // Need artist
        Artist artist;
        if (artistId.HasValue)
        {
            artist = await _dbContext.Artists.FindAsync(artistId.Value)
                ?? throw new InvalidOperationException("Артист не найден");
        }
        else if (!string.IsNullOrWhiteSpace(artistName))
        {
            artist = await _dbContext.Artists
                .FirstOrDefaultAsync(a => a.Name == artistName)
                ?? new Artist { Name = artistName };

            if (artist.Id == 0)
                _dbContext.Artists.Add(artist);
        }
        else
        {
            throw new InvalidOperationException("Не указан артист");
        }

        await _dbContext.SaveChangesAsync();

        // Need album
        Album album;
        var albumTitleNotNull = albumTitle ?? "Unknown Album";
        album = await _dbContext.Albums
            .FirstOrDefaultAsync(a => a.ArtistId == artist.Id && a.Title == albumTitleNotNull)
            ?? new Album
            {
                Title = albumTitleNotNull,
                ArtistId = artist.Id,
                ReleaseYear = albumReleaseYear
            };

        if (album.Id == 0)
            _dbContext.Albums.Add(album);

        await _dbContext.SaveChangesAsync();

        // Artwork
        if (!string.IsNullOrWhiteSpace(albumImageUrl) && album.Id != 0)
        {
            var hasArtwork = await _dbContext.Artworks.AnyAsync(a => a.AlbumId == album.Id);
            if (!hasArtwork)
            {
                _dbContext.Artworks.Add(new Artwork
                {
                    Title = album.Title,
                    ImageUrl = albumImageUrl,
                    AlbumId = album.Id
                });
                await _dbContext.SaveChangesAsync();
            }
        }

        // Need track
        var trackTitleNotNull = trackTitle ?? "Unknown Track";
        var existingTrack = await _dbContext.Tracks
            .FirstOrDefaultAsync(t => t.ArtistId == artist.Id && t.Title == trackTitleNotNull);

        if (existingTrack != null)
            return existingTrack;

        var newTrack = new Track
        {
            Title = trackTitleNotNull,
            Genre = genre,
            ResourceUrl = resourceUrl,
            AlbumId = album.Id,
            ArtistId = artist.Id,
            UserId = userId,
            TrackNumber = null
        };

        _dbContext.Tracks.Add(newTrack);
        await _dbContext.SaveChangesAsync();

        return newTrack;
    }
}
