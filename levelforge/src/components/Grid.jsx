import "./Grid.css";

const LABELS = { start: "S", end: "E" };

// compact: мініатюра для галереї (без підписів клітинок)
export default function Grid({ cells, compact = false, label }) {
  const size = cells.length;
  const style = { gridTemplateColumns: `repeat(${size}, 1fr)` };

  if (compact) {
    return (
      <div
        className="grid grid--compact"
        style={style}
        role="img"
        aria-label={label ?? `Рівень ${size} на ${size}`}
      >
        {cells.flatMap((row, y) =>
          row.map((type, x) => (
            <div key={`${x}-${y}`} className={`cell cell--${type}`} />
          ))
        )}
      </div>
    );
  }

  return (
    <div
      className="grid"
      style={style}
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
