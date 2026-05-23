using Microsoft.EntityFrameworkCore;
using SampleWiki.Models;

namespace SampleWiki.Data;

public class AppDbContext : DbContext
{
    /// <summary>Конструктор DbContext с опциями конфигурации</summary>
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    /// <summary>Таблица пользователей</summary>
    public DbSet<User> Users { get; set; }

    /// <summary>Таблица исполнителей</summary>
    public DbSet<Artist> Artists { get; set; }

    /// <summary>Таблица альбомов</summary>
    public DbSet<Album> Albums { get; set; }

    /// <summary>Таблица треков</summary>
    public DbSet<Track> Tracks { get; set; }

    /// <summary>Таблица сэмплов</summary>
    public DbSet<Sample> Samples { get; set; }

    /// <summary>Таблица артворков (обложек)</summary>
    public DbSet<Artwork> Artworks { get; set; }

    /// <summary>Таблица истории правок</summary>
    public DbSet<Revision> Revisions { get; set; }

    /// <summary>Конфигурация моделей и связей</summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==================== КОНФИГУРАЦИЯ USER ====================
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // ==================== КОНФИГУРАЦИЯ ARTIST ====================
        modelBuilder.Entity<Artist>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Name).IsRequired().HasMaxLength(200);
            entity.Property(a => a.WikiLink).HasMaxLength(500);
            entity.HasIndex(a => a.Name);
        });

        // ==================== КОНФИГУРАЦИЯ ALBUM ====================
        modelBuilder.Entity<Album>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Title).IsRequired().HasMaxLength(200);
            entity.HasOne(a => a.Artist)
                .WithMany(ar => ar.Albums)
                .HasForeignKey(a => a.ArtistId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(a => new { a.ArtistId, a.Title });
        });

        // ==================== КОНФИГУРАЦИЯ TRACK ====================
        modelBuilder.Entity<Track>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Genre).HasMaxLength(50);
            
            entity.HasOne(t => t.Album)
                .WithMany(al => al.Tracks)
                .HasForeignKey(t => t.AlbumId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(t => t.Artist)
                .WithMany(ar => ar.Tracks)
                .HasForeignKey(t => t.ArtistId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(t => t.User)
                .WithMany(u => u.Tracks)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasIndex(t => new { t.AlbumId, t.TrackNumber });
        });

        // ==================== КОНФИГУРАЦИЯ SAMPLE ====================
        modelBuilder.Entity<Sample>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Title).IsRequired().HasMaxLength(200);
            entity.Property(s => s.PlatformId).IsRequired().HasMaxLength(100);
            entity.Property(s => s.StartTime).IsRequired().HasMaxLength(20);
            entity.Property(s => s.EndTime).IsRequired().HasMaxLength(20);
            
            entity.HasOne(s => s.Track)
                .WithMany(t => t.Samples)
                .HasForeignKey(s => s.TrackId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(s => s.TrackId);
        });

        // ==================== КОНФИГУРАЦИЯ ARTWORK ====================
        modelBuilder.Entity<Artwork>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Title).IsRequired().HasMaxLength(200);
            entity.Property(a => a.ImageUrl).IsRequired();
            
            entity.HasOne(a => a.Album)
                .WithMany(al => al.Artworks)
                .HasForeignKey(a => a.AlbumId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(a => a.Sample)
                .WithMany(s => s.Artworks)
                .HasForeignKey(a => a.SampleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==================== КОНФИГУРАЦИЯ REVISION ====================
        modelBuilder.Entity<Revision>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.EntityName).IsRequired().HasMaxLength(100);
            entity.Property(r => r.Description).IsRequired();
            
            entity.HasOne(r => r.User)
                .WithMany(u => u.Revisions)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(r => r.Track)
                .WithMany(t => t.Revisions)
                .HasForeignKey(r => r.TrackId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasIndex(r => new { r.EntityName, r.EntityId });
            entity.HasIndex(r => r.UserId);
        });
    }
}
