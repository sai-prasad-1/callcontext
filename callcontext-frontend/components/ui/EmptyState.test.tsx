import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";
import { Phone } from "lucide-react";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={Phone}
        title="No calls yet"
        description="Calls will appear here"
      />
    );
    
    expect(screen.getByText("No calls yet")).toBeInTheDocument();
    expect(screen.getByText("Calls will appear here")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState
        icon={Phone}
        title="No calls"
        description="Get started"
        action={<button>Add Call</button>}
      />
    );
    
    expect(screen.getByRole("button", { name: "Add Call" })).toBeInTheDocument();
  });
});
