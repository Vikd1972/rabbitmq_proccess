import puppeteer from 'puppeteer-core';
import { executablePath } from 'puppeteer';

const createPuppeteerPage = async (options: string[]) => {
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ['--disable-extensions'],
    headless: false,
    args: options,
    executablePath: executablePath(),
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 800,
  });

  page.setDefaultNavigationTimeout(0);

  return { browser, page };
};

export default createPuppeteerPage;
