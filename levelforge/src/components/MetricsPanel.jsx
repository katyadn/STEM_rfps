import { getMetrics } from "../utils/metrics";
import "./MetricsPanel.css";

export default function MetricsPanel({ level }) {
  const m = getMetrics(level);

  const stats = [
    ["Розмір", `${level.width}×${level.height}`],
    ["Найкоротший шлях", `${m.pathLength} кроків`],
    ["Стіни", `${m.wallPercent.toFixed(0)}%`],
    ["Прохідних клітинок", m.walkable],
    ["Вороги", `${m.enemies} (${m.enemiesPer100.toFixed(1)} на 100 кл.)`],
    ["Скарби", `${m.treasures} (${m.treasuresPer100.toFixed(1)} на 100 кл.)`],
    ["Тупики", m.deadEnds],
  ];

  return (
    <section className="panel metrics" aria-labelledby="metrics-title">
      <header className="metrics-head">
        <h2 id="metrics-title">Метрики рівня</h2>
        <span className={`badge ${m.hasPath ? "badge--ok" : "badge--bad"}`}>
          {m.hasPath ? "Шлях існує" : "Шляху немає"}
        </span>
      </header>

      <div className="metrics-summary">
        <div
          className="score"
          aria-label={`Індекс збалансованості: ${m.balance} зі 100`}
        >
          <strong>{m.balance}</strong>
          <span>/100</span>
        </div>
        <div>
          <p className="verdict">Індекс збалансованості</p>
          <p className="muted">орієнтовний</p>
          <p className="muted">
            Оціночна складність: {m.difficulty.label} ({m.difficulty.percent}%)
          </p>
        </div>
      </div>

      <dl className="stats">
        {stats.map(([name, value]) => (
          <div className="stat" key={name}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <details className="metrics-note">
        <summary>Як розраховується індекс</summary>
        <p>
          Індекс порівнює рівень зі «типовим»: враховує довжину шляху,
          кількість ворогів і скарбів та частку стін. Це орієнтир, а не оцінка
          якості: низьке значення не означає, що рівень поганий. Наприклад,
          кімната боса з великою кількістю ворогів матиме нижчий індекс, і це
          цілком нормально.
        </p>
      </details>
    </section>
  );
}
