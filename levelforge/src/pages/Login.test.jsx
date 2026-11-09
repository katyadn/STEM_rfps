import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AuthProvider from "../context/AuthProvider";
import Login from "./Login";

function setup() {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>Головна сторінка</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
  return userEvent.setup();
}

const TIMEOUT = { timeout: 3000 };

describe("Login: валідація", () => {
  it("показує помилки для порожньої форми й не відправляє її", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Увійти" }));
    expect(screen.getByText("Введіть коректну адресу пошти")).toBeInTheDocument();
    expect(screen.getByText("Введіть пароль")).toBeInTheDocument();
    expect(screen.getByLabelText("Пошта")).toHaveAttribute("aria-invalid", "true");
  });

  it("відхиляє пошту без @", async () => {
    const user = setup();
    await user.type(screen.getByLabelText("Пошта"), "nota-mail");
    await user.type(screen.getByLabelText("Пароль"), "Demo1234");
    await user.click(screen.getByRole("button", { name: "Увійти" }));
    expect(screen.getByText("Введіть коректну адресу пошти")).toBeInTheDocument();
  });

  it("у режимі реєстрації вимагає ім'я, надійний пароль і збіг паролів", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Зареєструватися" }));
    await user.type(screen.getByLabelText("Пошта"), "a@b.com");
    await user.type(screen.getByLabelText("Пароль"), "short");
    await user.type(screen.getByLabelText("Повторіть пароль"), "other");
    await user.click(screen.getByRole("button", { name: "Створити акаунт" }));
    expect(screen.getByText(/Введіть ім’я/)).toBeInTheDocument();
    expect(screen.getByText("Щонайменше 8 символів, з літерами та цифрами")).toBeInTheDocument();
    expect(screen.getByText("Паролі не збігаються")).toBeInTheDocument();
  });

  it("перемикає форму між входом і реєстрацією та очищає помилки", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Увійти" }));
    await user.click(screen.getByRole("button", { name: "Зареєструватися" }));
    expect(screen.getByRole("heading", { name: "Реєстрація" })).toBeInTheDocument();
    expect(screen.queryByText("Введіть пароль")).not.toBeInTheDocument();
  });
});

describe("Login: вхід і реєстрація", () => {
  it("демо-акаунт входить і потрапляє на головну", async () => {
    const user = setup();
    await user.type(screen.getByLabelText("Пошта"), "demo@levelforge.com");
    await user.type(screen.getByLabelText("Пароль"), "Demo1234");
    await user.click(screen.getByRole("button", { name: "Увійти" }));
    expect(await screen.findByText("Головна сторінка", {}, TIMEOUT)).toBeInTheDocument();
  });

  it("неправильний пароль показує повідомлення про помилку", async () => {
    const user = setup();
    await user.type(screen.getByLabelText("Пошта"), "demo@levelforge.com");
    await user.type(screen.getByLabelText("Пароль"), "WrongPass1");
    await user.click(screen.getByRole("button", { name: "Увійти" }));
    expect(await screen.findByRole("alert", {}, TIMEOUT)).toHaveTextContent("Невірна пошта або пароль");
  });

  it("реєстрація нового користувача веде на головну", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Зареєструватися" }));
    await user.type(screen.getByLabelText("Ім’я"), "Марія");
    await user.type(screen.getByLabelText("Пошта"), "maria@test.com");
    await user.type(screen.getByLabelText("Пароль"), "Secret123");
    await user.type(screen.getByLabelText("Повторіть пароль"), "Secret123");
    await user.click(screen.getByRole("button", { name: "Створити акаунт" }));
    expect(await screen.findByText("Головна сторінка", {}, TIMEOUT)).toBeInTheDocument();
  });
});
