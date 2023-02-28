/* eslint-disable no-console */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import type { Browser } from 'puppeteer-core';

import type { ILink } from '../types';
import searhLinks from './searchLinks';
import parallelParsing from './parallelParsing';
import updateLink from '../api/updateLink';
import createPuppeteerPage from '../utils/createPuppeteerPage';
import showMessage from '../utils/showMessage';

const init = async (itemLink: ILink) => {
  let browser: Browser;
  let attempt = 0;
  while (attempt < 3) {
    try {
      const { browser, page } = await createPuppeteerPage(
        [
          '--use-gl=egl',
          '--shm-size=1gb',
          '--enable-blink-features=HTMLImports',
        ],
      );

      await page.goto(itemLink.path, {
        waitUntil: 'networkidle2',
        timeout: 0,
      });
      const getMetrics = await page.metrics();

      const linksList = await searhLinks(page, itemLink);

      return {
        linksList,
        browser,
        taskDuration: getMetrics.TaskDuration,
      };
    } catch (error) {
      showMessage('ERROR', 'parsingLinks.init', `${error}`);
      attempt++;
      await browser.close();
    }
  }
};

const parsingLinks = async (itemLink: ILink, numberOfStreams: number) => {
  const { linksList, browser, taskDuration } = await init(itemLink);

  const newItemLink = {
    ...itemLink,
    taskDuration,
    numberOfLinks: linksList.length,
    isChecked: true,
  };

  updateLink(newItemLink);

  linksList.length = 10;

  await parallelParsing(linksList, numberOfStreams, browser);

  // let listOfLinks = linksList.filter((item) => item.isChecked === false);
  // do {
  //   showMessage('WARN', 'parsingAvitoLinls', `number of new array links ${listOfLinks.length}`);
  //   for (let item of listOfLinks) {
  //     showMessage('INFO', 'parsingAvitoLinls', `check of ${item.path}`);
  //     await init(item.path);
  //     item = {
  //       ...item,
  //       isChecked: true,
  //     };
  //     // await avito.addAvitoLink(item);
  //   }
  //   listOfLinks = linksList.filter((item) => item.isChecked === false);
  // } while (listOfLinks);
  await browser.close();
};

export default parsingLinks;
