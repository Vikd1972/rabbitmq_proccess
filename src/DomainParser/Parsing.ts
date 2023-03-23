/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import type { Browser, Page } from 'puppeteer';

import logger from '../utils/logger';
import createPuppeteerEnv from '../utils/createPuppeteerEnv';
import savePageData from './savePageData';
import startSearch from './srartSearch';
import scalablePromiseAll from '../utils/scalablePromiseAll';
import type { IDomain, ILink } from '../types';

class Parsing {
  private arrayOFResults: ILink[] = [];

  private initiallinksList: ILink[] = [];

  private workinglinksList: ILink[];

  private listOfInquiry: Promise<void>[] = [];

  private browser: Browser;

  private isDomain = false;

  private domain: IDomain;

  private numberOfStreams = 2;

  constructor(
  ) {
    this.parsing = this.parsing.bind(this);
    this.loadItem = this.loadItem.bind(this);
    this.runSearch = this.runSearch.bind(this);
    this.fillingArray = this.fillingArray.bind(this);
    this.dataInitialization = this.dataInitialization.bind(this);
    this.chooseUrlsForParsing = this.chooseUrlsForParsing.bind(this);
  }

  setBrowser = (browser: Browser) => {
    this.browser = browser;
  };

  parsing = async (
    linksList: ILink[] | IDomain,
  ) => {
    try {
      if (!Array.isArray(linksList)) {
        this.domain = linksList;
      }

      this.dataInitialization(linksList);
      this.fillingArray(0, this.numberOfStreams);

      await scalablePromiseAll(this.listOfInquiry);

      return this.arrayOFResults;
    } catch (error) {
      logger('ERROR', 'Parsing.parsing', error.message);
    }
  };

  private dataInitialization = (linksList: ILink[] | IDomain) => {
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

  private fillingArray = (firstValue: number, lastValue: number) => {
    const arrayOfProcess = [];
    for (let i = firstValue; i < lastValue; i++) {
      arrayOfProcess[i] = this.loadItem(i);
    }
    this.listOfInquiry = arrayOfProcess;
  };

  private loadItem = (index: number): Promise<void> => {
    return this.chooseUrlsForParsing(index);
  };

  private chooseUrlsForParsing = async (index: number) => {
    try {
      const page = await createPuppeteerEnv.createPage(this.browser);
      while (this.workinglinksList.length) {
        const link = this.workinglinksList.pop();
        const getMetrics = await this.runSearch(link, page);
        const resultArray = this.arrayOFResults;
        await savePageData(link, getMetrics, resultArray, this.domain, this.isDomain);

        if (index >= this.numberOfStreams) {
          break;
        }
      }

      await page.close();
      return;
    } catch (error) {
      logger('ERROR', 'Parsing.chooseUrlsForParsing', error.message);
    }
  };

  private runSearch = async (link: ILink, page: Page) => {
    const initialArray = this.initiallinksList;
    const resultArray = this.arrayOFResults;
    const domain = this.domain;
    const { getMetrics, resultsArray } = await startSearch(link, page, initialArray, resultArray, domain);
    this.arrayOFResults = resultsArray;
    return getMetrics;
  };

  updateConfig = (numberOfStreams: number) => {
    if (!numberOfStreams) {
      logger('WARN', 'Parsing.updateConfig', `VAVIDATION ERROR, NUMBER OF STREAMS FOR ID ${this.domain.id} IS NOT SPECIFIED CORRECTLY`);
      return;
    } if (this.numberOfStreams === numberOfStreams) {
      logger('WARN', 'Parsing.updateConfig', `VAVIDATION ERROR, NUMBER OF STREAMS FOR ID ${this.domain.id} HAS NOT CHANGED`);
      return;
    }
    if (this.numberOfStreams < numberOfStreams) {
      this.fillingArray(this.numberOfStreams, numberOfStreams);
    }
    this.numberOfStreams = numberOfStreams;
  };
}

export default Parsing;
