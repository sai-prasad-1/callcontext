import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner, PageSpinner } from "../Spinner";

describe("Spinner", () => {
  it("renders", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("applies small size", () => {
    const { container } = render(<Spinner size="sm" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toHaveClass("w-4");
  });

  it("applies large size", () => {
    const { container } = render(<Spinner size="lg" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toHaveClass("w-8");
  });
});

describe("PageSpinner", () => {
  it("renders centered spinner", () => {
    const { container } = render(<PageSpinner />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
