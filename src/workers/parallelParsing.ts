/* eslint-disable no-await-in-loop */
import type { Browser } from 'puppeteer-core';

import createBrowser from '../utils/createBrowser';
import createPage from '../utils/createPage';
import showMessage from '../utils/showMessage';

const arrayOFResults: {
  link: string;
  taskDuration: number;
}[] = [];

const searchUrls = async (browser: Browser, arrayOfLinks: string[]) => {
  const page = await createPage(browser);

  while (arrayOfLinks.length) {
    const link = arrayOfLinks.pop();

    await page.goto(link, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });
    const getMetrics = await page.metrics();
    showMessage('SUCCESS', 'parallelParsing', `url ${link} has been verified`);
    arrayOFResults.push({
      link,
      taskDuration: getMetrics.TaskDuration,
    });
  }
  await page.close();
};

const parallelParsing = async (numberOfStreams: number, arrayOfLinks: string[]) => {
  const browser = await createBrowser(
    [
      '--use-gl=egl',
    ],
  );

  const loadItem = (): Promise<void> => {
    return searchUrls(browser, arrayOfLinks);
  };

  const listOfInquiry = new Array(numberOfStreams);

  for (let i = 0; i < listOfInquiry.length; i++) {
    listOfInquiry[i] = loadItem();
  }
  await Promise.all(listOfInquiry);
  await browser.close();
};

export default parallelParsing;
