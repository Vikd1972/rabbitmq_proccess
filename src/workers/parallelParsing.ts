/* eslint-disable no-restricted-globals */
/* eslint-disable no-await-in-loop */
import type { Browser } from 'puppeteer-core';

import type { ILink } from '../types';
// import createBrowser from '../utils/createBrowser';
import createPage from '../utils/createPage';
import searhLinks from './searchLinks';
import showMessage from '../utils/showMessage';

const arrayOFResults: ILink[] = [];

const searchUrls = async (browser: Browser, linksList: ILink[]) => {
  console.log(linksList);
  const page = await createPage(browser);
  const workinglinksList = [...linksList];
  while (workinglinksList.length) {
    const link = workinglinksList.pop();

    const result = await searhLinks(page, link);
    // await page.goto(link.path, {
    //   waitUntil: 'networkidle2',
    //   timeout: 0,
    // });
    // const getMetrics = await page.metrics();
    // eslint-disable-next-line max-len
    showMessage('SUCCESS', 'parallelParsing', `url ${link.path} has been verified`);

    for (const oneLink of result) {
      if (linksList.find((item) => item.path !== oneLink.path)) {
        showMessage('INFO', 'parallelParsing', `url ${oneLink.path} has been added`);
        arrayOFResults.push(oneLink);
      }
    }
  }
  await page.close();
};

const parallelParsing = async (
  linksList: ILink[],
  numberOfStreams: number,
  browser: Browser,
) => {
  const loadItem = (): Promise<void> => {
    return searchUrls(browser, linksList);
  };

  const listOfInquiry = new Array(isNaN(numberOfStreams) ? 2 : numberOfStreams);

  for (let i = 0; i < listOfInquiry.length; i++) {
    listOfInquiry[i] = loadItem();
  }
  await Promise.all(listOfInquiry);

  await browser.close();
};

export default parallelParsing;
