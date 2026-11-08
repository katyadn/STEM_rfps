// Мок-«бекенд»: готові рівні. Символи:
// # стіна   . підлога   S вхід   E вихід   $ скарб   X ворог
const raw = [
  {
    id: "lvl-001",
    name: "Довгий коридор",
    difficulty: "easy",
    map: [
      "##########",
      "#S...#...#",
      "#.##.#.#.#",
      "#.#..#.#.#",
      "#.#.##.#$#",
      "#.#..X.#.#",
      "#.####.#.#",
      "#$.....#.#",
      "#.######.#",
      "#.......E#",
    ],
  },
  {
    id: "lvl-002",
    name: "Лабіринт із засідкою",
    difficulty: "medium",
    map: [
      "##########",
      "#S..#....#",
      "#.#.#.##.#",
      "#.#...#..#",
      "#.####.#.#",
      "#....#.#X#",
      "####.#.#.#",
      "#$...#...#",
      "#.####.###",
      "#X.....E.#",
    ],
  },
  {
    id: "lvl-003",
    name: "Відкрита печера",
    difficulty: "hard",
    map: [
      "##########",
      "#S.......#",
      "#.##..##.#",
      "#..#$.#..#",
      "#.....X..#",
      "#.##..##.#",
      "#..#..#.$#",
      "#X.....#.#",
      "#..##....#",
      "#.......E#",
    ],
  },
];

const TYPES = {
  "#": "wall",
  ".": "floor",
  S: "start",
  E: "end",
  $: "treasure",
  X: "enemy",
};

// Перетворює текстову мапу на масив рядків із типами клітинок
export function parse(level) {
  return {
    ...level,
    size: level.map.length,
    cells: level.map.map((row) => [...row].map((ch) => TYPES[ch])),
  };
}

export const levels = raw.map(parse);

// Імітація запиту до API: затримка + випадковий рівень
export function fetchLevel({ difficulty } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pool = difficulty
        ? levels.filter((l) => l.difficulty === difficulty)
        : levels;
      const list = pool.length ? pool : levels;
      resolve(list[Math.floor(Math.random() * list.length)]);
    }, 600);
  });
}

export const DIFFICULTY_LABELS = {
  easy: "Легка",
  medium: "Середня",
  hard: "Складна",
};
