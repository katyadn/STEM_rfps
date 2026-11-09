import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { loginAs, renderWithProviders } from "./test/helpers";

describe("Маршрути застосунку", () => {
  it("гість на головній потрапляє на сторінку входу", () => {
    renderWithProviders(<App />, { route: "/" });
    expect(screen.getByRole("heading", { name: "Вхід" })).toBeInTheDocument();
  });

  it("гість не бачить галерею", () => {
    renderWithProviders(<App />, { route: "/gallery" });
    expect(screen.getByRole("heading", { name: "Вхід" })).toBeInTheDocument();
  });

  it("гість не бачить сторінку рівня", () => {
    renderWithProviders(<App />, { route: "/gallery/abc" });
    expect(screen.getByRole("heading", { name: "Вхід" })).toBeInTheDocument();
  });

  it("користувач бачить генератор на головній", () => {
    loginAs();
    renderWithProviders(<App />, { route: "/" });
    expect(screen.getByRole("heading", { name: "Налаштування" })).toBeInTheDocument();
  });

  it("користувач бачить галерею", () => {
    loginAs();
    renderWithProviders(<App />, { route: "/gallery" });
    expect(screen.getByRole("heading", { name: "Моя галерея" })).toBeInTheDocument();
  });

  it("користувач із вже активною сесією не бачить форму входу", () => {
    loginAs();
    renderWithProviders(<App />, { route: "/login" });
    expect(screen.queryByRole("heading", { name: "Вхід" })).not.toBeInTheDocument();
  });

  it("невідома адреса веде на головну", () => {
    loginAs();
    renderWithProviders(<App />, { route: "/nope/nothing" });
    expect(screen.getByRole("heading", { name: "Налаштування" })).toBeInTheDocument();
  });
});
