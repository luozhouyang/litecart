import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

describe("OrderStatusBadge", () => {
  it("should render pending status", () => {
    render(<OrderStatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should render fulfilled status", () => {
    render(<OrderStatusBadge status="fulfilled" />);
    expect(screen.getByText("Fulfilled")).toBeInTheDocument();
  });

  it("should render paid status", () => {
    render(<OrderStatusBadge status="paid" />);
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("should render canceled status", () => {
    render(<OrderStatusBadge status="canceled" />);
    expect(screen.getByText("Canceled")).toBeInTheDocument();
  });

  it("should render not_fulfilled status with correct styling", () => {
    render(<OrderStatusBadge status="not_fulfilled" />);
    const badge = screen.getByText("Not Fulfilled");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-gray-400");
  });

  it("should render shipped status with correct styling", () => {
    render(<OrderStatusBadge status="shipped" />);
    const badge = screen.getByText("Shipped");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-purple-500");
  });
});
