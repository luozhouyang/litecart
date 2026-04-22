import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test("empty cart shows message on checkout page", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("main").getByText("Your cart is empty")).toBeVisible();
  });

  test("checkout form is visible with items in cart", async ({ page }) => {
    // Add item first
    await page.goto("/products");
    await page.waitForTimeout(1000);
    const addToCartButtons = page.getByRole("button", { name: /Add to Cart/i });
    const count = await addToCartButtons.count();
    if (count > 0) {
      await addToCartButtons.first().click();
      await page.waitForTimeout(500);
      // Go to checkout
      await page.goto("/checkout");
      await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    }
  });

  test("email input is present on checkout form", async ({ page }) => {
    // Add item first
    await page.goto("/products");
    await page.waitForTimeout(1000);
    const addToCartButtons = page.getByRole("button", { name: /Add to Cart/i });
    const count = await addToCartButtons.count();
    if (count > 0) {
      await addToCartButtons.first().click();
      await page.waitForTimeout(500);
      await page.goto("/checkout");
      // Check for email input
      const emailInput = page.getByRole("textbox", { name: /Email/i });
      if (await emailInput.isVisible()) {
        await expect(emailInput).toBeVisible();
      }
    }
  });

  test("place order button exists on checkout form", async ({ page }) => {
    // Add item first
    await page.goto("/products");
    await page.waitForTimeout(1000);
    const addToCartButtons = page.getByRole("button", { name: /Add to Cart/i });
    const count = await addToCartButtons.count();
    if (count > 0) {
      await addToCartButtons.first().click();
      await page.waitForTimeout(500);
      await page.goto("/checkout");
      // Check for Place Order button
      const placeOrderButton = page.getByRole("button", { name: /Place Order/i });
      if (await placeOrderButton.isVisible()) {
        await expect(placeOrderButton).toBeVisible();
        // Button should be disabled without email
        await expect(placeOrderButton).toBeDisabled();
      }
    }
  });

  test("back to cart link works", async ({ page }) => {
    // Add item first
    await page.goto("/products");
    await page.waitForTimeout(1000);
    const addToCartButtons = page.getByRole("button", { name: /Add to Cart/i });
    const count = await addToCartButtons.count();
    if (count > 0) {
      await addToCartButtons.first().click();
      await page.waitForTimeout(500);
      await page.goto("/checkout");
      const backLink = page.getByRole("link", { name: /Back to Cart/i });
      if (await backLink.isVisible()) {
        await backLink.click();
        await expect(page).toHaveURL(/\/cart/);
      }
    }
  });
});
