import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Nav.css";

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <nav className="nav" aria-label="Головна навігація">
      <span className="brand">LevelForge</span>
      {user ? (
        <>
          <NavLink to="/" end>Генератор</NavLink>
          <NavLink to="/gallery">Галерея</NavLink>
          <span className="nav-user">{user.name}</span>
          <button className="nav-logout" onClick={logout}>Вийти</button>
        </>
      ) : (
        <NavLink to="/login">Вхід</NavLink>
      )}
    </nav>
  );
}
