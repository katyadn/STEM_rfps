import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthProvider from "../context/AuthProvider";

export const TEST_USER = { id: "u1", name: "Тест Користувач", email: "test@levelforge.com" };

// Імітує вхід: кладе в localStorage дійсну сесію
export function loginAs(user = TEST_USER) {
  localStorage.setItem(
    "lf_session",
    JSON.stringify({ ...user, token: "t", expiresAt: Date.now() + 60 * 60 * 1000 })
  );
}

export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
}

// Телефонна ширина екрана для тестів адаптивності
export function mockMobile(isMobile = true) {
  window.matchMedia = (query) => ({
    matches: isMobile,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  });
}
