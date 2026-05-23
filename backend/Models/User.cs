namespace SampleWiki.Models;

public class User : BaseEntity
{
    /// <summary>Уникальное имя пользователя</summary>
    public required string Username { get; set; }

    /// <summary>Email адрес пользователя</summary>
    public required string Email { get; set; }

    /// <summary>Хешированный пароль (BCrypt)</summary>
    public required string PasswordHash { get; set; }

    /// <summary>Роль пользователя (Guest, User, Admin)</summary>
    public UserRole Role { get; set; } = UserRole.User;

    /// <summary>Является ли аккаунт активным</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Дата последнего входа</summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>Связь: Музыкальные произведения, добавленные пользователем</summary>
    public ICollection<Track> Tracks { get; set; } = new List<Track>();

    /// <summary>Связь: Истории правок, сделанные пользователем</summary>
    public ICollection<Revision> Revisions { get; set; } = new List<Revision>();
}
