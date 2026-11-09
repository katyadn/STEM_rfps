import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { loginAs, mockMobile, renderWithProviders } from "../test/helpers";
import Layout from "./Layout";

const page = <Layout><p>Вміст сторінки</p></Layout>;

afterEach(() => mockMobile(false));

describe("Layout: гість", () => {
  it("показує лише назву без бічної панелі", () => {
    renderWithProviders(page);
    expect(screen.getByText("Вміст сторінки")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Основна навігація" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /меню/ })).not.toBeInTheDocument();
  });
});

describe("Layout: бічна панель", () => {
  it("містить вкладки та дані користувача", () => {
    loginAs();
    renderWithProviders(page);
    expect(screen.getByRole("link", { name: "Генератор" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Моя галерея" })).toHaveAttribute("href", "/gallery");
    expect(screen.getByText("Тест Користувач")).toBeInTheDocument();
    expect(screen.getByText("ТК")).toBeInTheDocument();
  });

  it("на комп'ютері відкрита за замовчуванням", () => {
    loginAs();
    renderWithProviders(page);
    expect(screen.getByRole("button", { name: "Сховати меню" })).toHaveAttribute("aria-expanded", "true");
  });

  it("згортається й розгортається, запам'ятовуючи вибір", async () => {
    loginAs();
    renderWithProviders(page);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Сховати меню" }));
    expect(screen.getByRole("button", { name: "Відкрити меню" })).toHaveAttribute("aria-expanded", "false");
    expect(localStorage.getItem("lf_sidebar")).toBe("0");

    await user.click(screen.getByRole("button", { name: "Відкрити меню" }));
    expect(screen.getByRole("button", { name: "Сховати меню" })).toBeInTheDocument();
    expect(localStorage.getItem("lf_sidebar")).toBe("1");
  });

  it("починає згорнутою, якщо так було збережено раніше", () => {
    loginAs();
    localStorage.setItem("lf_sidebar", "0");
    renderWithProviders(page);
    expect(screen.getByRole("button", { name: "Відкрити меню" })).toBeInTheDocument();
  });

  it("кнопка «Вийти» завершує сесію", async () => {
    loginAs();
    renderWithProviders(page);
    await userEvent.click(screen.getByRole("button", { name: "Вийти" }));
    expect(localStorage.getItem("lf_session")).toBeNull();
    expect(screen.queryByText("Тест Користувач")).not.toBeInTheDocument();
  });
});

describe("Layout: телефон", () => {
  it("на вузькому екрані меню спочатку закрите", () => {
    mockMobile(true);
    loginAs();
    renderWithProviders(page);
    expect(screen.getByRole("button", { name: "Відкрити меню" })).toBeInTheDocument();
  });

  it("закривається після вибору вкладки", async () => {
    mockMobile(true);
    loginAs();
    renderWithProviders(page);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Відкрити меню" }));
    await user.click(screen.getByRole("link", { name: "Моя галерея" }));
    expect(screen.getByRole("button", { name: "Відкрити меню" })).toBeInTheDocument();
  });

  it("закривається клавішею Esc", async () => {
    mockMobile(true);
    loginAs();
    renderWithProviders(page);
    await userEvent.click(screen.getByRole("button", { name: "Відкрити меню" }));
    expect(screen.getByRole("button", { name: "Сховати меню" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(await screen.findByRole("button", { name: "Відкрити меню" })).toBeInTheDocument();
  });

  it("не запам'ятовує стан меню на телефоні", async () => {
    mockMobile(true);
    loginAs();
    renderWithProviders(page);
    await userEvent.click(screen.getByRole("button", { name: "Відкрити меню" }));
    expect(localStorage.getItem("lf_sidebar")).toBeNull();
  });
});
