// Галерея збережених рівнів. Дані окремо для кожного користувача в localStorage.
// Контракт (get/save/delete) такий самий, як у майбутнього API.
import { parse } from "../data/levels";

const key = (userId) => `lf_levels_${userId}`;
const VALID_ROW = /^[#.SE$X]+$/;

// Перевіряє форму рівня: захист від пошкоджених або підроблених даних
export function isValidLevel(level) {
  const map = level?.map;
  return (
    Array.isArray(map) &&
    map.length >= 5 &&
    map.length <= 30 &&
    map.every(
      (row) =>
        typeof row === "string" &&
        row.length === map.length &&
        VALID_ROW.test(row)
    )
  );
}

function read(userId) {
  try {
    const items = JSON.parse(localStorage.getItem(key(userId)));
    return Array.isArray(items) ? items.filter(isValidLevel) : [];
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
      difficulty: level.difficulty,
      map: level.map,
      savedAt: Date.now(),
    },
  ]);
}

export function deleteLevel(userId, levelId) {
  write(
    userId,
    read(userId).filter((item) => item.id !== levelId)
  );
}
