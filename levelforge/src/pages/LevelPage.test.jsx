import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthProvider from "../context/AuthProvider";
import { buildLevel } from "../data/levels";
import { getSavedLevels, saveLevel } from "../services/gallery";
import { TEST_USER, loginAs } from "../test/helpers";
import * as exportLevel from "../utils/exportLevel";
import LevelPage from "./LevelPage";

vi.mock("../utils/exportLevel", async (original) => ({
  ...(await original()),
  downloadJson: vi.fn(),
}));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/gallery/:id" element={<LevelPage />} />
          <Route path="/gallery" element={<p>Галерея</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  loginAs();
});

describe("LevelPage", () => {
  it("повідомляє, що рівень не знайдено", () => {
    renderAt("/gallery/does-not-exist");
    expect(screen.getByRole("heading", { name: "Рівень не знайдено" })).toBeInTheDocument();
  });

  it("не показує чужий рівень", () => {
    saveLevel("another-user", buildLevel({ sizeId: "10x10", density: "low", enemies: 1, treasures: 1, seed: "LF-1" }));
    const id = getSavedLevels("another-user")[0].id;
    renderAt(`/gallery/${id}`);
    expect(screen.getByRole("heading", { name: "Рівень не знайдено" })).toBeInTheDocument();
  });

  it("показує збережений рівень і його відомості", () => {
    saveLevel(TEST_USER.id, buildLevel({ sizeId: "10x10", density: "low", enemies: 1, treasures: 1, seed: "LF-1" }));
    renderAt(`/gallery/${getSavedLevels(TEST_USER.id)[0].id}`);
    expect(screen.getByRole("heading", { name: "Рівень LF-1" })).toBeInTheDocument();
    expect(screen.getByText("LF-1", { selector: "dd" })).toBeInTheDocument();
  });

  it("експорт викликає завантаження файлу з правильною назвою", async () => {
    saveLevel(TEST_USER.id, buildLevel({ sizeId: "10x10", density: "low", enemies: 1, treasures: 1, seed: "LF-1" }));
    renderAt(`/gallery/${getSavedLevels(TEST_USER.id)[0].id}`);
    await userEvent.click(screen.getByRole("button", { name: "Експортувати JSON" }));
    expect(exportLevel.downloadJson).toHaveBeenCalledTimes(1);
    const [name, data] = exportLevel.downloadJson.mock.calls[0];
    expect(name).toBe("levelforge-LF-1-10x10.json");
    expect(data.format).toBe("levelforge-level");
    expect(screen.getByText("Файл завантажено")).toBeInTheDocument();
  });

  it("видалення повертає до галереї", async () => {
    saveLevel(TEST_USER.id, buildLevel({ sizeId: "10x10", density: "low", enemies: 1, treasures: 1, seed: "LF-1" }));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderAt(`/gallery/${getSavedLevels(TEST_USER.id)[0].id}`);
    await userEvent.click(screen.getByRole("button", { name: "Видалити" }));
    expect(await screen.findByText("Галерея")).toBeInTheDocument();
    expect(getSavedLevels(TEST_USER.id)).toHaveLength(0);
  });
});
