/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable no-restricted-globals */
import type { Browser } from 'puppeteer';

import getLink from '../api/getLink';
import type { DataType } from '../subscriber/subscriber';
import StartParsing from './startParsing';
import parallelParsing from './parallelParsing';
import createPuppeteerEnv from '../utils/createPuppeteerEnv';
import logger from '../utils/logger';

const JobHandler = class {
  configData: DataType[] = [];

  listOfBrowsers: Promise<void>[] = [];

  // get promise **********************

  loadBrowser = (data: DataType): Promise<void> => {
    return this.environmentInitialization(data);
  };

  // start job ************************

  startJob = async (data: DataType) => {
    try {
      const isPossible = this.validationData(data);
      if (!isPossible) {
        return;
      }
      this.configData.push(data);

      // const configDataItem = this.searchConfig(data);

      this.listOfBrowsers.push(this.loadBrowser(data));

      let completedPromises = [];

      while (completedPromises.length !== this.listOfBrowsers.length) {
        completedPromises = await Promise.all(this.listOfBrowsers);
      }

      // const { result, browser } = await this.environmentInitialization(configDataItem);
    } catch (error) {
      logger('ERROR', 'workers.jobHandler.startJob', error.message);
    }
  };

  // search config index **************

  searchConfig = (data: DataType) => {
    return this.configData.find((item: DataType) => item.linkId === data.linkId);
  };

  // validation data ******************

  validationData = (data: DataType) => {
    const configDataItem = this.searchConfig(data);
    if (data.severity === 'domain' && !configDataItem) {
      logger('INFO', 'workers.jobHandler.validationData', `PROCESS WITH DOMAIN ID: ${data.linkId} IS STARTED UP`);
      return true;
    }
    if (data.severity === 'domain' && configDataItem) {
      logger('WARN', 'workers.jobHandler.validationData', 'PROCESS IS ALREADY RUNNING');
      return false;
    }
    if (configDataItem) {
      if (data.severity === 'config' && (isNaN(data.numberOfStreams) || data.numberOfStreams === 0)) {
        logger('WARN', 'workers.jobHandler.validationData', 'NUMBER OF STREAMS IS NaN OR IS EQUAL TO ZERO');
        return;
      }
      if (data.severity === 'config' && configDataItem.numberOfStreams === data.numberOfStreams) {
        logger('WARN', 'workers.jobHandler.validationData', 'VAVIDATION ERROR, NUMBER OF STREAMS HAS NOT CHANGED');
        return false;
      }
      if (data.severity === 'config' && configDataItem.numberOfStreams !== data.numberOfStreams) {
        configDataItem.numberOfStreams = data.numberOfStreams;
        logger('WARN', 'workers.jobHandler.validationData', `CHANGE NUMBER OF STREAMS, NEW NUMBER: ${data.numberOfStreams}`);
        const idProcess = configDataItem.linkId;
        parallelParsing.changeNumberOfStreams(data.numberOfStreams, idProcess);
        return true;
      }
    }
  };

  // initialization environment *******

  // eslint-disable-next-line class-methods-use-this
  environmentInitialization = async (configDataItem: DataType) => {
    let browser: Browser;
    try {
      browser = await createPuppeteerEnv.createBrowser(
        [
          '--use-gl=egl',
          '--shm-size=1gb',
          '--enable-blink-features=HTMLImports',
        ],
      );
      const domain = await getLink(configDataItem.linkId);
      const newParsing = new StartParsing();
      const result = await newParsing.start(
        domain, configDataItem.numberOfStreams, browser,
      );

      if (result) {
        logger('WARN', 'workers.jobHandler.startJob', `PROCESS WITH ID ${configDataItem.linkId} FREE, FIND ${result.length} LINKS`);
        const configIndex = this.configData.findIndex((item: DataType) => item.linkId === configDataItem.linkId);
        this.configData.splice(configIndex, 1);
      }
      await browser.close();

      return;
    } catch (error) {
      logger('ERROR', 'workers.environmentInitialization', error.message);
    }
  };
};

export default new JobHandler();
