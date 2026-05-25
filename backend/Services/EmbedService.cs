using SampleWiki.Models;

namespace SampleWiki.Services;

/// <summary>Сервис для работы с эмбедами видео с различных платформ</summary>
public class EmbedService
{
    private readonly ILogger<EmbedService> _logger;

    public EmbedService(ILogger<EmbedService> logger)
    {
        _logger = logger;
    }

    /// <summary>Генерирует HTML для встраивания видео на основе платформы</summary>
    public string GenerateEmbedHtml(PlatformType platform, string platformId, int width = 560, int height = 315)
    {
        return platform switch
        {
            PlatformType.Youtube => GenerateYouTubeEmbed(platformId, width, height),
            PlatformType.Soundcloud => GenerateSoundCloudEmbed(platformId),
            PlatformType.Bandcamp => GenerateBandcampEmbed(platformId),
            _ => "<p>Неподдерживаемая платформа</p>"
        };
    }

    /// <summary>Генерирует HTML для YouTube эмбеда</summary>
    private string GenerateYouTubeEmbed(string videoId, int width, int height)
    {
        if (string.IsNullOrWhiteSpace(videoId))
        {
            _logger.LogWarning("YouTube ID пуст");
            return "<p>Ошибка: не указан ID видео</p>";
        }

        return $@"
            <iframe 
                width=""{width}"" 
                height=""{height}"" 
                src=""https://www.youtube.com/embed/{videoId}"" 
                title=""YouTube video player"" 
                frameborder=""0"" 
                allow=""accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"" 
                referrerpolicy=""strict-origin-when-cross-origin""
                allowfullscreen>
            </iframe>";
    }

    /// <summary>Генерирует HTML для SoundCloud эмбеда</summary>
    private string GenerateSoundCloudEmbed(string trackUrl)
    {
        if (string.IsNullOrWhiteSpace(trackUrl))
        {
            _logger.LogWarning("SoundCloud URL пуст");
            return "<p>Ошибка: не указана ссылка</p>";
        }

        var encodedUrl = System.Web.HttpUtility.UrlEncode(trackUrl);

        return $@"
            <iframe 
                width=""100%"" 
                height=""166"" 
                scrolling=""no"" 
                frameborder=""no"" 
                allow=""autoplay"" 
                src=""https://w.soundcloud.com/player/?url={encodedUrl}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"">
            </iframe>";
    }

    /// <summary>Генерирует HTML для Bandcamp эмбеда</summary>
    private string GenerateBandcampEmbed(string trackUrl)
    {
        if (string.IsNullOrWhiteSpace(trackUrl))
        {
            _logger.LogWarning("Bandcamp URL пуст");
            return "<p>Ошибка: не указана ссылка</p>";
        }

        return $@"
            <iframe 
                style=""border: 0; width: 100%; height: 120px;"" 
                src=""https://bandcamp.com/EmbeddedPlayer/track={trackUrl}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/transparent=true/"" 
                seamless>
            </iframe>";
    }

    /// <summary>Получает предварительный просмотр видео (URL превью)</summary>
    public string? GetVideoThumbnailUrl(PlatformType platform, string platformId)
    {
        return platform switch
        {
            PlatformType.Youtube => $"https://img.youtube.com/vi/{platformId}/0.jpg",
            PlatformType.Soundcloud => null, // SoundCloud API требует токена
            PlatformType.Bandcamp => null,   // Bandcamp не предоставляет прямых URL превью
            _ => null
        };
    }
}
