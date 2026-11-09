import { afterEach, describe, expect, it, vi } from "vitest";
import { EXPORT_FORMAT, downloadJson, exportFileName, levelToExport } from "./exportLevel";

const level = {
  id: "abc", name: "Рівень LF-3738", seed: "LF-3738", density: "low",
  width: 5, height: 5, map: ["#####", "#S.E#", "#...#", "#...#", "#####"],
  path: [[1, 1], [2, 1], [3, 1]], pathLength: 2, deadEnds: 0,
};

describe("levelToExport", () => {
  it("містить формат, версію й дані рівня без службових полів", () => {
    const data = levelToExport(level);
    expect(data.format).toBe(EXPORT_FORMAT);
    expect(data.version).toBe(1);
    expect(data.map).toEqual(level.map);
    expect(data.width).toBe(5);
    expect(data).not.toHaveProperty("id");
    expect(data).not.toHaveProperty("cells");
  });

  it("підставляє значення за замовчуванням для відсутніх полів", () => {
    const data = levelToExport({ ...level, seed: undefined, density: undefined, path: undefined });
    expect(data).toMatchObject({ seed: null, density: null, path: [] });
  });

  it("результат можна перетворити на JSON і назад", () => {
    const data = levelToExport(level);
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});

describe("exportFileName", () => {
  it("формує ім'я з seed і розміру", () => {
    expect(exportFileName(level)).toBe("levelforge-LF-3738-5x5.json");
  });

  it("замінює небезпечні символи в seed", () => {
    const name = exportFileName({ ...level, seed: "../../x y" });
    expect(name).toMatch(/^levelforge-[A-Za-z0-9_-]+-5x5\.json$/);
    expect(name).not.toContain("/");
    expect(name).not.toContain(" ");
  });
});

describe("downloadJson", () => {
  afterEach(() => vi.restoreAllMocks());

  it("створює посилання для завантаження з потрібною назвою й звільняє URL", () => {
    vi.useFakeTimers();
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
    let downloadName = null;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
      downloadName = this.download;
    });

    downloadJson("file.json", { a: 1 });

    expect(downloadName).toBe("file.json");
    const blob = URL.createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe("application/json");
    vi.advanceTimersByTime(1000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    vi.useRealTimers();
  });
});
