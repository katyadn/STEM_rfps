import "./Legend.css";

const ITEMS = [
  ["start", "Вхід"], ["end", "Вихід"], ["wall", "Стіна"],
  ["treasure", "Скарб"], ["enemy", "Ворог"],
];

export default function Legend({ showPath = false }) {
  const items = showPath ? [...ITEMS, ["path", "Найкоротший шлях"]] : ITEMS;
  return (
    <ul className="legend" aria-label="Умовні позначення">
      {items.map(([type, name]) => (
        <li key={type}>
          <span className={`swatch swatch--${type}`} aria-hidden="true" />
          {name}
        </li>
      ))}
    </ul>
  );
}
