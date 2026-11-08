import { getMetrics } from "../utils/metrics";
import "./MetricsPanel.css";

export default function MetricsPanel({ level }) {
  const m = getMetrics(level);

  const rows = [
    ["Розмір", `${level.width}×${level.height}`],
    ["Стіни", `${m.wallPercent.toFixed(0)}%`],
    ["Прохідних клітинок", m.walkable],
    ["Вороги", `${m.enemies} (${m.enemiesPer100.toFixed(1)} на 100 кл.)`],
    ["Скарби", `${m.treasures} (${m.treasuresPer100.toFixed(1)} на 100 кл.)`],
    ["Тупики", m.deadEnds],
  ];

  return (
    <section className="panel metrics" aria-labelledby="metrics-title">
      <h2 id="metrics-title">Метрики рівня</h2>

      <div className="key-metrics">
        <div className="key">
          <span className="key-label">Шлях до виходу</span>
          <strong className={`key-value ${m.hasPath ? "is-ok" : "is-bad"}`}>
            {m.hasPath ? "Існує" : "Не існує"}
          </strong>
          <span className="key-sub">
            {m.hasPath ? `${m.pathLength} кроків` : "рівень не проходиться"}
          </span>
        </div>
        <div className="key">
          <span className="key-label">Збалансованість</span>
          <strong
            className="key-value"
            aria-label={`Індекс збалансованості: ${m.balance} зі 100`}
          >
            {m.balance}
            <small>/100</small>
          </strong>
          <span className="key-sub">орієнтовний індекс</span>
        </div>
        <div className="key">
          <span className="key-label">Складність</span>
          <strong className="key-value key-value--cap">{m.difficulty.label}</strong>
          <span className="key-sub">{m.difficulty.percent}%</span>
        </div>
      </div>

      <dl className="rows">
        {rows.map(([name, value]) => (
          <div className="row" key={name}>
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
