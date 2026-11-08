import { useState } from "react";
import { useLocation } from "react-router-dom";
import Grid from "../components/Grid";
import { useAuth } from "../context/AuthContext";
import { levels, fetchLevel } from "../data/levels";
import { saveLevel } from "../services/gallery";

export default function Generator() {
  const { user } = useAuth();
  const location = useLocation();

  // Рівень можна відкрити з галереї (передається через стан маршруту)
  const [level, setLevel] = useState(() => location.state?.level ?? levels[0]);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [difficulty, setDifficulty] = useState("");
  const [saveMessage, setSaveMessage] = useState(null); // { ok, text }

  async function handleGenerate() {
    setStatus("loading");
    setSaveMessage(null);
    try {
      setLevel(await fetchLevel({ difficulty }));
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

        <div className="actions">
          <button
            className="btn"
            onClick={handleGenerate}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Генерація…" : "Згенерувати"}
          </button>
          <button
            className="btn btn--secondary"
            onClick={handleSave}
            disabled={status === "loading"}
          >
            Зберегти в галерею
          </button>
        </div>

        {status === "error" && (
          <p role="alert" className="form-error">
            Не вдалося завантажити рівень. Спробуйте ще раз.
          </p>
        )}
        {saveMessage && (
          <p
            role="status"
            className={saveMessage.ok ? "save-ok" : "form-error"}
          >
            {saveMessage.text}
          </p>
        )}
      </aside>
    </div>
  );
}
