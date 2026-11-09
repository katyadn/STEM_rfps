import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Після кожного тесту: прибрати відрендерене й очистити сховище
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom не має matchMedia; за замовчуванням імітуємо широкий екран
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});
