// Метрики рівня та орієнтовний «індекс збалансованості».
// Формула демонстраційна (імітація серверного модуля оцінювання): вона
// порівнює рівень зі «типовим» і нічого не каже про те, добре це чи погано.
const clamp = (v) => Math.min(100, Math.max(0, v));

export function countCells(level, type) {
  return level.cells.reduce(
    (sum, row) => sum + row.filter((t) => t === type).length,
    0
  );
}

// 100 балів усередині [low, high]; поза ним значення падає
function band(value, low, high, falloff) {
  if (value < low) return clamp((value / low) * 100);
  if (value > high) return clamp(100 - (value - high) * falloff);
  return 100;
}

export function getMetrics(level) {
  const area = level.width * level.height;
  const walls = countCells(level, "wall");
  const enemies = countCells(level, "enemy");
  const treasures = countCells(level, "treasure");
  const pathLength = level.pathLength ?? 0;
  const deadEnds = level.deadEnds ?? 0;

  const per100 = (n) => (n / area) * 100;
  const wallPercent = per100(walls);
  const enemiesPer100 = per100(enemies);
  const treasuresPer100 = per100(treasures);
  const pathRatio = pathLength / (level.width + level.height);

  // Індекс збалансованості: середнє чотирьох порівнянь зі «типовим» рівнем
  const balance = Math.round(
    (clamp(((pathRatio - 0.4) / 0.8) * 100) +
      band(enemiesPer100, 2, 6, 20) +
      band(treasuresPer100, 1, 3, 25) +
      band(wallPercent, 30, 60, 4)) / 4
  );

  // Складність — наслідок параметрів, а не окреме налаштування
  const d =
    0.5 * Math.min(1, enemiesPer100 / 8) +
    0.3 * Math.min(1, pathRatio / 2) +
    0.2 * Math.min(1, per100(deadEnds) / 6);
  const difficulty = {
    percent: Math.round(d * 100),
    label: d < 0.33 ? "низька" : d < 0.66 ? "середня" : "висока",
  };

  return {
    area, walls, walkable: area - walls, wallPercent,
    enemies, treasures, enemiesPer100, treasuresPer100,
    pathLength, deadEnds, hasPath: pathLength > 0,
    balance, difficulty,
  };
}
