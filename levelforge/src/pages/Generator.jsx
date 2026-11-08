import { useState } from "react";
import { useLocation } from "react-router-dom";
import CountField from "../components/CountField";
import Grid from "../components/Grid";
import MetricsPanel from "../components/MetricsPanel";
import { useAuth } from "../context/AuthContext";
import {
  DENSITY_LABELS, SIZES, buildLevel, fetchLevel,
  getLimits, getSize, randomSeed,
} from "../data/levels";
import { saveLevel } from "../services/gallery";
import { countCells } from "../utils/metrics";
import "./Generator.css";

const DEFAULTS = {
  sizeId: "10x10", density: "medium", enemies: 4, treasures: 3, seed: "LF-3738",
};
const defaultCell = (width) =>
  width <= 10 ? 40 : width <= 20 ? 28 : width <= 30 ? 22 : 16;
const LEGEND = [
  ["start", "Вхід"], ["end", "Вихід"], ["wall", "Стіна"],
  ["treasure", "Скарб"], ["enemy", "Ворог"],
];

export default function Generator() {
  const { user } = useAuth();
  const location = useLocation();

  // Рівень можна відкрити з галереї (передається через стан маршруту)
  const [level, setLevel] = useState(
    () => location.state?.level ?? buildLevel(DEFAULTS)
  );
  const [sizeId, setSizeId] = useState(() => `${level.width}x${level.height}`);
  const [density, setDensity] = useState(() => level.density ?? DEFAULTS.density);
  const [enemies, setEnemies] = useState(() => countCells(level, "enemy"));
  const [treasures, setTreasures] = useState(() => countCells(level, "treasure"));
  const [seed, setSeed] = useState(() => level.seed ?? DEFAULTS.seed);
  const [seedEdited, setSeedEdited] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [cellSize, setCellSize] = useState(null); // null = автоматично
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [saveMessage, setSaveMessage] = useState(null); // { ok, text }

  const limits = getLimits(getSize(sizeId));
  const effectiveCell = cellSize ?? defaultCell(level.width);

  function handleSizeChange(id) {
    const next = getLimits(getSize(id));
    setSizeId(id);
    setEnemies(next.defaultEnemies);
    setTreasures(next.defaultTreasures);
  }

  function handleSeedChange(value) {
    setSeed(value);
    setSeedEdited(true);
  }

  async function handleGenerate() {
    // Власний seed використовується один раз, інакше береться новий
    const nextSeed = seedEdited && seed.trim() ? seed.trim() : randomSeed();
    setSeed(nextSeed);
    setSeedEdited(false);
    setStatus("loading");
    setSaveMessage(null);
    try {
      const next = await fetchLevel({
        sizeId, density, enemies, treasures, seed: nextSeed,
      });
      if (next.width !== level.width) setCellSize(null);
      setLevel(next);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function handleSave() {
    try {
      saveLevel(user.id, level);
      setSaveMessage({ ok: true, text: "Рівень збережено в галерею" });
    } catch (err) {
      setSaveMessage({ ok: false, text: err.message });
    }
  }

  const gridLabel =
    `Карта ${level.width} на ${level.height}. ` +
    `Ворогів: ${countCells(level, "enemy")}, скарбів: ${countCells(level, "treasure")}.`;

  return (
    <div className="page generator">
      <div className="generator-main">
        <section className="panel">
          <div className="level-head">
            <h2>{level.name}</h2>
            <span>{level.width}×{level.height}</span>
          </div>
          <Grid
            cells={level.cells}
            label={gridLabel}
            cellSize={effectiveCell}
            path={showPath ? level.path : null}
          />
          <ul className="legend" aria-label="Умовні позначення">
            {LEGEND.map(([type, name]) => (
              <li key={type}>
                <span className={`swatch swatch--${type}`} aria-hidden="true" />
                {name}
              </li>
            ))}
          </ul>
          <p className="sr-only" role="status">
            {status === "loading" ? "Генерація…" : `Показано: ${level.name}`}
          </p>
        </section>

        <MetricsPanel level={level} />
      </div>

      <aside className="panel">
        <h2>Налаштування</h2>

        <div className="field">
          <label htmlFor="size">Розмір карти</label>
          <select id="size" value={sizeId} onChange={(e) => handleSizeChange(e.target.value)}>
            {SIZES.map((s) => (
              <option key={s.id} value={s.id}>{s.width} × {s.height}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="density">Щільність стін</label>
          <select id="density" value={density} onChange={(e) => setDensity(e.target.value)}>
            {Object.entries(DENSITY_LABELS).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <CountField id="enemies" label="Вороги" value={enemies}
          max={limits.enemies} onChange={setEnemies} />
        <CountField id="treasures" label="Скарби" value={treasures}
          max={limits.treasures} onChange={setTreasures} />

        <div className="field">
          <label htmlFor="seed">Seed</label>
          <input id="seed" value={seed} maxLength={16}
            onChange={(e) => handleSeedChange(e.target.value)} />
          <span className="hint">Введіть seed, щоб відтворити рівень</span>
        </div>

        <div className="settings-group">
          <label className="check">
            <input type="checkbox" checked={showPath}
              onChange={(e) => setShowPath(e.target.checked)} />
            Показати найкоротший шлях
          </label>
          <div className="field">
            <label htmlFor="zoom">Масштаб клітинки: {effectiveCell} px</label>
            <input id="zoom" type="range" min="12" max="48" value={effectiveCell}
              onChange={(e) => setCellSize(Number(e.target.value))} />
          </div>
        </div>

        <div className="actions">
          <button className="btn" onClick={handleGenerate} disabled={status === "loading"}>
            {status === "loading" ? "Генерація…" : "Згенерувати"}
          </button>
          <button className="btn btn--secondary" onClick={handleSave} disabled={status === "loading"}>
            Зберегти в галерею
          </button>
        </div>

        {status === "error" && (
          <p role="alert" className="form-error">
            Не вдалося створити рівень. Спробуйте ще раз.
          </p>
        )}
        {saveMessage && (
          <p role="status" className={saveMessage.ok ? "save-ok" : "form-error"}>
            {saveMessage.text}
          </p>
        )}
      </aside>
    </div>
  );
}
