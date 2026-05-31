namespace SampleWiki.Services;

/// <summary>Сервис для валидации URL адресов</summary>
public class UrlValidatorService
{
    private readonly ILogger<UrlValidatorService> _logger;

    public UrlValidatorService(ILogger<UrlValidatorService> logger)
    {
        _logger = logger;
    }

    /// <summary>Проверяет валидность URL</summary>
    public bool IsValidUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return false;

        try
        {
            var uri = new Uri(url);
            return uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps;
        }
        catch (UriFormatException)
        {
            return false;
        }
    }

    /// <summary>Проверяет валидность ссылки на YouTube видео</summary>
    public bool IsValidYouTubeUrl(string? url)
    {
        if (!IsValidUrl(url))
            return false;

        try
        {
            var uri = new Uri(url!);
            return uri.Host.Contains("youtube.com") || uri.Host.Contains("youtu.be");
        }
        catch
        {
            return false;
        }
    }

    /// <summary>Проверяет валидность ссылки на SoundCloud трек</summary>
    public bool IsValidSoundCloudUrl(string? url)
    {
        if (!IsValidUrl(url))
            return false;

        try
        {
            var uri = new Uri(url!);
            return uri.Host.Contains("soundcloud.com");
        }
        catch
        {
            return false;
        }
    }

    /// <summary>Проверяет валидность ссылки на Bandcamp трек</summary>
    public bool IsValidBandcampUrl(string? url)
    {
        if (!IsValidUrl(url))
            return false;

        try
        {
            var uri = new Uri(url!);
            return uri.Host.Contains("bandcamp.com");
        }
        catch
        {
            return false;
        }
    }

    /// <summary>Проверяет валидность ссылки на Rutube видео</summary>
    public bool IsValidRutubeUrl(string? url)
    {
        if (!IsValidUrl(url))
            return false;

        try
        {
            var uri = new Uri(url!);
            return uri.Host.Contains("rutube.ru");
        }
        catch
        {
            return false;
        }
    }

    /// <summary>Извлекает ID видео из Rutube ссылки (32-символьный hex)</summary>
    public string? ExtractRutubeId(string? url)
    {
        if (!IsValidRutubeUrl(url))
            return null;

        try
        {
            var match = System.Text.RegularExpressions.Regex.Match(url!, @"rutube\.ru\/video\/([a-f0-9]{32})");
            return match.Success ? match.Groups[1].Value : null;
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при извлечении Rutube ID: {Error}", ex.Message);
            return null;
        }
    }

    /// <summary>Проверяет валидность ссылки на VK Video</summary>
    public bool IsValidVkVideoUrl(string? url)
    {
        if (!IsValidUrl(url))
            return false;

        try
        {
            var uri = new Uri(url!);
            return uri.Host.Contains("vk.com") || uri.Host.Contains("vkvideo.ru");
        }
        catch
        {
            return false;
        }
    }

    /// <summary>Извлекает ID видео из VK Video ссылки (формат: oid_id)</summary>
    public string? ExtractVkVideoId(string? url)
    {
        if (!IsValidVkVideoUrl(url))
            return null;

        try
        {
            var match = System.Text.RegularExpressions.Regex.Match(url!, @"(?:vk\.com\/video|vkvideo\.ru\/video)(-?\d+)_(\d+)");
            if (match.Success)
                return $"{match.Groups[1].Value}_{match.Groups[2].Value}";
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при извлечении VK Video ID: {Error}", ex.Message);
            return null;
        }
    }

    /// <summary>Извлекает ID видео из YouTube ссылки</summary>
    public string? ExtractYouTubeId(string? url)
    {
        if (!IsValidYouTubeUrl(url))
            return null;

        try
        {
            var uri = new Uri(url!);

            // Для youtu.be
            if (uri.Host.Contains("youtu.be"))
            {
                return uri.AbsolutePath.TrimStart('/');
            }

            // Для youtube.com
            var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
            return query["v"];
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при извлечении YouTube ID: {Error}", ex.Message);
            return null;
        }
    }
}
