using Microsoft.EntityFrameworkCore;
using SampleWiki.Models;

namespace SampleWiki.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Album> Albums { get; set; }
    public DbSet<Track> Tracks { get; set; }
    public DbSet<Sample> Samples { get; set; }
    public DbSet<Artwork> Artworks { get; set; }
    public DbSet<Revision> Revisions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Artist>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Name).IsRequired().HasMaxLength(200);
            entity.Property(a => a.WikiLink).HasMaxLength(500);
            entity.HasIndex(a => a.Name);
        });

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

        modelBuilder.Entity<Track>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Genre).HasMaxLength(50);
            entity.Property(t => t.ResourceUrl).HasMaxLength(500);

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

        modelBuilder.Entity<Sample>(entity =>
        {
            entity.HasKey(s => s.Id);

            entity.HasOne(s => s.Track)
                .WithMany(t => t.Samples)
                .HasForeignKey(s => s.TrackId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(s => s.SampledTrack)
                .WithMany()
                .HasForeignKey(s => s.SampledTrackId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(s => s.TrackId);
            entity.HasIndex(s => s.SampledTrackId);
        });

        modelBuilder.Entity<Artwork>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Title).IsRequired().HasMaxLength(200);
            entity.Property(a => a.ImageUrl).IsRequired();

            entity.HasOne(a => a.Album)
                .WithMany(al => al.Artworks)
                .HasForeignKey(a => a.AlbumId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(a => a.AlbumId);
        });

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
