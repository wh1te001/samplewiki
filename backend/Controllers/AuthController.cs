using Microsoft.AspNetCore.Mvc;
using SampleWiki.DTOs;
using SampleWiki.Services;
using System.Security.Claims;

namespace SampleWiki.Controllers;

[ApiController]
[Route("api/[controller]")]
[Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("AuthRateLimit")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return BadRequest(new { error = string.Join("; ", errors) });
            }

            var response = await _authService.RegisterAsync(request);

            SetJwtCookie(response.UserId, response.Username, response.Role);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Ошибка регистрации: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при регистрации: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return BadRequest(new { error = string.Join("; ", errors) });
            }

            var response = await _authService.LoginAsync(request);

            SetJwtCookie(response.UserId, response.Username, response.Role);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Ошибка входа: {Message}", ex.Message);
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при входе: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Append("jwt", "", new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Secure = false,
            Expires = DateTime.UtcNow.AddDays(-1),
            Path = "/"
        });
        _logger.LogInformation("Пользователь вышел из системы");
        return Ok(new { message = "Вы вышли из системы" });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { error = "Пользователь не аутентифицирован" });

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { error = "Пользователь не найден" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении информации пользователя: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    private void SetJwtCookie(int userId, string username, string role)
    {
        var token = _authService.GenerateToken(userId, username, role);

        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Secure = false,
            Expires = DateTime.UtcNow.AddHours(24),
            Path = "/"
        });
    }
}
