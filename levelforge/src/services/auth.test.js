import { describe, expect, it } from "vitest";
import { getSession, login, logout, register } from "./auth";

describe("демо-автентифікація", () => {
  it("демо-акаунт дозволяє увійти", async () => {
    const user = await login("demo@levelforge.com", "Demo1234");
    expect(user).toMatchObject({ name: "Олена Коваль", email: "demo@levelforge.com" });
  });

  it("не повертає хеш пароля чи токен у даних користувача", async () => {
    const user = await login("demo@levelforge.com", "Demo1234");
    expect(Object.keys(user).sort()).toEqual(["email", "id", "name"]);
  });

  it("помилка однакова для неправильного пароля й невідомої пошти", async () => {
    await expect(login("demo@levelforge.com", "wrong")).rejects.toThrow("Невірна пошта або пароль");
    await expect(login("nobody@x.com", "Demo1234")).rejects.toThrow("Невірна пошта або пароль");
  });

  it("пошта нечутлива до регістру та пробілів", async () => {
    const user = await login("  DEMO@LevelForge.com ", "Demo1234");
    expect(user.email).toBe("demo@levelforge.com");
  });

  it("реєструє нового користувача й одразу входить", async () => {
    const user = await register("Ірина", "Iryna@Test.com", "Secret123");
    expect(user.email).toBe("iryna@test.com");
    expect(getSession()).toMatchObject({ name: "Ірина" });
  });

  it("не дозволяє зареєструвати пошту вдруге", async () => {
    await register("Ірина", "iryna@test.com", "Secret123");
    await expect(register("Інша", "IRYNA@test.com", "Secret456")).rejects.toThrow("вже існує");
  });

  it("зберігає пароль лише у вигляді хеша із сіллю", async () => {
    await register("Ірина", "iryna@test.com", "Secret123");
    const raw = localStorage.getItem("lf_users");
    expect(raw).not.toContain("Secret123");
    const user = JSON.parse(raw).find((u) => u.email === "iryna@test.com");
    expect(user.passwordHash).toMatch(/^[0-9a-f]{64}$/);
    expect(user.salt).toBeTruthy();
  });

  it("після реєстрації можна увійти з новим паролем", async () => {
    await register("Ірина", "iryna@test.com", "Secret123");
    logout();
    expect(await login("iryna@test.com", "Secret123")).toMatchObject({ name: "Ірина" });
  });
});

describe("сесія", () => {
  it("порожня, поки ніхто не увійшов", () => {
    expect(getSession()).toBeNull();
  });

  it("зникає після виходу", async () => {
    await login("demo@levelforge.com", "Demo1234");
    expect(getSession()).not.toBeNull();
    logout();
    expect(getSession()).toBeNull();
  });

  it("прострочена сесія недійсна й видаляється", () => {
    localStorage.setItem(
      "lf_session",
      JSON.stringify({ id: "1", name: "A", email: "a@a.a", token: "t", expiresAt: Date.now() - 1000 })
    );
    expect(getSession()).toBeNull();
    expect(localStorage.getItem("lf_session")).toBeNull();
  });

  it("пошкоджена сесія не ламає застосунок", () => {
    localStorage.setItem("lf_session", "{broken");
    expect(getSession()).toBeNull();
  });
});
