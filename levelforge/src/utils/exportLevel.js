// Експорт рівня у файл JSON. Працює повністю в браузері, без сервера.
// Формат підходить і для майбутнього імпорту (поле format + version).
export const EXPORT_FORMAT = "levelforge-level";

export function levelToExport(level) {
  return {
    format: EXPORT_FORMAT,
    version: 1,
    name: level.name,
    seed: level.seed ?? null,
    density: level.density ?? null,
    width: level.width,
    height: level.height,
    legend: {
      "#": "стіна", ".": "підлога", S: "вхід", E: "вихід", $: "скарб", X: "ворог",
    },
    map: level.map,
    path: level.path ?? [],
    pathLength: level.pathLength ?? 0,
    deadEnds: level.deadEnds ?? 0,
    exportedAt: new Date().toISOString(),
  };
}

// Ім'я файлу лише з безпечних символів
export function exportFileName(level) {
  const base = String(level.seed ?? level.id).replace(/[^A-Za-z0-9_-]/g, "-");
  return `levelforge-${base}-${level.width}x${level.height}.json`;
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
