import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AuthProvider from "../context/AuthProvider";
import { loginAs } from "../test/helpers";
import ProtectedRoute from "./ProtectedRoute";

function renderRoutes() {
  return render(
    <MemoryRouter initialEntries={["/secret"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>Сторінка входу</p>} />
          <Route path="/secret" element={<ProtectedRoute><p>Секретна сторінка</p></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("перенаправляє гостя на сторінку входу", () => {
    renderRoutes();
    expect(screen.getByText("Сторінка входу")).toBeInTheDocument();
    expect(screen.queryByText("Секретна сторінка")).not.toBeInTheDocument();
  });

  it("пускає користувача, який увійшов", () => {
    loginAs();
    renderRoutes();
    expect(screen.getByText("Секретна сторінка")).toBeInTheDocument();
  });

  it("не пускає з простроченою сесією", () => {
    localStorage.setItem(
      "lf_session",
      JSON.stringify({ id: "1", name: "A", email: "a@a.a", token: "t", expiresAt: Date.now() - 1 })
    );
    renderRoutes();
    expect(screen.getByText("Сторінка входу")).toBeInTheDocument();
  });
});
