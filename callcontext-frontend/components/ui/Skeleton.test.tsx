import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, SkeletonText, SkeletonCard } from "../Skeleton";

describe("Skeleton", () => {
  it("renders skeleton element", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-10 w-20" />);
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toHaveClass("h-10");
    expect(skeleton).toHaveClass("w-20");
  });
});

describe("SkeletonText", () => {
  it("renders multiple lines", () => {
    const { container } = render(<SkeletonText lines={3} />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons).toHaveLength(3);
  });
});

describe("SkeletonCard", () => {
  it("renders card skeleton with content", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector(".border-warm-200")).toBeInTheDocument();
  });
});
