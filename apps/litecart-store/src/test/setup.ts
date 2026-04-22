import "@testing-library/jest-dom/vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock window.URLSearchParams
class MockURLSearchParams {
  private params: Map<string, string> = new Map();

  constructor(search?: string) {
    if (search) {
      const pairs = search.split("&");
      for (const pair of pairs) {
        const [key, value] = pair.split("=");
        if (key) {
          this.params.set(key, value ?? "");
        }
      }
    }
  }

  get(key: string): string | null {
    return this.params.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.params.set(key, value);
  }

  toString(): string {
    const pairs: string[] = [];
    for (const [key, value] of this.params) {
      pairs.push(`${key}=${value}`);
    }
    return pairs.join("&");
  }
}

Object.defineProperty(globalThis, "URLSearchParams", {
  value: MockURLSearchParams,
  writable: true,
});

// Mock window.location
const mockLocation = {
  search: "",
  href: "http://localhost:3000",
  pathname: "/",
};

Object.defineProperty(globalThis, "window", {
  value: {
    location: mockLocation,
    URLSearchParams: MockURLSearchParams,
  },
  writable: true,
});
