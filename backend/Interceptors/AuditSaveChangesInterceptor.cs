using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SampleWiki.Data;
using System.Text.Json;

namespace SampleWiki.Interceptors;

/// <summary>Интерцептор для логирования и валидации изменений в БД</summary>
public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ILogger<AuditSaveChangesInterceptor> _logger;

    public AuditSaveChangesInterceptor(ILogger<AuditSaveChangesInterceptor> logger)
    {
        _logger = logger;
    }

    /// <summary>Выполняется перед сохранением изменений в БД</summary>
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is AppDbContext context)
        {
            var changeLog = GenerateChangeLog(context);
            if (changeLog.Count > 0)
            {
                _logger.LogInformation("📝 Изменения в БД:\n{Changes}", 
                    string.Join("\n", changeLog));
            }
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    /// <summary>Генерирует логи всех изменений в контексте</summary>
    private static List<string> GenerateChangeLog(AppDbContext context)
    {
        var changes = new List<string>();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    changes.Add($"✅ СОЗДАНО: {entry.Entity.GetType().Name} (ID: {GetEntityId(entry)})");
                    break;

                case EntityState.Modified:
                    var modifications = GetPropertyChanges(entry);
                    if (modifications.Count > 0)
                    {
                        changes.Add($"🔄 ОБНОВЛЕНО: {entry.Entity.GetType().Name} (ID: {GetEntityId(entry)})");
                        changes.AddRange(modifications.Select(m => $"   • {m.Key}: {m.Value.OldValue} → {m.Value.NewValue}"));
                    }
                    break;

                case EntityState.Deleted:
                    changes.Add($"❌ УДАЛЕНО: {entry.Entity.GetType().Name} (ID: {GetEntityId(entry)})");
                    break;
            }
        }

        return changes;
    }

    /// <summary>Получает ID сущности из entity key</summary>
    private static object? GetEntityId(EntityEntry entry)
    {
        var key = entry.Metadata.FindPrimaryKey();
        if (key != null)
        {
            var value = entry.CurrentValues[key.Properties.First()];
            return value;
        }
        return "unknown";
    }

    /// <summary>Получает измененные свойства и их старые/новые значения</summary>
    private static Dictionary<string, (object? OldValue, object? NewValue)> GetPropertyChanges(EntityEntry entry)
    {
        var changes = new Dictionary<string, (object?, object?)>();

        foreach (var property in entry.Properties)
        {
            if (property.IsModified)
            {
                var propName = property.Metadata?.Name ?? "unknown";
                changes[propName] = (property.OriginalValue, property.CurrentValue);
            }
        }

        return changes;
    }
}
