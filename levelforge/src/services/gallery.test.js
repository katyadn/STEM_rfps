import { describe, expect, it } from "vitest";
import { buildLevel } from "../data/levels";
import {
  deleteLevel, getSavedLevel, getSavedLevels, isValidLevel, saveLevel,
} from "./gallery";

const good = ["#####", "#S.E#", "#...#", "#...#", "#####"];
const params = { sizeId: "10x10", density: "low", enemies: 2, treasures: 2, seed: "LF-1" };

describe("isValidLevel", () => {
  it("приймає правильну карту", () => {
    expect(isValidLevel({ map: good })).toBe(true);
  });

  it.each([
    ["не масив", { map: "#####" }],
    ["відсутня карта", {}],
    ["null", null],
    ["закоротка", { map: ["###", "#S#", "#E#"] }],
    ["рядки різної довжини", { map: ["#####", "#S.E#", "#..#", "#...#", "#####"] }],
    ["недозволений символ", { map: ["#####", "#S.E#", "#.Z.#", "#...#", "#####"] }],
    ["два входи", { map: ["#####", "#S.E#", "#.S.#", "#...#", "#####"] }],
    ["немає виходу", { map: ["#####", "#S..#", "#...#", "#...#", "#####"] }],
    ["завелика", { map: Array(61).fill("#".repeat(61)) }],
  ])("відхиляє: %s", (_, level) => {
    expect(isValidLevel(level)).toBe(false);
  });
});

describe("галерея користувача", () => {
  it("зберігає й повертає рівень", () => {
    saveLevel("u1", buildLevel(params));
    const items = getSavedLevels("u1");
    expect(items).toHaveLength(1);
    expect(items[0].width).toBe(10);
    expect(items[0].seed).toBe("LF-1");
    expect(items[0].cells).toBeDefined();
  });

  it("не дозволяє зберегти той самий рівень двічі", () => {
    const level = buildLevel(params);
    saveLevel("u1", level);
    expect(() => saveLevel("u1", level)).toThrow("Цей рівень уже є в галереї");
  });

  it("знаходить рівень за id і не знаходить неіснуючий", () => {
    saveLevel("u1", buildLevel(params));
    const [item] = getSavedLevels("u1");
    expect(getSavedLevel("u1", item.id).name).toBe(item.name);
    expect(getSavedLevel("u1", "nope")).toBeNull();
  });

  it("видаляє рівень", () => {
    saveLevel("u1", buildLevel(params));
    const [item] = getSavedLevels("u1");
    deleteLevel("u1", item.id);
    expect(getSavedLevels("u1")).toHaveLength(0);
  });

  it("галереї різних користувачів не перетинаються", () => {
    saveLevel("u1", buildLevel(params));
    expect(getSavedLevels("u2")).toHaveLength(0);
    expect(getSavedLevel("u2", getSavedLevels("u1")[0].id)).toBeNull();
  });

  it("новіші рівні йдуть першими", () => {
    saveLevel("u1", buildLevel(params));
    saveLevel("u1", buildLevel({ ...params, seed: "LF-2", density: "high" }));
    const items = getSavedLevels("u1");
    expect(items[0].savedAt).toBeGreaterThanOrEqual(items[1].savedAt);
  });
});

describe("стійкість до пошкоджених даних", () => {
  it("зіпсований JSON у сховищі дає порожню галерею", () => {
    localStorage.setItem("lf_levels_u1", "{не json");
    expect(getSavedLevels("u1")).toEqual([]);
  });

  it("відкидає записи з невалідною картою", () => {
    localStorage.setItem(
      "lf_levels_u1",
      JSON.stringify([{ id: "1", map: ["xx"] }, { id: "2", name: "ok", map: good, savedAt: 1 }])
    );
    const items = getSavedLevels("u1");
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("2");
  });

  it("прибирає з шляху координати поза картою і нечислові значення", () => {
    localStorage.setItem(
      "lf_levels_u1",
      JSON.stringify([{ id: "1", name: "x", map: good, savedAt: 1, path: [[1, 1], [999, 999], "x", [-1, 0]] }])
    );
    expect(getSavedLevels("u1")[0].path).toEqual([[1, 1]]);
  });

  it("ігнорує невідому щільність і зайві поля", () => {
    localStorage.setItem(
      "lf_levels_u1",
      JSON.stringify([{ id: "1", name: "x", map: good, savedAt: 1, density: "extreme", evil: "<script>" }])
    );
    const [item] = getSavedLevels("u1");
    expect(item.density).toBeUndefined();
    expect(item).not.toHaveProperty("evil");
  });
});
