/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import type { Browser, Page } from 'puppeteer-core';
import type { Metrics } from 'puppeteer';

import type { ILink, IDomain } from '../types';
import updateDomain from '../api/updateDomain';
import setLink from '../api/setLink';
import createPuppeteerEnv from '../utils/createPuppeteerEnv';
import searhLinks from './searchLinks';
import logger from '../utils/logger';

const ParallelParsing = class {
  myBrowser: Browser;

  listOfInquiry: Promise<void>[] = [];

  arrayOFResults: ILink[] = [];

  initiallinksList: ILink[] = [];

  workinglinksList: ILink[] = [];

  myNumberOfStreams: number;

  isDomain = false;

  idDomain: number;

  // get promise **********************

  loadItem = (index: number): Promise<void> => {
    return this.chooseUrlsForParsing(index);
  };

  // data initialization **************

  dataInitialization = (linksList: ILink[] | IDomain) => {
    if (Array.isArray(linksList)) {
      this.initiallinksList = [...linksList];
      this.workinglinksList = [...linksList];
      this.isDomain = false;
    } else {
      this.initiallinksList = [{ id: linksList.id, path: linksList.domain }];
      this.workinglinksList = [{ id: linksList.id, path: linksList.domain }];
      this.isDomain = true;
    }
  };

  // filling in the array of promis ***

  fillingArray = (numberOfStreams: number) => {
    this.myNumberOfStreams = !numberOfStreams ? 2 : numberOfStreams;

    for (let i = 0; i < this.myNumberOfStreams; i++) {
      this.listOfInquiry.push(this.loadItem(i));
    }
  };

  // parsing **************************

  parsing = async (
    linksList: ILink[] | IDomain,
    numberOfStreams: number,
    browser: Browser,
  ) => {
    try {
      this.myBrowser = browser;
      this.dataInitialization(linksList);

      this.fillingArray(numberOfStreams);

      let completedPromises = [];

      while (completedPromises.length !== this.listOfInquiry.length) {
        completedPromises = await Promise.all(this.listOfInquiry);
      }

      return this.arrayOFResults;
    } catch (error) {
      logger('ERROR', 'parallelParsing.parsing', error.message);
    }
  };

  // run search ***********************

  runSearch = async (link: ILink, page: Page) => {
    await page.goto(link.path, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });
    const getMetrics = await page.metrics();
    let repetitions = 0;
    const result = await searhLinks(page, link);
    logger('SUCCESS', 'parallelParsing.runSearch', `url ${link.path} has been verified`);

    for (const oneLink of result) {
      const checkPathByOriginArray = this.initiallinksList.findIndex((item) => item.path === oneLink.path);
      const checkPathByResultArray = this.arrayOFResults.findIndex((item) => item.path === oneLink.path);

      if (checkPathByOriginArray === -1 && checkPathByResultArray === -1) {
        this.arrayOFResults.push(oneLink);
      } else {
        repetitions++;
      }
    }
    return { getMetrics, repetitions, result };
  };

  // save link ************************

  saveLink = async (link: ILink, getMetrics: Metrics, repetitions: number, result: ILink[]) => {
    logger('INFO', 'parallelParsing.saveLink', `Result array generated, length: ${this.arrayOFResults.length}, ${repetitions} repetitions.`);
    const newItemLink = {
      ...link,
      idDomain: this.idDomain,
      taskDuration: getMetrics.TaskDuration,
      numberOfLinks: result.length - repetitions,
      isChecked: true,
    };

    if (!this.isDomain) {
      setLink(newItemLink);
    } else {
      await updateDomain(newItemLink.id);
      this.idDomain = newItemLink.id;
    }
  };

  // choose url for parsing ***********

  chooseUrlsForParsing = async (index: number) => {
    try {
      const page = await createPuppeteerEnv.createPage();
      while (this.workinglinksList.length) {
        const link = this.workinglinksList.pop();

        const { getMetrics, repetitions, result } = await this.runSearch(link, page);

        await this.saveLink(link, getMetrics, repetitions, result);

        if (index >= this.myNumberOfStreams) {
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

  changeNumberOfStreams = (numberOfStreams: number) => {
    if (numberOfStreams > this.myNumberOfStreams) {
      for (let i = this.myNumberOfStreams; i < numberOfStreams; i++) {
        this.listOfInquiry.push(this.loadItem(i));
      }
    }
    this.myNumberOfStreams = numberOfStreams;
  };
};

export default new ParallelParsing();
