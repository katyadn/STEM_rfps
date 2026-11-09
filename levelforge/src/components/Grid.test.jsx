import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parse } from "../data/levels";
import Grid from "./Grid";

const level = parse({ map: ["#####", "#S.E#", "#.X.#", "#$..#", "#####"] });

describe("Grid", () => {
  it("малює стільки клітинок, скільки має карта", () => {
    const { container } = render(<Grid cells={level.cells} label="Карта" />);
    expect(container.querySelectorAll(".cell")).toHaveLength(25);
  });

  it("має текстовий опис для скрінрідерів", () => {
    render(<Grid cells={level.cells} label="Карта 5 на 5" />);
    expect(screen.getByRole("img", { name: "Карта 5 на 5" })).toBeInTheDocument();
  });

  it("підписує вхід і вихід літерами S та E", () => {
    render(<Grid cells={level.cells} label="Карта" cellSize={30} />);
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument();
  });

  it("ховає літери, коли клітинки замалі", () => {
    render(<Grid cells={level.cells} label="Карта" cellSize={12} />);
    expect(screen.queryByText("S")).not.toBeInTheDocument();
  });

  it("підсвічує шлях, але не вхід і вихід", () => {
    const path = [[1, 1], [2, 1], [3, 1]];
    const { container } = render(<Grid cells={level.cells} label="Карта" path={path} />);
    expect(container.querySelectorAll(".cell--path")).toHaveLength(1);
  });

  it("без шляху нічого не підсвічує", () => {
    const { container } = render(<Grid cells={level.cells} label="Карта" />);
    expect(container.querySelectorAll(".cell--path")).toHaveLength(0);
  });

  it("у режимі мініатюри не показує літер", () => {
    const { container } = render(<Grid compact cells={level.cells} label="Міні" />);
    expect(container.querySelector(".grid--compact")).toBeInTheDocument();
    expect(screen.queryByText("S")).not.toBeInTheDocument();
  });
});
