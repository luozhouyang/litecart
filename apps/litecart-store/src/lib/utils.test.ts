import { describe, it, expect } from "vite-plus/test";
import { formatPrice, cn } from "@/lib/utils";

describe("formatPrice", () => {
  it("should format cents to currency string", () => {
    expect(formatPrice(1000, "USD")).toBe("$10.00");
    expect(formatPrice(500, "USD")).toBe("$5.00");
    expect(formatPrice(99, "USD")).toBe("$0.99");
  });

  it("should default to USD currency", () => {
    expect(formatPrice(1000)).toBe("$10.00");
  });

  it("should handle zero amount", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("should handle large amounts", () => {
    expect(formatPrice(100000)).toBe("$1,000.00");
  });
});

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", "active", undefined)).toBe("base active");
  });

  it("should handle undefined values", () => {
    expect(cn("base", undefined, "other")).toBe("base other");
  });

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});
