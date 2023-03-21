import puppeteer, { executablePath } from 'puppeteer';
import type { Browser } from 'puppeteer';

const CreatePuppeteerEnv = class {
  browser: Browser;

  createBrowser = async (options: string[]) => {
    this.browser = await puppeteer.launch({
      ignoreDefaultArgs: ['--disable-extensions'],
      headless: false,
      args: options,
      executablePath: executablePath(),
    });
    return this.browser;
  };

  // eslint-disable-next-line class-methods-use-this
  createPage = async (browser: Browser) => {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 800,
    });
    page.setDefaultNavigationTimeout(60000);
    return page;
  };
};

export default new CreatePuppeteerEnv();
