/* eslint-disable no-restricted-globals */
/* eslint-disable no-await-in-loop */
import type { Browser } from 'puppeteer-core';

import type { ILink } from '../types';
import addOrUpdateLink from '../api/addOrUpdateLink';
import createPage from '../utils/createPage';
import searhLinks from './searchLinks';
import showMessage from '../utils/showMessage';

const arrayOFResults: ILink[] = [];
let workinglinksList: ILink[] = [];

const searchUrls = async (browser: Browser, linksList: ILink[]) => {
  const page = await createPage(browser);
  while (workinglinksList.length) {
    const link = workinglinksList.pop();
    const newLink = await addOrUpdateLink(link);

    await page.goto(newLink.path, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });

    const getMetrics = await page.metrics();
    let repetitions = 0;

    const result = await searhLinks(page, newLink);
    showMessage('SUCCESS', 'parallelParsing', `url ${newLink.path} has been verified`);

    for (const oneLink of result) {
      const checkPathByOriginArray = linksList.findIndex((item) => item.path === oneLink.path);
      const checkPathByResultArray = arrayOFResults.findIndex((item) => item.path === oneLink.path);

      if (checkPathByOriginArray === -1 && checkPathByResultArray === -1) {
        arrayOFResults.push(oneLink);
      } else {
        repetitions++;
      }
    }

    showMessage('INFO', 'parallelParsing', `Result array generated, length: ${arrayOFResults.length}, ${repetitions} repetitions.`);

    const newItemLink = {
      ...newLink,
      taskDuration: getMetrics.TaskDuration,
      numberOfLinks: result.length - repetitions,
      isChecked: true,
    };

    addOrUpdateLink(newItemLink);
  }
  await page.close();
};
const parallelParsing = async (
  linksList: ILink[],
  numberOfStreams: number,
  browser: Browser,
) => {
  workinglinksList = [...linksList];

  const loadItem = (): Promise<void> => {
    return searchUrls(browser, linksList);
  };

  const listOfInquiry = new Array(isNaN(numberOfStreams) ? 2 : numberOfStreams);

  for (let i = 0; i < listOfInquiry.length; i++) {
    listOfInquiry[i] = loadItem();
  }
  await Promise.all(listOfInquiry);

  return arrayOFResults;
};

export default parallelParsing;
