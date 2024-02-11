import {
  clickOnButton,
  clickOnLogo,
  getElementByContent,
  openNetworkDropdown,
} from "../../helpers";
import { DappeteerPage } from "../../page";

export const deleteNetwork =
  (page: DappeteerPage) =>
  async (name: string): Promise<void> => {
    try {
      await page.bringToFront();
      await openNetworkDropdown(page);
      const network = await getElementByContent(page, name, undefined, {
        timeout: 300,
      });
      await network.hover();
      await page.waitForTimeout(1000);

      const buttonElement = await page.waitForXPath(
        `//div[contains(@class, 'multichain-network-list-item__network-name') and contains(., '${name}')]/ancestor::div[contains(@class, 'multichain-network-list-item')]//button[contains(@aria-label, 'Delete network')]`,
        { timeout: 300 }
      );

      await page.waitForTimeout(500);
      await buttonElement.click();
      await page.waitForTimeout(500);
      await clickOnButton(page, "Delete");
      await page.waitForTimeout(1000);
    } catch (error) {}
    await clickOnLogo(page);
  };
