using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SampleWiki.Data;
using SampleWiki.Interceptors;
using SampleWiki.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==================== КОНФИГУРАЦИЯ СЕРВИСОВ ====================

// Добавление контроллеров с JSON опциями
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.WriteIndented = true;
    });

// ==================== CORS ====================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ==================== БАЗА ДАННЫХ (Entity Framework Core) ====================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        mySqlOptions => mySqlOptions.EnableStringComparisonTranslations()
    ),
    ServiceLifetime.Transient
);

// ==================== JWT АУТЕНТИФИКАЦИЯ ====================
var jwtKey = builder.Configuration["Jwt:Key"];
var keyBytes = Encoding.UTF8.GetBytes(jwtKey!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// ==================== DEPENDENCY INJECTION (Сервисы) ====================
builder.Services.AddScoped<UrlValidatorService>();
builder.Services.AddScoped<EmbedService>();
builder.Services.AddScoped<SearchService>();
builder.Services.AddScoped<AuthService>();

// ==================== SWAGGER (OpenAPI документация) ====================
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SampleWiki API",
        Version = "v1",
        Description = "REST API для каталога сэмплов музыкальных произведений",
        Contact = new OpenApiContact { Name = "Дипломный проект" }
    });

    // Добавление JWT в Swagger для тестирования
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Description = "Введите JWT токен: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

// ==================== ВАЛИДАЦИЯ И ЛОГИРОВАНИЕ ====================
builder.Services.AddLogging(config =>
{
    config.AddConsole();
    config.SetMinimumLevel(LogLevel.Information);
});

var app = builder.Build();

// ==================== СОЗДАНИЕ БД (если не существует) ====================
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
}

// ==================== MIDDLEWARE КОНВЕЙЕР ====================

// Обработка ошибок
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Swagger
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SampleWiki API v1");
    options.RoutePrefix = string.Empty;
});

// CORS (должен быть после UseSwagger)
app.UseCors("AllowFrontend");

// Redirect HTTP на HTTPS (опционально)
// app.UseHttpsRedirection();

// Аутентификация и авторизация
app.UseAuthentication();
app.UseAuthorization();

// Маршрутизация контроллеров
app.MapControllers();

// ==================== ЗАПУСК ПРИЛОЖЕНИЯ ====================
var port = 5000;
app.Urls.Add($"http://localhost:{port}");

Console.WriteLine($"🚀 Сервер запущен на http://localhost:{port}");
Console.WriteLine($"📖 Swagger документация: http://localhost:{port}");

app.Run();
