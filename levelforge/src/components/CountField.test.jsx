import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CountField from "./CountField";

function setup(value = 3, max = 8) {
  const onChange = vi.fn();
  render(<CountField id="enemies" label="Вороги" value={value} max={max} onChange={onChange} />);
  return { onChange, number: screen.getByRole("spinbutton"), range: screen.getByRole("slider") };
}

describe("CountField", () => {
  it("показує поточне значення й максимум", () => {
    const { number, range } = setup(3, 8);
    expect(number).toHaveValue(3);
    expect(range).toHaveValue("3");
    expect(range).toHaveAttribute("max", "8");
    expect(screen.getByText("Максимум для цього розміру: 8")).toBeInTheDocument();
  });

  it("передає введене число", () => {
    const { number, onChange } = setup();
    fireEvent.change(number, { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("обрізає значення до максимуму", () => {
    const { number, onChange } = setup(3, 8);
    fireEvent.change(number, { target: { value: "99" } });
    expect(onChange).toHaveBeenCalledWith(8);
  });

  it("не допускає від'ємних чисел", () => {
    const { number, onChange } = setup();
    fireEvent.change(number, { target: { value: "-4" } });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("повзунок теж змінює значення", () => {
    const { range, onChange } = setup();
    fireEvent.change(range, { target: { value: "6" } });
    expect(onChange).toHaveBeenCalledWith(6);
  });
});
