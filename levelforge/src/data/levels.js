// Мок-«сервер» рівнів.
// Дані: src/data/skeletons.json («скелети»: стіни, підлога, вхід, вихід).
// Вороги й скарби розставляються тут, за налаштуваннями та seed:
// той самий seed + ті самі налаштування = той самий рівень.
import skeletons from "./skeletons.json";

// Символи мапи: # стіна  . підлога  S вхід  E вихід  $ скарб  X ворог
const TYPES = {
  "#": "wall",
  ".": "floor",
  S: "start",
  E: "end",
  $: "treasure",
  X: "enemy",
};

export const SIZES = [
  { id: "10x10", width: 10, height: 10 },
  { id: "20x15", width: 20, height: 15 },
  { id: "30x20", width: 30, height: 20 },
  { id: "40x30", width: 40, height: 30 },
];

export const DENSITY_LABELS = { low: "Мало", medium: "Середньо", high: "Багато" };

export const getSize = (sizeId) =>
  SIZES.find((s) => s.id === sizeId) ?? SIZES[0];

// Обмеження залежать від площі: скарбів до 5 %, ворогів до 8 % клітинок
export function getLimits(size) {
  const area = size.width * size.height;
  const enemies = Math.floor(area * 0.08);
  const treasures = Math.floor(area * 0.05);
  return {
    enemies,
    treasures,
    defaultEnemies: Math.round(enemies / 2),
    defaultTreasures: Math.round(treasures / 2),
  };
}

// Рядки мапи -> масив типів клітинок + розміри
export function parse(level) {
  return {
    ...level,
    height: level.map.length,
    width: level.map[0].length,
    cells: level.map.map((row) => [...row].map((ch) => TYPES[ch])),
  };
}

// --- seed ---
function hashSeed(str) {
  let h = 2166136261;
  for (const ch of str) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomSeed = () => `LF-${Math.floor(1000 + Math.random() * 9000)}`;

function shuffle(list, rng) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

const clampInt = (value, max) =>
  Math.min(max, Math.max(0, Math.round(Number(value)) || 0));
const key = (c) => `${c.x},${c.y}`;

// Синхронна збірка рівня (використовується й для стартового рівня)
export function buildLevel({ sizeId, density, enemies, treasures, seed }) {
  const size = getSize(sizeId);
  const limits = getLimits(size);
  const rng = mulberry32(hashSeed(seed));

  const pool = skeletons.filter(
    (s) =>
      s.width === size.width && s.height === size.height && s.density === density
  );
  if (pool.length === 0) throw new Error("Немає рівнів для цих налаштувань");
  const skeleton = pool[Math.floor(rng() * pool.length)];

  const grid = skeleton.map.map((row) => [...row]);
  let start = { x: 0, y: 0 };
  const free = [];
  grid.forEach((row, y) =>
    row.forEach((ch, x) => {
      if (ch === "S") start = { x, y };
      else if (ch === ".") free.push({ x, y });
    })
  );
  shuffle(free, rng);

  // Вороги не ставляться впритул до входу
  const enemyCells = free
    .filter((c) => Math.abs(c.x - start.x) + Math.abs(c.y - start.y) >= 3)
    .slice(0, clampInt(enemies, limits.enemies));
  const used = new Set(enemyCells.map(key));
  const treasureCells = free
    .filter((c) => !used.has(key(c)))
    .slice(0, clampInt(treasures, limits.treasures));

  enemyCells.forEach(({ x, y }) => (grid[y][x] = "X"));
  treasureCells.forEach(({ x, y }) => (grid[y][x] = "$"));

  return parse({
    id: `lvl-${seed}`,
    name: `Рівень ${seed}`,
    seed,
    density,
    map: grid.map((row) => row.join("")),
    path: skeleton.path,
    pathLength: skeleton.pathLength,
    deadEnds: skeleton.deadEnds,
  });
}

// Імітація запиту до API: затримка + результат (або помилка)
export function fetchLevel(params) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(buildLevel(params));
      } catch (err) {
        reject(err);
      }
    }, 600);
  });
}
