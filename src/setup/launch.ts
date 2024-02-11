import fs from "fs";
import path from "path";
import { RECOMMENDED_METAMASK_VERSION } from "..";
import { DappeteerBrowser } from "../browser";
import { DappeteerLaunchOptions } from "../types";
import { copyUserDataFiles } from "../helpers/utils";
import { launchPlaywright } from "./playwright";
import { launchPuppeteer } from "./puppeteer";
import { isNewerVersion } from "./utils/isNewerVersion";
import downloader from "./utils/metaMaskDownloader";
import { getTemporaryUserDataDir } from "./utils/getTemporaryUserDataDir";
import { patchMetaMask } from "./utils/patch";

/**
 * Launch Puppeteer chromium instance with MetaMask plugin installed
 * */
export async function launch(
  options: DappeteerLaunchOptions = {}
): Promise<DappeteerBrowser> {
  if (!options.metaMaskVersion && !options.metaMaskPath) {
    options.metaMaskVersion = RECOMMENDED_METAMASK_VERSION;
  }
  if (options.headless === undefined) {
    options.headless = true;
  }
  let metamaskPath: string;
  if (options.metaMaskVersion) {
    const { metaMaskVersion, metaMaskLocation } = options;

    metamaskPath = await downloader(metaMaskVersion, {
      location: metaMaskLocation,
      flask: options.metaMaskFlask,
    });
  } else {
    // console.log(`Running tests on local MetaMask build`);

    metamaskPath = options.metaMaskPath;
  }

  patchMetaMask(metamaskPath, { key: options.key });
  const userDataDir = getTemporaryUserDataDir();
  if (options.userDataDir)
    copyUserDataFiles(path.resolve(options.userDataDir), userDataDir);

  if (options.automation) {
    switch (options.automation) {
      case "custom":
        console.warn("Custom automation in use. Proceed at own risk.");
        if (!options.customAutomation) {
          fs.rmSync(userDataDir, { recursive: true, force: true });
          throw new Error("Missing customBootstrap method in options");
        }
        return await options.customAutomation(
          metamaskPath,
          userDataDir,
          options
        );
      case "playwright":
        return await launchPlaywright(metamaskPath, userDataDir, options);
      case "puppeteer":
        return await launchPuppeteer(metamaskPath, userDataDir, options);
      default:
        fs.rmSync(userDataDir, { recursive: true, force: true });
        throw new Error(
          "Unsupported automation tool. Use playwright or puppeteer"
        );
    }
  } else {
    try {
      return await launchPlaywright(metamaskPath, userDataDir, options);
      // eslint-disable-next-line no-empty
    } catch (ignored) {}
    try {
      return await launchPuppeteer(metamaskPath, userDataDir, options);
    } catch (error) {
      fs.rmSync(userDataDir, { recursive: true, force: true });
      throw new Error("Failed to launch both playwright and puppeteer");
    }
  }
}
