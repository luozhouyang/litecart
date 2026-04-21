import { describe, it, expect } from "vite-plus/test";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const includeBar = false;
    const result = cn("foo", includeBar && "bar", "baz");
    expect(result).toBe("foo baz");
  });

  it("should merge tailwind classes correctly", () => {
    // twMerge should deduplicate conflicting tailwind classes
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("should handle undefined and null values", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle object notation", () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe("foo baz");
  });

  it("should handle array notation", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toBe("foo bar baz");
  });
});
