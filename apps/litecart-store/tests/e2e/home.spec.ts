import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("page loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Litecart/);
  });

  test("hero section is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Discover Amazing Products");
  });

  test("category navigation is displayed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();
  });

  test("featured products grid is shown", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Featured Products" })).toBeVisible();
  });

  test("header navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Products", exact: true }).click();
    await expect(page).toHaveURL(/\/products/);
  });
});
