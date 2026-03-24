import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "../Avatar";

describe("Avatar", () => {
  it("renders initials from firstName and lastName", () => {
    render(<Avatar firstName="John" lastName="Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders ? when no names provided", () => {
    render(<Avatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("applies small size styles", () => {
    render(<Avatar firstName="J" lastName="D" size="sm" />);
    const avatar = screen.getByText("JD").parentElement;
    expect(avatar).toHaveClass("w-6");
    expect(avatar).toHaveClass("h-6");
  });

  it("applies large size styles", () => {
    render(<Avatar firstName="J" lastName="D" size="lg" />);
    const avatar = screen.getByText("JD").parentElement;
    expect(avatar).toHaveClass("w-10");
    expect(avatar).toHaveClass("h-10");
  });

  it("applies extra large size styles", () => {
    render(<Avatar firstName="J" lastName="D" size="xl" />);
    const avatar = screen.getByText("JD").parentElement;
    expect(avatar).toHaveClass("w-16");
    expect(avatar).toHaveClass("h-16");
  });
});
