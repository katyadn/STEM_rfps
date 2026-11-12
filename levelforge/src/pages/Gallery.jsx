import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Grid from "../components/Grid";
import { useAuth } from "../context/AuthContext";
import { DENSITY_LABELS } from "../data/levels";
import { deleteLevel, getSavedLevels } from "../services/gallery";
import "./Gallery.css";

export default function Gallery() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getSavedLevels(user.id));

  function handleDelete(level) {
    if (!window.confirm(`Видалити рівень «${level.name}»?`)) return;
    deleteLevel(user.id, level.id);
    setItems(getSavedLevels(user.id));
  }

  return (
    <div className="page">
      <h1 className="page-title">Моя галерея</h1>

      {items.length === 0 ? (
        <section className="empty-state">
          <p>У галереї поки порожньо.</p>
          <p>
            Згенеруйте рівень і натисніть «Зберегти в галерею», щоб він
            з’явився тут.
          </p>
          <Link to="/" className="btn btn--link">До генератора</Link>
        </section>
      ) : (
        <ul className="gallery-grid">
          {items.map((level) => (
            <li key={level.id} className="panel gallery-card">
              <Grid compact cells={level.cells} label={`Мініатюра: ${level.name}`} />
              <h2>
                <Link to={`/gallery/${level.id}`}>{level.name}</Link>
              </h2>
              <p className="gallery-meta">
                {level.width}×{level.height} · стіни:{" "}
                {DENSITY_LABELS[level.density] ?? "—"} ·{" "}
                {new Date(level.savedAt).toLocaleDateString("uk-UA")}
              </p>
              <div className="actions">
                <button
                  className="btn"
                  onClick={() => navigate(`/gallery/${level.id}`)}
                >
                  Переглянути
                </button>
                <button
                  className="btn btn--secondary"
                  onClick={() => handleDelete(level)}
                >
                  Видалити
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
