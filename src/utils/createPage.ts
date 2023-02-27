import type { Browser } from 'puppeteer-core';

const createPage = async (browser: Browser) => {
  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 800,
  });

  page.setDefaultNavigationTimeout(0);

  return page;
};

export default createPage;
