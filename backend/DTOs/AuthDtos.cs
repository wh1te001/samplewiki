using System.ComponentModel.DataAnnotations;

namespace SampleWiki.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "Имя пользователя обязательно")]
    [MinLength(3, ErrorMessage = "Имя пользователя должно быть минимум 3 символа")]
    [MaxLength(50, ErrorMessage = "Имя пользователя должно быть максимум 50 символов")]
    [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Имя пользователя может содержать только буквы, цифры и _")]
    public required string Username { get; set; }

    [Required(ErrorMessage = "Email обязателен")]
    [EmailAddress(ErrorMessage = "Некорректный формат email")]
    [MaxLength(100, ErrorMessage = "Email слишком длинный")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Пароль обязателен")]
    [MinLength(8, ErrorMessage = "Пароль должен быть минимум 8 символов")]
    [MaxLength(128, ErrorMessage = "Пароль слишком длинный")]
    [RegularExpression(@"^(?=.*\d).{8,}$",
        ErrorMessage = "Пароль должен содержать минимум 8 символов и хотя бы одну цифру")]
    public required string Password { get; set; }
}

public class LoginRequest
{
    [Required(ErrorMessage = "Имя пользователя обязательно")]
    public required string Username { get; set; }

    [Required(ErrorMessage = "Пароль обязателен")]
    public required string Password { get; set; }
}

public class AuthResponse
{
    public int UserId { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Role { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class UserDto
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
