import "./Grid.css";

const LABELS = { start: "S", end: "E" };

// cellSize — розмір клітинки в px; path — масив [x, y] для підсвітки шляху;
// compact — мініатюра для галереї
export default function Grid({ cells, label, compact = false, cellSize = 28, path }) {
  const width = cells[0].length;
  const pathSet = path ? new Set(path.map(([x, y]) => `${x},${y}`)) : null;

  const items = cells.flatMap((row, y) =>
    row.map((type, x) => {
      const onPath =
        pathSet?.has(`${x},${y}`) && type !== "start" && type !== "end";
      return (
        <div
          key={`${x}-${y}`}
          className={`cell cell--${type}${onPath ? " cell--path" : ""}`}
          style={compact ? undefined : { "--d": x }}
        >
          {!compact && cellSize >= 18 ? LABELS[type] : null}
        </div>
      );
    })
  );

  if (compact) {
    return (
      <div
        className="grid grid--compact"
        style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}
        role="img"
        aria-label={label}
      >
        {items}
      </div>
    );
  }

  return (
    <div className="grid-viewport">
      <div
        className="grid"
        style={{
          "--cell": `${cellSize}px`,
          gridTemplateColumns: `repeat(${width}, var(--cell))`,
        }}
        role="img"
        aria-label={label}
      >
        {items}
      </div>
    </div>
  );
}
