import { clickOnButton, getButton, openNetworkDropdown } from "../helpers";
import { DappeteerPage } from "../page";

// TODO: validate - for now works fine as it is.
export const switchNetwork =
  (page: DappeteerPage) =>
  async (
    network: "mainnet" | "optimism" | "arbitrum" | "base" | "scroll" | "linea"
  ): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);
    const networkIndex = await page.evaluate((network: string) => {
      const elements = document.querySelectorAll(
        ".multichain-network-list-item__network-name"
      );
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (
          (element as HTMLLIElement).innerText
            .toLowerCase()
            .includes(network.toLowerCase())
        ) {
          return i;
        }
      }
      return -1;
    }, network);
    if (networkIndex < 0) {
      throw new Error(`Network not found`);
    }

    const networkFullName = await page.evaluate((index: number) => {
      const elements = document.querySelectorAll(
        `.multichain-network-list-item__network-name`
      );
      return (elements[index] as HTMLLIElement).innerText;
    }, networkIndex);
    const networkButton = (
      await page.$$(".multichain-network-list-item__network-name")
    )[networkIndex];
    await networkButton.click();
    await page.waitForTimeout(500);
    let gotItBtn;
    try {
      gotItBtn = await getButton(page, "Got it", {
        timeout: 1500,
        visible: true,
      });
    } catch (e) {}
    if (gotItBtn) {
      await clickOnButton(page, "Got it");
    }
    await page.waitForTimeout(1500);
    try {
      await page.evaluate(() => {
        const btn = document.querySelector(
          ".popover-header__title h2 + button"
        );
        if (btn) {
          btn.click();
        }
      });
    } catch (error) {}
    await page.waitForXPath(`//*[text() = '${networkFullName}']`);
  };
