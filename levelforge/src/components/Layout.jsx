import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

const KEY = "lf_sidebar";
const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

// На комп'ютері пам'ятаємо вибір користувачки, на телефоні меню завжди закрите
function initialOpen() {
  if (isMobile()) return false;
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(initialOpen);
  const menuBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const toggled = useRef(false);

  // Після перемикання фокус переходить на кнопку, що з'явилась
  useEffect(() => {
    if (!toggled.current) return;
    (open ? closeBtnRef : menuBtnRef).current?.focus();
  }, [open]);

  function toggle() {
    toggled.current = true;
    const next = !open;
    setOpen(next);
    if (!isMobile()) {
      try {
        localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        /* сховище недоступне — нічого страшного */
      }
    }
  }

  const closeOnMobile = () => {
    if (isMobile()) setOpen(false);
  };

  // Esc закриває меню, що виїхало поверх сторінки (телефон)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && isMobile()) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!user) {
    return (
      <>
        <header className="topbar">
          <span className="topbar-brand">LevelForge</span>
        </header>
        {children}
      </>
    );
  }

  return (
    <div className={`shell${open ? " shell--open" : ""}`}>
      <aside id="sidebar" className="sidebar" aria-label="Бічна панель">
        <div className="side-brand">
          <span className="logo" aria-hidden="true" />
          <div>
            <strong>LevelForge</strong>
            <small>Procedural Lab</small>
          </div>
          <button
            ref={closeBtnRef}
            className="menu-btn side-close"
            onClick={toggle}
            aria-label="Сховати меню"
            aria-expanded={open}
            aria-controls="sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <nav className="side-nav" aria-label="Основна навігація">
          <p className="side-label">Робочий простір</p>
          <NavLink to="/" end onClick={closeOnMobile}>Генератор</NavLink>
          <NavLink to="/gallery" onClick={closeOnMobile}>Моя галерея</NavLink>
        </nav>

        <div className="side-user">
          <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
          <div className="side-user-info">
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
          <button className="side-logout" onClick={logout}>Вийти</button>
        </div>
      </aside>

      {open && (
        <div className="backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <div className="main">
        <header className="topbar">
          {!open && (
            <>
              <button
                ref={menuBtnRef}
                className="menu-btn"
                onClick={toggle}
                aria-label="Відкрити меню"
                aria-expanded={open}
                aria-controls="sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <span className="topbar-brand">LevelForge</span>
            </>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
