using System.Security.Cryptography;
using HotelManagement.Api;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi("openapi");

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi("/openapi/{documentName}.json");
}

app.UseHttpsRedirection();

string[] summaries =
[
    "Freezing",
    "Bracing",
    "Chilly",
    "Cool",
    "Mild",
    "Warm",
    "Balmy",
    "Hot",
    "Sweltering",
    "Scorching",
];

app.MapGet(
        "/weatherforecast",
        () =>
        {
            WeatherForecast[] forecast =
            [
                .. Enumerable
                    .Range(1, 5)
                    .Select(index => new WeatherForecast(
                        DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                        RandomNumberGenerator.GetInt32(-20, 55),
                        summaries[RandomNumberGenerator.GetInt32(summaries.Length)]
                    )),
            ];
            return forecast;
        }
    )
    .WithName("GetWeatherForecast");

await app.RunAsync();
