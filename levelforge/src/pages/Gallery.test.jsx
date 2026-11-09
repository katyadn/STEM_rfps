import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildLevel } from "../data/levels";
import { getSavedLevels, saveLevel } from "../services/gallery";
import { TEST_USER, loginAs, renderWithProviders } from "../test/helpers";
import Gallery from "./Gallery";

afterEach(() => vi.restoreAllMocks());

const params = { sizeId: "10x10", density: "low", enemies: 2, treasures: 2, seed: "LF-1" };

describe("Gallery", () => {
  it("порожня галерея пояснює, що робити далі", () => {
    loginAs();
    renderWithProviders(<Gallery />);
    expect(screen.getByText("У галереї поки порожньо.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "До генератора" })).toHaveAttribute("href", "/");
  });

  it("показує збережені рівні з посиланням на сторінку рівня", () => {
    loginAs();
    saveLevel(TEST_USER.id, buildLevel(params));
    renderWithProviders(<Gallery />);
    const id = getSavedLevels(TEST_USER.id)[0].id;
    expect(screen.getByRole("link", { name: "Рівень LF-1" })).toHaveAttribute("href", `/gallery/${id}`);
    expect(screen.getByRole("img", { name: "Мініатюра: Рівень LF-1" })).toBeInTheDocument();
  });

  it("видаляє рівень після підтвердження", async () => {
    loginAs();
    saveLevel(TEST_USER.id, buildLevel(params));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderWithProviders(<Gallery />);
    await userEvent.click(screen.getByRole("button", { name: "Видалити" }));
    expect(getSavedLevels(TEST_USER.id)).toHaveLength(0);
    expect(screen.getByText("У галереї поки порожньо.")).toBeInTheDocument();
  });

  it("не видаляє, якщо користувачка скасувала підтвердження", async () => {
    loginAs();
    saveLevel(TEST_USER.id, buildLevel(params));
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderWithProviders(<Gallery />);
    await userEvent.click(screen.getByRole("button", { name: "Видалити" }));
    expect(getSavedLevels(TEST_USER.id)).toHaveLength(1);
  });
});
