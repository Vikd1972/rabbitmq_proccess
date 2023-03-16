import puppeteer from 'puppeteer-core';
import type { Browser } from 'puppeteer-core';
import { executablePath } from 'puppeteer';

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

  createPage = async () => {
    const page = await this.browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 800,
    });
    page.setDefaultNavigationTimeout(0);
    return page;
  };
};

export default new CreatePuppeteerEnv();