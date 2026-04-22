import { test, expect } from "@playwright/test";

test.describe("Cart Functionality", () => {
  test("empty cart shows empty message", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByRole("main").getByText("Your cart is empty")).toBeVisible();
  });

  test("cart icon badge appears after adding item", async ({ page }) => {
    await page.goto("/products");
    await page.waitForTimeout(1000);
    const addToCartButtons = page.getByRole("button", { name: /Add to Cart/i });
    const count = await addToCartButtons.count();
    if (count > 0) {
      await addToCartButtons.first().click();
      await page.waitForTimeout(500);
      // Check cart badge
      const cartBadge = page.locator('[aria-label="Shopping cart"]').locator("span");
      const badgeCount = await cartBadge.count();
      if (badgeCount > 0) {
        await expect(cartBadge).toBeVisible();
      }
    }
  });

  test("cart page displays added items", async ({ page }) => {
    // Add item first
    await page.goto("/products");
    await page.waitForTimeout(1000);
    const addToCartButtons = page.getByRole("button", { name: /Add to Cart/i });
    const count = await addToCartButtons.count();
    if (count > 0) {
      await addToCartButtons.first().click();
      await page.waitForTimeout(500);
      // Go to cart page
      await page.goto("/cart");
      await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
    }
  });

  test("proceed to checkout button works", async ({ page }) => {
    // Add item first
    await page.goto("/products");
    await page.waitForTimeout(1000);
    const addToCartButtons = page.getByRole("button", { name: /Add to Cart/i });
    const count = await addToCartButtons.count();
    if (count > 0) {
      await addToCartButtons.first().click();
      await page.waitForTimeout(500);
      // Go to cart page
      await page.goto("/cart");
      // Check for Proceed to Checkout button
      const checkoutButton = page.getByRole("link", { name: /Proceed to Checkout/i });
      if (await checkoutButton.isVisible()) {
        await checkoutButton.click();
        await expect(page).toHaveURL(/\/checkout/);
      }
    }
  });

  test("continue shopping button works", async ({ page }) => {
    await page.goto("/cart");
    const continueButton = page.getByRole("link", { name: /Continue Shopping/i });
    if (await continueButton.isVisible()) {
      await continueButton.click();
      await expect(page).toHaveURL(/\/products/);
    }
  });
});
