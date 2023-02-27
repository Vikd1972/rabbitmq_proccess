import puppeteer from 'puppeteer-core';
import { executablePath } from 'puppeteer';

const createBrowser = async (options: string[]) => {
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ['--disable-extensions'],
    headless: true,
    args: options,
    executablePath: executablePath(),
  });

  return browser;
};

export default createBrowser;
