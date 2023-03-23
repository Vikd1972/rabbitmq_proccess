/* eslint-disable class-methods-use-this */
import puppeteer, { executablePath } from 'puppeteer';
import type { Browser } from 'puppeteer';

const CreatePuppeteerEnv = class {
  browser: Browser;

  createBrowser = async () => {
    this.browser = await puppeteer.launch({
      ignoreDefaultArgs: ['--disable-extensions'],
      headless: false,
      args: [
        '--use-gl=egl',
        '--shm-size=1gb',
        '--enable-blink-features=HTMLImports',
      ],
      executablePath: executablePath(),
    });
    return this.browser;
  };

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
