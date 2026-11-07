import "./Grid.css";

const LABELS = { start: "S", end: "E" };

export default function Grid({ cells }) {
  const size = cells.length;
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      role="grid"
      aria-label={`Ігрова сітка ${size} на ${size}`}
    >
      {cells.flatMap((row, y) =>
        row.map((type, x) => (
          <div
            key={`${x}-${y}`}
            className={`cell cell--${type}`}
            role="gridcell"
            aria-label={`${type}, рядок ${y + 1}, стовпець ${x + 1}`}
          >
            {LABELS[type]}
          </div>
        ))
      )}
    </div>
  );
}
