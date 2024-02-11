import { clickOnButton, retry, waitForOverlay } from "../helpers";
import { DappeteerPage } from "../page";

export const acceptAddNetwork =
  (page: DappeteerPage) =>
  async (shouldSwitch = false): Promise<void> => {
    await retry(async () => {
      await page.bringToFront();
      await page.reload();
      await waitForOverlay(page);
      await page.waitForSelector(".confirmation-page", {
        timeout: 2000,
      });
      await page.waitForTimeout(500);
      await clickOnButton(page, "Approve", { timeout: 1000 });
    }, 2);
    if (shouldSwitch) {
      await clickOnButton(page, "Switch network");
      await page.waitForTimeout(500);
      await page.waitForSelector(".new-network-info__wrapper", {
        visible: true,
      });
      await clickOnButton(page, "Got it");
      await page.waitForTimeout(500);
    } else {
      await clickOnButton(page, "Cancel");
      await page.waitForTimeout(500);
    }
  };

export const rejectAddNetwork =
  (page: DappeteerPage) => async (): Promise<void> => {
    await retry(async () => {
      await page.bringToFront();
      await page.reload();
      await waitForOverlay(page);

      await clickOnButton(page, "Cancel", { timeout: 500 });
    }, 5);
  };
