import { getWeatherForecast } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Page() {
  const forecasts = await getWeatherForecast();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <main className="w-full max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Weather Forecast
        </h1>
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3 text-right">Temp (°C)</th>
                <th className="px-4 py-3 text-right">Temp (°F)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {forecasts.map((f) => (
                <tr
                  key={f.date}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 font-mono text-zinc-700 dark:text-zinc-300">
                    {f.date}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {f.summary ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                    {f.temperatureC}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                    {f.temperatureF ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
