// Мок-сервіс рівнів імітує відповідь сервера. Тут перевіряємо лише «контракт»,
// на який спирається інтерфейс, а не сам алгоритм розстановки.
import { describe, expect, it } from "vitest";
import { SIZES, buildLevel, fetchLevel, getLimits, getSize, parse } from "./levels";

const base = { sizeId: "20x15", density: "medium", enemies: 10, treasures: 6, seed: "LF-1234" };
const count = (level, ch) => level.map.join("").split(ch).length - 1;

describe("parse", () => {
  it("перетворює символи на типи клітинок і рахує розміри", () => {
    const level = parse({ map: ["#S.", "#.E"] });
    expect(level.width).toBe(3);
    expect(level.height).toBe(2);
    expect(level.cells[0]).toEqual(["wall", "start", "floor"]);
  });
});

describe("контракт мок-сервісу", () => {
  it("повертає рівень запитаного розміру з одним входом, одним виходом і шляхом", () => {
    for (const size of SIZES) {
      const level = buildLevel({ ...base, sizeId: size.id });
      expect([level.width, level.height]).toEqual([size.width, size.height]);
      expect(count(level, "S")).toBe(1);
      expect(count(level, "E")).toBe(1);
      expect(level.pathLength).toBeGreaterThan(0);
    }
  });

  it("той самий seed відтворює той самий рівень (на цьому тримається поле Seed)", () => {
    expect(buildLevel(base).map).toEqual(buildLevel(base).map);
  });

  it("кількість ворогів і скарбів не перевищує ліміти, які показує інтерфейс", () => {
    const level = buildLevel({ ...base, sizeId: "10x10", enemies: 999, treasures: 999 });
    const limits = getLimits(getSize("10x10"));
    expect(count(level, "X")).toBeLessThanOrEqual(limits.enemies);
    expect(count(level, "$")).toBeLessThanOrEqual(limits.treasures);
  });

  it("ліміти залежать від площі карти", () => {
    expect(getLimits(getSize("10x10"))).toMatchObject({ enemies: 8, treasures: 5 });
    expect(getLimits(getSize("40x30"))).toMatchObject({ enemies: 96, treasures: 60 });
  });

  it("повертає рівень асинхронно, як справжній API", async () => {
    const level = await fetchLevel(base);
    expect(level.seed).toBe("LF-1234");
  });
});
