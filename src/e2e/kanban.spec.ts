import { test, expect } from "@playwright/test";

test("full kanban offline sync flow", async ({ page, context }) => {
  await page.goto("http://localhost:5173");

  // Create list
  await page.getByText("+ Add List").click();
  await page.keyboard.type("My List");
  await page.keyboard.press("Enter");

  // Add card
  await page.getByText("+ Add Card").click();
  await page.getByPlaceholder("Title").fill("Card 1");
  await page.getByPlaceholder("Description").fill("Desc");
  await page.getByText("Save").click();

  // Go offline
  await context.setOffline(true);

  // Move card (drag)
  const card = page.getByText("Card 1");
  await card.dragTo(page.getByText("Done"));

  // Go online
  await context.setOffline(false);
  await page.reload();

  // Verify persisted
  await expect(page.getByText("Card 1")).toBeVisible();
});
