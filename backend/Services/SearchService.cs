using Microsoft.EntityFrameworkCore;
using SampleWiki.Data;
using SampleWiki.DTOs;

namespace SampleWiki.Services;

public class SearchService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<SearchService> _logger;

    public SearchService(AppDbContext dbContext, ILogger<SearchService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<List<ArtistDto>> SearchArtistsAsync(string query, int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<ArtistDto>();

        var results = await _dbContext.Artists
            .Where(a => a.Name.Contains(query))
            .Take(limit)
            .Select(a => new ArtistDto
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                WikiLink = a.WikiLink,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            })
            .ToListAsync();

        _logger.LogInformation("Поиск исполнителей: {Query} - найдено {Count}", query, results.Count);

        return results;
    }

    public async Task<List<AlbumDto>> SearchAlbumsAsync(string query, int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<AlbumDto>();

        var results = await _dbContext.Albums
            .Where(a => a.Title.Contains(query))
            .Take(limit)
            .Select(a => new AlbumDto
            {
                Id = a.Id,
                Title = a.Title,
                ReleaseYear = a.ReleaseYear,
                ArtistId = a.ArtistId,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            })
            .ToListAsync();

        _logger.LogInformation("Поиск альбомов: {Query} - найдено {Count}", query, results.Count);

        return results;
    }

    public async Task<List<TrackDto>> SearchTracksAsync(string query, int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<TrackDto>();

        var results = await _dbContext.Tracks
            .Where(t => t.Title.Contains(query) || (t.Genre != null && t.Genre.Contains(query)))
            .Take(limit)
            .Select(t => new TrackDto
            {
                Id = t.Id,
                Title = t.Title,
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

        _logger.LogInformation("Поиск треков: {Query} - найдено {Count}", query, results.Count);

        return results;
    }

    public async Task<List<SampleDto>> SearchSamplesAsync(string query, int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<SampleDto>();

        var results = await _dbContext.Samples
            .Include(s => s.SampledTrack).ThenInclude(t => t.Artist)
            .Where(s => s.SampledTrack.Title.Contains(query))
            .Take(limit)
            .Select(s => new SampleDto
            {
                Id = s.Id,
                Type = s.Type.ToString(),
                StartTimeSeconds = s.StartTimeSeconds,
                TrackId = s.TrackId,
                SampledTrackId = s.SampledTrackId,
                SampledTrackTitle = s.SampledTrack.Title,
                SampledTrackArtistName = s.SampledTrack.Artist.Name,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();

        _logger.LogInformation("Поиск сэмплов: {Query} - найдено {Count}", query, results.Count);

        return results;
    }

    public async Task<dynamic> GlobalSearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new { artists = new List<ArtistDto>(), albums = new List<AlbumDto>(), tracks = new List<TrackDto>(), samples = new List<SampleDto>() };

        var artists = await SearchArtistsAsync(query, 5);
        var albums = await SearchAlbumsAsync(query, 5);
        var tracks = await SearchTracksAsync(query, 5);
        var samples = await SearchSamplesAsync(query, 5);

        return new
        {
            artists,
            albums,
            tracks,
            samples,
            totalResults = artists.Count + albums.Count + tracks.Count + samples.Count
        };
    }
}
