// Галерея збережених рівнів. Дані окремо для кожного користувача в localStorage.
// Контракт (get/save/delete) такий самий, як у майбутнього API.
import { DENSITY_LABELS, parse } from "../data/levels";

const key = (userId) => `lf_levels_${userId}`;
const VALID_ROW = /^[#.SE$X]+$/;

// Перевіряє форму рівня: захист від пошкоджених або підроблених даних
export function isValidLevel(level) {
  const map = level?.map;
  if (!Array.isArray(map) || map.length < 5 || map.length > 60) return false;
  const width = map[0]?.length;
  const flat = Array.isArray(map) ? map.join("") : "";
  return (
    typeof width === "number" &&
    width >= 5 &&
    width <= 60 &&
    map.every((row) => typeof row === "string" && row.length === width && VALID_ROW.test(row)) &&
    flat.split("S").length === 2 && // рівно один вхід
    flat.split("E").length === 2 // рівно один вихід
  );
}

// Залишає лише очікувані поля з перевіреними типами
function clean(item) {
  const height = item.map.length;
  const width = item.map[0].length;
  const path = Array.isArray(item.path)
    ? item.path.filter(
        (p) =>
          Array.isArray(p) && Number.isInteger(p[0]) && Number.isInteger(p[1]) &&
          p[0] >= 0 && p[0] < width && p[1] >= 0 && p[1] < height
      )
    : [];
  return {
    id: String(item.id),
    name: String(item.name ?? "Рівень").slice(0, 60),
    seed: typeof item.seed === "string" ? item.seed.slice(0, 16) : undefined,
    density: item.density in DENSITY_LABELS ? item.density : undefined,
    map: item.map,
    path,
    pathLength: Number.isFinite(item.pathLength) ? item.pathLength : 0,
    deadEnds: Number.isFinite(item.deadEnds) ? item.deadEnds : 0,
    savedAt: Number.isFinite(item.savedAt) ? item.savedAt : 0,
  };
}

function read(userId) {
  try {
    const items = JSON.parse(localStorage.getItem(key(userId)));
    return Array.isArray(items) ? items.filter(isValidLevel).map(clean) : [];
  } catch {
    return [];
  }
}

function write(userId, items) {
  localStorage.setItem(key(userId), JSON.stringify(items));
}

export function getSavedLevels(userId) {
  return read(userId)
    .map(parse)
    .sort((a, b) => b.savedAt - a.savedAt);
}

export function saveLevel(userId, level) {
  const items = read(userId);
  const signature = level.map.join("\n");
  if (items.some((item) => item.map.join("\n") === signature)) {
    throw new Error("Цей рівень уже є в галереї");
  }
  write(userId, [
    ...items,
    {
      id: crypto.randomUUID(),
      name: level.name,
      seed: level.seed,
      density: level.density,
      map: level.map,
      path: level.path,
      pathLength: level.pathLength,
      deadEnds: level.deadEnds,
      savedAt: Date.now(),
    },
  ]);
}

export function deleteLevel(userId, levelId) {
  write(userId, read(userId).filter((item) => item.id !== levelId));
}
