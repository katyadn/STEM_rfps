import { NavLink, Route, Routes } from "react-router-dom";
import Generator from "./pages/Generator";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";

export default function App() {
  return (
    <>
      <nav className="nav">
        <span className="brand">LevelForge</span>
        <NavLink to="/">Генератор</NavLink>
        <NavLink to="/gallery">Галерея</NavLink>
        <NavLink to="/login">Вхід</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Generator />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}
