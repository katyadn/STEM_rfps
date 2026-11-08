// Повзунок + число: можна перетягувати або ввести вручну. Значення обмежені max.
export default function CountField({ id, label, value, max, onChange }) {
  function set(raw) {
    const n = Math.round(Number(raw));
    onChange(Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0);
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="count-field">
        <input
          id={id}
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
        <input
          type="number"
          min="0"
          max={max}
          value={value}
          aria-label={`${label}: число`}
          onChange={(e) => set(e.target.value)}
        />
      </div>
      <span className="hint">Максимум для цього розміру: {max}</span>
    </div>
  );
}
