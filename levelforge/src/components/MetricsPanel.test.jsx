import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parse } from "../data/levels";
import MetricsPanel from "./MetricsPanel";

const map = ["#####", "#S.E#", "#.X.#", "#$..#", "#####"];

describe("MetricsPanel", () => {
  it("показує «Існує» і довжину шляху, коли шлях є", () => {
    render(<MetricsPanel level={parse({ map, pathLength: 2, deadEnds: 0 })} />);
    expect(screen.getByText("Існує")).toBeInTheDocument();
    expect(screen.getByText("2 кроків")).toBeInTheDocument();
  });

  it("показує «Не існує», коли шляху немає", () => {
    render(<MetricsPanel level={parse({ map, pathLength: 0 })} />);
    expect(screen.getByText("Не існує")).toBeInTheDocument();
  });

  it("виводить розмір і кількість ворогів та скарбів", () => {
    render(<MetricsPanel level={parse({ map, pathLength: 2 })} />);
    expect(screen.getByText("5×5")).toBeInTheDocument();
    expect(screen.getByText("Вороги").closest(".row")).toHaveTextContent("1 (4.0 на 100 кл.)");
    expect(screen.getByText("Скарби").closest(".row")).toHaveTextContent("1 (4.0 на 100 кл.)");
  });

  it("індекс збалансованості має доступний підпис", () => {
    render(<MetricsPanel level={parse({ map, pathLength: 2 })} />);
    expect(screen.getByLabelText(/Індекс збалансованості: \d+ зі 100/)).toBeInTheDocument();
  });

  it("не називає окремі показники поганими", () => {
    render(<MetricsPanel level={parse({ map, pathLength: 2 })} />);
    expect(screen.queryByText(/забагато|замало|погано/i)).not.toBeInTheDocument();
  });
});
