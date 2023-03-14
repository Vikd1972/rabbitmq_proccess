/* eslint-disable max-len */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-await-in-loop */
import type { Browser } from 'puppeteer-core';

import type { ILink } from '../types';
import addOrUpdateLink from '../api/addOrUpdateLink';
import createPage from '../utils/createPage';
import searhLinks from './searchLinks';
import showMessage from '../utils/showMessage';

const arrayOFResults: ILink[] = [];
let initiallinksList: ILink[] = [];
let workinglinksList: ILink[] = [];
let myNumberOfStreams: number;
const listOfInquiry: Promise<void>[] = [];
let myBrowser: Browser;
let numberOfPagesToClose = 0;

const loadItem = (browser: Browser): Promise<void> => {
  return chooseUrlsForParsing(browser);
};

const changeNumberOfStreams = (numberOfStreams: number) => {
  showMessage('WARN', 'parallelParsing.changeNumberOfStreams', `CHANGE NUMBER OF STREMS, NEW VALUE ${numberOfStreams}`);
  if (numberOfStreams > myNumberOfStreams) {
    while (listOfInquiry.length < numberOfStreams) {
      listOfInquiry.push(loadItem(myBrowser));
    }
  } else {
    numberOfPagesToClose = myNumberOfStreams - numberOfStreams;
  }
};

const checkOfNecessityOfClosing = () => {
  if (!numberOfPagesToClose) {
    return false;
  }
  numberOfPagesToClose--;
  return true;
};

const chooseUrlsForParsing = async (browser: Browser) => {
  try {
    const page = await createPage(browser);
    while (workinglinksList.length) {
      const link = workinglinksList.pop();
      // const newLink = await addOrUpdateLink(link);
      await page.goto(link.path, {
        waitUntil: 'networkidle2',
        timeout: 0,
      });
      const getMetrics = await page.metrics();
      let repetitions = 0;
      const result = await searhLinks(page, link);
      showMessage('SUCCESS', 'parallelParsing.chooseUrlsForParsing', `url ${link.path} has been verified`);

      for (const oneLink of result) {
        const checkPathByOriginArray = initiallinksList.findIndex((item) => item.path === oneLink.path);
        const checkPathByResultArray = arrayOFResults.findIndex((item) => item.path === oneLink.path);

        if (checkPathByOriginArray === -1 && checkPathByResultArray === -1) {
          arrayOFResults.push(oneLink);
        } else {
          repetitions++;
        }
      }

      showMessage('INFO', 'parallelParsing.chooseUrlsForParsing', `Result array generated, length: ${arrayOFResults.length}, ${repetitions} repetitions.`);
      const newItemLink = {
        ...link,
        taskDuration: getMetrics.TaskDuration,
        numberOfLinks: result.length - repetitions,
        isChecked: true,
      };
      addOrUpdateLink(newItemLink);

      const isClosed = checkOfNecessityOfClosing();
      if (isClosed) {
        await page.close();
        return;
      }
    }
    await page.close();
    return;
  } catch (error) {
    showMessage('ERROR', 'parallelParsing.chooseUrlsForParsing', error.message);
  }
};

const parallelParsing = async (
  linksList: ILink[] | string,
  numberOfStreams: number,
  browser: Browser,
) => {
  try {
    myBrowser = browser;
    if (Array.isArray(linksList)) {
      initiallinksList = [...linksList];
      workinglinksList = [...linksList];
    } else {
      initiallinksList = [{ path: linksList }];
      workinglinksList = [{ path: linksList }];
    }
    listOfInquiry.length = 0;
    myNumberOfStreams = !numberOfStreams ? 2 : numberOfStreams;
    while (listOfInquiry.length < myNumberOfStreams) {
      listOfInquiry.push(loadItem(myBrowser));
    }

    let completedPromises = [];

    while (completedPromises.length !== listOfInquiry.length) {
      completedPromises = await Promise.all(listOfInquiry);
    }

    return arrayOFResults;
  } catch (error) {
    showMessage('ERROR', 'parallelParsing.parallelParsing', error.message);
  }
};

export default {
  parallelParsing, changeNumberOfStreams, checkOfNecessityOfClosing,
};
