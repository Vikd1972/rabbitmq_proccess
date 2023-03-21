/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import type { Browser, Page, Metrics } from 'puppeteer';

import type { ILink, IDomain } from '../types';
import updateDomain from '../api/updateDomain';
import setLink from '../api/setLink';
import createPuppeteerEnv from '../utils/createPuppeteerEnv';
import searhLinks from './searchLinks';
import logger from '../utils/logger';

const ParallelParsing = class {
  myBrowser: {
    [index: number]: Browser;
  } = {};

  listOfInquiry: {
    [index: number]: Promise<void>[];
  } = {};

  arrayOFResults: {
    [index: number]: ILink[];
  } = {};

  initiallinksList: {
    [index: string]: ILink[];
  } = {};

  workinglinksList: {
    [index: string]: ILink[];
  } = {};

  myNumberOfStreams: {
    [index: number]: number;
  } = {};

  isDomain: {
    [index: number]: boolean;
  } = {};

  idDomain: {
    [index: number]: number;
  } = {};

  // get promise **********************

  loadItem = (index: number, idProcess: number): Promise<void> => {
    return this.chooseUrlsForParsing(index, idProcess);
  };

  // data initialization **************

  dataInitialization = (linksList: ILink[] | IDomain, idProcess: number) => {
    if (Array.isArray(linksList)) {
      this.initiallinksList[idProcess] = [...linksList];
      this.workinglinksList[idProcess] = [...linksList];
      this.isDomain[idProcess] = false;
    } else {
      this.initiallinksList[idProcess] = [{ id: linksList.id, path: linksList.domain }];
      this.workinglinksList[idProcess] = [{ id: linksList.id, path: linksList.domain }];
      this.isDomain[idProcess] = true;
    }
  };

  // filling in the array of promis ***

  fillingArray = (numberOfStreams: number, idProcess: number) => {
    this.myNumberOfStreams[idProcess] = !numberOfStreams ? 2 : numberOfStreams;
    const arrayOfProcess = [];
    for (let i = 0; i < this.myNumberOfStreams[idProcess]; i++) {
      arrayOfProcess[i] = this.loadItem(i, idProcess);
    }
    this.listOfInquiry[idProcess] = arrayOfProcess;
  };

  // parsing **************************

  parsing = async (
    linksList: ILink[] | IDomain,
    numberOfStreams: number,
    browser: Browser,
  ) => {
    try {
      const idProcess = Array.isArray(linksList) ? linksList[0].idDomain : linksList.id;
      this.myBrowser[idProcess] = browser;
      this.dataInitialization(linksList, idProcess);
      this.fillingArray(numberOfStreams, idProcess);

      let completedPromises = [];

      while (completedPromises.length !== this.listOfInquiry[idProcess].length) {
        completedPromises = await Promise.all(this.listOfInquiry[idProcess]);
      }
      return this.arrayOFResults[idProcess];
    } catch (error) {
      logger('ERROR', 'parallelParsing.parsing', error.message);
    }
  };

  // run search ***********************

  runSearch = async (link: ILink, page: Page, idProcess: number) => {
    await page.goto(link.path, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });
    const getMetrics = await page.metrics();
    let repetitions = 0;
    const result = await searhLinks(page, link);
    logger('SUCCESS', 'parallelParsing.runSearch', `url ${link.path} has been verified`);

    this.arrayOFResults[idProcess] = [];
    const resultsArray = [];
    for (const oneLink of result) {
      const checkPathByOriginArray = this.initiallinksList[idProcess].findIndex((item) => item.path === oneLink.path);
      const checkPathByResultArray = this.arrayOFResults[idProcess].findIndex((item) => item.path === oneLink.path);
      if (checkPathByOriginArray === -1 && checkPathByResultArray === -1) {
        resultsArray.push(oneLink);
      } else {
        repetitions++;
      }
    }
    this.arrayOFResults[idProcess] = resultsArray;
    return { getMetrics, repetitions, result };
  };

  // save link ************************

  saveLink = async (link: ILink, getMetrics: Metrics, repetitions: number, result: ILink[], idProcess: number) => {
    logger('INFO', 'parallelParsing.saveLink', `Result array generated, length: ${this.arrayOFResults[idProcess].length}, ${repetitions} repetitions.`);
    const newItemLink = {
      ...link,
      idDomain: this.idDomain[idProcess],
      taskDuration: getMetrics.TaskDuration,
      numberOfLinks: result.length - repetitions,
      isChecked: true,
    };

    if (!this.isDomain[idProcess]) {
      await setLink(newItemLink);
    } else {
      await updateDomain(newItemLink.id);
      this.idDomain[idProcess] = newItemLink.id;
    }
  };

  // choose url for parsing ***********

  chooseUrlsForParsing = async (index: number, idProcess: number) => {
    try {
      const page = await createPuppeteerEnv.createPage(this.myBrowser[idProcess]);
      while (this.workinglinksList[idProcess].length) {
        const link = this.workinglinksList[idProcess].pop();
        const { getMetrics, repetitions, result } = await this.runSearch(link, page, idProcess);

        await this.saveLink(link, getMetrics, repetitions, result, idProcess);

        if (index >= this.myNumberOfStreams[idProcess]) {
          break;
        }
      }
      await page.close();
      return;
    } catch (error) {
      logger('ERROR', 'parallelParsing.chooseUrlsForParsing', error.message);
    }
  };

  // change number of streams +++++++++

  changeNumberOfStreams = (numberOfStreams: number, idProcess: number) => {
    if (numberOfStreams > this.myNumberOfStreams[idProcess]) {
      for (let i = this.myNumberOfStreams[idProcess]; i < numberOfStreams; i++) {
        this.listOfInquiry[idProcess].push(this.loadItem(i, idProcess));
      }
    }
    this.myNumberOfStreams[idProcess] = numberOfStreams;
  };
};

export default new ParallelParsing();
