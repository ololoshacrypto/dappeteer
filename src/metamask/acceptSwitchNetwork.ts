import { clickOnButton, waitForOverlay } from "../helpers";
import { DappeteerPage } from "../page";

export const acceptSwitchNetwork =
  (page: DappeteerPage) => async (): Promise<void> => {
    await page.bringToFront();
    await page.reload();
    await waitForOverlay(page);
    await page.waitForTimeout(1000);
    await clickOnButton(page, "Switch network", { timeout: 1500 });
    await page.waitForTimeout(500);
    await page.waitForSelector(".new-network-info__wrapper", {
      visible: true,
    });
    await clickOnButton(page, "Got it");
    await page.waitForTimeout(500);
  };
