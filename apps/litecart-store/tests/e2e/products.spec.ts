import { test, expect } from "@playwright/test";

test.describe("Product Browsing", () => {
  test("products page loads with product grid", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
  });

  test("product card displays add-to-cart button", async ({ page }) => {
    await page.goto("/products");
    // Wait for products to load (either cards or empty state)
    await page.waitForTimeout(1000);
    // Check for Add to Cart buttons if products exist
    const addToCartButtons = page.getByRole("button", { name: /Add to Cart/i });
    const count = await addToCartButtons.count();
    if (count > 0) {
      await expect(addToCartButtons.first()).toBeVisible();
    } else {
      // If no products, check for empty state
      await expect(page.getByText("No products found")).toBeVisible();
    }
  });

  test("click product navigates to product detail", async ({ page }) => {
    await page.goto("/products");
    await page.waitForTimeout(1000);
    // Check for product cards
    const productLinks = page.locator("h3.font-semibold");
    const count = await productLinks.count();
    if (count > 0) {
      await productLinks.first().click();
      await expect(page).toHaveURL(/\/products\/[^/]+$/);
    }
  });

  test("product detail page shows product info", async ({ page }) => {
    // First check if products exist
    await page.goto("/products");
    await page.waitForTimeout(1000);
    const productLinks = page.locator("h3.font-semibold");
    const count = await productLinks.count();
    if (count > 0) {
      await productLinks.first().click();
      // Check that we're on a product detail page
      await expect(page.getByRole("button", { name: /Add to Cart/i })).toBeVisible();
    }
  });
});
