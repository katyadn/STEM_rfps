import { useState } from "react";
import { AuthContext } from "./AuthContext";
import * as auth from "../services/auth";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getSession());

  async function login(email, password) {
    setUser(await auth.login(email, password));
  }

  async function register(name, email, password) {
    setUser(await auth.register(name, email, password));
  }

  function logout() {
    auth.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
