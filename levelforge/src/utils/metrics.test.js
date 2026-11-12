// Метрики рахуються на клієнті й виводяться в панелі, тому їх коректність важлива для UI.
import { describe, expect, it } from "vitest";
import { parse } from "../data/levels";
import { countCells, getMetrics } from "./metrics";

const small = (extra = {}) =>
  parse({ map: ["#####", "#S.E#", "#.X.#", "#$..#", "#####"], pathLength: 2, deadEnds: 0, ...extra });

describe("метрики для панелі", () => {
  it("рахує клітинки за типом", () => {
    const level = small();
    expect(countCells(level, "wall")).toBe(16);
    expect(countCells(level, "enemy")).toBe(1);
    expect(countCells(level, "treasure")).toBe(1);
  });

  it("рахує площу, стіни, прохідні клітинки й щільність на 100 клітинок", () => {
    const m = getMetrics(small());
    expect(m).toMatchObject({ area: 25, walls: 16, walkable: 9 });
    expect(m.wallPercent).toBeCloseTo(64);
    expect(m.enemiesPer100).toBeCloseTo(4);
  });

  it("визначає наявність шляху за його довжиною", () => {
    expect(getMetrics(small({ pathLength: 2 })).hasPath).toBe(true);
    expect(getMetrics(small({ pathLength: 0 })).hasPath).toBe(false);
  });

  it("індекс збалансованості — ціле число від 0 до 100", () => {
    const { balance } = getMetrics(small());
    expect(Number.isInteger(balance)).toBe(true);
    expect(balance).toBeGreaterThanOrEqual(0);
    expect(balance).toBeLessThanOrEqual(100);
  });

  it("складність має одну з трьох позначок", () => {
    expect(["низька", "середня", "висока"]).toContain(getMetrics(small()).difficulty.label);
  });

  it("не ламається, якщо в рівня немає даних про шлях", () => {
    const level = parse({ map: ["#####", "#S.E#", "#...#", "#...#", "#####"] });
    expect(getMetrics(level)).toMatchObject({ pathLength: 0, deadEnds: 0, hasPath: false });
  });
});
