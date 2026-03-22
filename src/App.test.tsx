import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the interactive controls and palette sections", () => {
    render(<App />);

    expect(screen.getByText(/Fabi's Fashionist Fantasy/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Season Studies/i })).toBeInTheDocument();
    expect(screen.getByText(/Best-Fit Season/i)).toBeInTheDocument();
    expect(screen.getByText(/Signature Colors/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Avoid Near The Face/i })).toBeInTheDocument();
  });

  it("shows curated hair, skin, and eye preset groups", () => {
    render(<App />);

    expect(screen.getAllByRole("radiogroup", { name: /hair color presets/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("radiogroup", { name: /skin color presets/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("radiogroup", { name: /eyes color presets/i }).length).toBeGreaterThan(0);
  });

  it("opens the figure popover for a selected feature", () => {
    render(<App />);

    fireEvent.click(screen.getAllByRole("button", { name: "Hair" })[0]);
    expect(screen.getByRole("dialog", { name: /hair color picker/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/hair color/i).length).toBeGreaterThan(0);
  });
});
