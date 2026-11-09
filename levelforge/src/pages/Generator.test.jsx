import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSavedLevels } from "../services/gallery";
import { TEST_USER, loginAs, renderWithProviders } from "../test/helpers";
import Generator from "./Generator";

const TIMEOUT = { timeout: 3000 };

function setup() {
  loginAs();
  renderWithProviders(<Generator />);
  return userEvent.setup();
}

afterEach(() => vi.restoreAllMocks());

describe("Generator", () => {
  it("одразу показує стартовий рівень, метрики та налаштування", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Рівень LF-3738" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Метрики рівня" })).toBeInTheDocument();
    expect(screen.getByLabelText("Розмір карти")).toBeInTheDocument();
    expect(screen.getByLabelText("Щільність стін")).toBeInTheDocument();
  });

  it("під час генерації блокує кнопку, а потім показує новий рівень", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // seed LF-5500
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Згенерувати" }));
    expect(screen.getByRole("button", { name: "Генерація…" })).toBeDisabled();
    expect(await screen.findByRole("heading", { name: "Рівень LF-5500" }, TIMEOUT)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Згенерувати" })).toBeEnabled();
  });

  it("власний seed відтворює той самий рівень", async () => {
    const user = setup();
    const seed = screen.getByLabelText("Seed");
    await user.clear(seed);
    await user.type(seed, "LF-7777");
    await user.click(screen.getByRole("button", { name: "Згенерувати" }));
    expect(await screen.findByRole("heading", { name: "Рівень LF-7777" }, TIMEOUT)).toBeInTheDocument();
  });

  it("зміна розміру оновлює обмеження для ворогів і скарбів", async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText("Розмір карти"), "40x30");
    expect(screen.getByText("Максимум для цього розміру: 96")).toBeInTheDocument();
    expect(screen.getByText("Максимум для цього розміру: 60")).toBeInTheDocument();
  });

  it("чекбокс вмикає підсвітку шляху та пункт у легенді", async () => {
    const user = setup();
    expect(screen.queryByText("Найкоротший шлях")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Показати найкоротший шлях"));
    expect(screen.getByText("Найкоротший шлях")).toBeInTheDocument();
  });

  it("зберігає рівень у галерею й не дає зберегти його вдруге", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Зберегти в галерею" }));
    expect(screen.getByText("Рівень збережено в галерею")).toBeInTheDocument();
    expect(getSavedLevels(TEST_USER.id)).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Зберегти в галерею" }));
    expect(screen.getByText("Цей рівень уже є в галереї")).toBeInTheDocument();
    expect(getSavedLevels(TEST_USER.id)).toHaveLength(1);
  });
});
