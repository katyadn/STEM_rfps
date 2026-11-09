import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Grid from "../components/Grid";
import Legend from "../components/Legend";
import MetricsPanel from "../components/MetricsPanel";
import { useAuth } from "../context/AuthContext";
import { DENSITY_LABELS } from "../data/levels";
import { deleteLevel, getSavedLevel } from "../services/gallery";
import { downloadJson, exportFileName, levelToExport } from "../utils/exportLevel";
import { countCells } from "../utils/metrics";
import "./LevelPage.css";

const defaultCell = (width) =>
  width <= 10 ? 48 : width <= 20 ? 34 : width <= 30 ? 26 : 20;

export default function LevelPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const level = useMemo(() => getSavedLevel(user.id, id), [user.id, id]);

  const [showPath, setShowPath] = useState(false);
  const [cellSize, setCellSize] = useState(null); // null = автоматично
  const [message, setMessage] = useState(null); // { ok, text }

  if (!level) {
    return (
      <div className="page">
        <section className="panel">
          <h1 className="level-name">Рівень не знайдено</h1>
          <p>Можливо, його видалено, або посилання неправильне.</p>
          <Link to="/gallery" className="btn btn--link">До галереї</Link>
        </section>
      </div>
    );
  }

  const effectiveCell = cellSize ?? defaultCell(level.width);
  const savedAt = new Date(level.savedAt);

  function handleExport() {
    try {
      downloadJson(exportFileName(level), levelToExport(level));
      setMessage({ ok: true, text: "Файл завантажено" });
    } catch {
      setMessage({ ok: false, text: "Не вдалося створити файл" });
    }
  }

  function handleDelete() {
    if (!window.confirm(`Видалити рівень «${level.name}»?`)) return;
    deleteLevel(user.id, level.id);
    navigate("/gallery", { replace: true });
  }

  const info = [
    ["Seed", level.seed ?? "—"],
    ["Щільність стін", DENSITY_LABELS[level.density] ?? "—"],
    ["Розмір", `${level.width}×${level.height}`],
    ["Збережено", `${savedAt.toLocaleDateString("uk-UA")} ${savedAt.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`],
  ];

  return (
    <div className="page level-page">
      <Link to="/gallery" className="back-link">← До галереї</Link>

      <header className="level-title">
        <div>
          <h1 className="level-name">{level.name}</h1>
          <p className="level-sub">
            {level.width}×{level.height} · вороги: {countCells(level, "enemy")} ·
            скарби: {countCells(level, "treasure")}
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={handleExport}>Експортувати JSON</button>
          <button
            className="btn btn--secondary"
            onClick={() => navigate("/", { state: { level } })}
          >
            Відкрити в генераторі
          </button>
          <button className="btn btn--secondary" onClick={handleDelete}>Видалити</button>
        </div>
      </header>

      {message && (
        <p role="status" className={message.ok ? "save-ok" : "form-error"}>
          {message.text}
        </p>
      )}

      <section className="panel">
        <div className="view-controls">
          <label className="check">
            <input type="checkbox" checked={showPath}
              onChange={(e) => setShowPath(e.target.checked)} />
            Показати найкоротший шлях
          </label>
          <div className="zoom">
            <label htmlFor="zoom">Масштаб: {effectiveCell} px</label>
            <input id="zoom" type="range" min="12" max="60" value={effectiveCell}
              onChange={(e) => setCellSize(Number(e.target.value))} />
          </div>
        </div>
        <Grid
          cells={level.cells}
          label={`Карта ${level.width} на ${level.height}. Ворогів: ${countCells(level, "enemy")}, скарбів: ${countCells(level, "treasure")}.`}
          cellSize={effectiveCell}
          path={showPath ? level.path : null}
        />
        <Legend showPath={showPath} />
      </section>

      <div className="level-bottom">
        <MetricsPanel level={level} />
        <section className="panel">
          <h2>Відомості</h2>
          <dl className="rows">
            {info.map(([name, value]) => (
              <div className="row" key={name}>
                <dt>{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
