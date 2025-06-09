using Job_Managment_Backend.Data;
using Job_Managment_Backend;
using Job_Managment_Backend.BackgroundServices;
using Job_Managment_Backend.Hubs;
using Job_Managment_Backend.Repositories;
using Job_Managment_Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Http.Connections;
using System.Collections.Concurrent;
using System.Threading;

var builder = WebApplication.CreateBuilder(args);

// Logging configuration
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add necessary types for concurrency
builder.Services.AddSingleton<SemaphoreSlim>(_ => new SemaphoreSlim(10, 10));
builder.Services.AddSingleton<ConcurrentDictionary<Guid, CancellationTokenSource>>(_ =>
    new ConcurrentDictionary<Guid, CancellationTokenSource>());

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add database context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add repositories
builder.Services.AddScoped<JobRepository>();
builder.Services.AddScoped<WorkerRepository>();

// Add services
builder.Services.AddScoped<JobService>();
builder.Services.AddScoped<WorkerService>();
builder.Services.AddScoped<NotificationService>();

// Configure SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 10240; // 10 KB
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
});

// Add background services
builder.Services.AddHostedService<JobQueueProcessor>();

// Add CORS with more specific configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactAppPolicy", builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:3000",   
                "https://localhost:3000", 
                "http://127.0.0.1:3000",   
                "https://127.0.0.1:3000"   
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); 
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.UseCors("ReactAppPolicy");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Map SignalR hubs with transport options
app.MapHub<JobHub>("/hubs/jobs", options =>
{
    options.Transports =
        HttpTransportType.WebSockets |
        HttpTransportType.ServerSentEvents |
        HttpTransportType.LongPolling;
});

app.MapHub<WorkerHub>("/hubs/workers", options =>
{
    options.Transports =
        HttpTransportType.WebSockets |
        HttpTransportType.ServerSentEvents |
        HttpTransportType.LongPolling;
});

// Initialize database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        SeedData.Initialize(app.Services);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding or migrating the database.");
    }
}

app.Run();