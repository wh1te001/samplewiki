using Microsoft.AspNetCore.Mvc;
using SampleWiki.DTOs;
using SampleWiki.Services;

namespace SampleWiki.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>Регистрация нового пользователя</summary>
    /// <remarks>
    /// POST /api/auth/register
    /// {
    ///   "username": "user123",
    ///   "email": "user@example.com",
    ///   "password": "securepassword"
    /// }
    /// </remarks>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest("Некорректные данные");

            var response = await _authService.RegisterAsync(request);
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

    /// <summary>Вход пользователя</summary>
    /// <remarks>
    /// POST /api/auth/login
    /// {
    ///   "username": "user123",
    ///   "password": "securepassword"
    /// }
    /// </remarks>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest("Некорректные данные");

            var response = await _authService.LoginAsync(request);
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

    /// <summary>Получить информацию о текущем пользователе</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("Пользователь не аутентифицирован");

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound("Пользователь не найден");

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError("Ошибка при получении информации пользователя: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }
}
