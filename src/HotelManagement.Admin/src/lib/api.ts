import type { components, operations } from "@/types/api";

export type WeatherForecast = components["schemas"]["WeatherForecast"];

type GetWeatherForecastResponse =
  operations["GetWeatherForecast"]["responses"][200]["content"]["application/json"];

const baseUrl = process.env.API_URL;

if (!baseUrl) {
  throw new Error("API_URL environment variable is not set.");
}

export async function getWeatherForecast(): Promise<GetWeatherForecastResponse> {
  const res = await fetch(`${baseUrl}/weatherforecast`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch weather forecast: ${res.status} ${res.statusText}`,
    );
  }

  return res.json() as Promise<GetWeatherForecastResponse>;
}
