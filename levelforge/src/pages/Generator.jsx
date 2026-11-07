import { useState } from "react";
import Grid from "../components/Grid";
import { levels, fetchLevel } from "../data/levels";

export default function Generator() {
  const [level, setLevel] = useState(levels[0]);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [difficulty, setDifficulty] = useState("");

  async function handleGenerate() {
    setStatus("loading");
    try {
      setLevel(await fetchLevel({ difficulty }));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="page generator">
      <section className="panel" aria-live="polite">
        <h2>{level.name}</h2>
        <Grid cells={level.cells} />
      </section>

      <aside className="panel">
        <h2>Налаштування</h2>
        <div className="field">
          <label htmlFor="difficulty">Складність</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">Будь-яка</option>
            <option value="easy">Легка</option>
            <option value="medium">Середня</option>
            <option value="hard">Складна</option>
          </select>
        </div>
        <button
          className="btn"
          onClick={handleGenerate}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Генерація…" : "Згенерувати"}
        </button>
        {status === "error" && (
          <p role="alert">Не вдалося завантажити рівень. Спробуйте ще раз.</p>
        )}
      </aside>
    </div>
  );
}
