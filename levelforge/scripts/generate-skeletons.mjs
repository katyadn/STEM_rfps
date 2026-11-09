// Одноразовий скрипт: генерує «скелети» рівнів (стіни, підлога, вхід, вихід)
// у src/data/skeletons.json. Запуск: node scripts/generate-skeletons.mjs
// У застосунку цей файл відіграє роль відповіді сервера.
import { writeFileSync } from "node:fs";

const SIZES = [[10, 10], [20, 15], [30, 20], [40, 30]];
const DENSITIES = { low: 0.36, medium: 0.44, high: 0.5 }; // початкова частка стін
// Допустима частка стін усередині рамки (%), щоб назви щільності були чесними
const BANDS = { low: [12, 30], medium: [32, 46], high: [48, 62] };
const PER_COMBO = 2;

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str) {
  let h = 2166136261;
  for (const ch of str) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const isBorder = (x, y, w, h) => x === 0 || y === 0 || x === w - 1 || y === h - 1;

function wallsAround(g, x, y) {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      n += g[y + dy]?.[x + dx] ?? 1;
    }
  return n;
}

function cave(w, h, prob, rng) {
  let g = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (isBorder(x, y, w, h) || rng() < prob ? 1 : 0)));
  for (let step = 0; step < 4; step++) {
    g = g.map((row, y) => row.map((c, x) => {
      if (isBorder(x, y, w, h)) return 1;
      const n = wallsAround(g, x, y);
      return n >= 5 || (c === 1 && n === 4) ? 1 : 0;
    }));
  }
  return g;
}

function bfs(g, [sx, sy]) {
  const prev = new Map([[`${sx},${sy}`, null]]);
  const order = [[sx, sy]];
  for (let i = 0; i < order.length; i++) {
    const [x, y] = order[i];
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
      if (g[ny]?.[nx] === 0 && !prev.has(k)) { prev.set(k, [x, y]); order.push([nx, ny]); }
    }
  }
  return { order, prev };
}

function largestRegion(g) {
  const seen = new Set();
  let best = [];
  g.forEach((row, y) => row.forEach((c, x) => {
    if (c !== 0 || seen.has(`${x},${y}`)) return;
    const { order } = bfs(g, [x, y]);
    order.forEach(([a, b]) => seen.add(`${a},${b}`));
    if (order.length > best.length) best = order;
  }));
  return best;
}

function build(w, h, density, id) {
  for (let attempt = 0; attempt < 20000; attempt++) {
    const rng = mulberry32((hash(id) + attempt * 7919) >>> 0);
    const g = cave(w, h, DENSITIES[density], rng);
    const region = largestRegion(g);
    if (region.length < (w - 2) * (h - 2) * 0.35) continue;
    const clean = g.map((r) => r.map(() => 1));
    region.forEach(([x, y]) => (clean[y][x] = 0));
    const a = bfs(clean, region[0]).order.at(-1);
    const { order, prev } = bfs(clean, a);
    const b = order.at(-1);
    const path = [];
    for (let p = b; p; p = prev.get(`${p[0]},${p[1]}`)) path.push(p);
    path.reverse(); // від S до E
    if (path.length - 1 < (w + h) * 0.5) continue;
    const innerWalls = clean.flat().filter(Boolean).length - (2 * (w + h) - 4);
    const wallPct = (innerWalls / ((w - 2) * (h - 2))) * 100;
    if (wallPct < BANDS[density][0] || wallPct > BANDS[density][1]) continue;

    const map = clean.map((row, y) => row.map((c, x) =>
      c ? "#" : x === path[0][0] && y === path[0][1] ? "S"
        : x === b[0] && y === b[1] ? "E" : "."));
    let deadEnds = 0;
    map.forEach((row, y) => row.forEach((c, x) => {
      if (c !== ".") return;
      const open = DIRS.filter(([dx, dy]) => map[y + dy][x + dx] !== "#").length;
      if (open === 1) deadEnds++;
    }));
    return { id, width: w, height: h, density, map: map.map((r) => r.join("")),
      path, pathLength: path.length - 1, deadEnds };
  }
  throw new Error(`Не вдалося згенерувати ${id}`);
}

const out = [];
for (const [w, h] of SIZES)
  for (const d of Object.keys(DENSITIES))
    for (let i = 1; i <= PER_COMBO; i++) out.push(build(w, h, d, `sk-${w}x${h}-${d}-${i}`));

writeFileSync(new URL("../src/data/skeletons.json", import.meta.url),
  "[\n" + out.map((s) => JSON.stringify(s)).join(",\n") + "\n]\n");

for (const s of out) {
  const walls = s.map.join("").split("#").length - 1;
  console.log(s.id.padEnd(22), "стіни", String(Math.round(walls / (s.width * s.height) * 100)).padStart(2) + "%",
    "шлях", String(s.pathLength).padStart(3), "тупики", String(s.deadEnds).padStart(2));
}
console.log("\n" + out.find((s) => s.id === "sk-20x15-medium-1").map.join("\n"));
