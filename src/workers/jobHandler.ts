/* eslint-disable no-restricted-globals */
import type { Browser } from 'puppeteer-core';

import getLink from '../api/getLink';
import type { DataType } from '../subscriber/subscriber';
import startParsing from './startParsing';
import parallelParsing from './parallelParsing';
import createPuppeteerEnv from '../utils/createPuppeteerEnv';
import logger from '../utils/logger';

const JobHandler = class {
  configData: DataType[] = [];

  // start job ************************

  startJob = async (data: DataType) => {
    try {
      const isPossible = this.validationData(data);
      if (!isPossible) {
        return;
      }
      this.configData.push(data);
      const configIndex = this.searchConfigIdex(data);
      const { result, browser } = await this.environmentInitialization(configIndex);

      if (result) {
        logger('WARN', 'workers.jobHandler.startJob', `PROCESS FREE, FIND ${result.length} LINKS`);
        this.configData.splice(configIndex, 1);
      }
      await browser.close();
    } catch (error) {
      logger('ERROR', 'workers.jobHandler.startJob', error.message);
    }
  };

  // search config index **************

  searchConfigIdex = (data: DataType) => {
    return this.configData.findIndex((item: DataType) => item.linkId === data.linkId);
  };

  // validation data ******************

  validationData = (data: DataType) => {
    const configIndex = this.searchConfigIdex(data);
    if (data.severity === 'domain' && configIndex === -1) {
      logger('INFO', 'workers.jobHandler.validationData', `PROCESS WITH DOMAIN ID: ${data.linkId} IS STARTED UP`);
      return true;
    }
    if (data.severity === 'domain' && configIndex !== -1) {
      logger('WARN', 'workers.jobHandler.validationData', 'PROCESS IS ALREADY RUNNING');
      return false;
    }
    if (configIndex !== -1) {
      if (data.severity === 'config' && (isNaN(data.numberOfStreams) || data.numberOfStreams === 0)) {
        logger('WARN', 'workers.jobHandler.validationData', 'NUMBER OF STREAMS IS NaN OR IS EQUAL TO ZERO');
        return;
      }
      if (data.severity === 'config' && this.configData[configIndex].numberOfStreams === data.numberOfStreams) {
        logger('WARN', 'workers.jobHandler.validationData', 'VAVIDATION ERROR, NUMBER OF STREAMS HAS NOT CHANGED');
        return false;
      }
      if (data.severity === 'config' && this.configData[configIndex].numberOfStreams !== data.numberOfStreams) {
        this.configData[configIndex].numberOfStreams = data.numberOfStreams;
        logger('WARN', 'workers.jobHandler.validationData', `CHANGE NUMBER OF STREAMS, NEW NUMBER: ${data.numberOfStreams}`);
        parallelParsing.changeNumberOfStreams(data.numberOfStreams);
        return true;
      }
    }
  };

  // initialization environment *******

  environmentInitialization = async (configIndex: number) => {
    let browser: Browser;
    try {
      browser = await createPuppeteerEnv.createBrowser(
        [
          '--use-gl=egl',
          '--shm-size=1gb',
          '--enable-blink-features=HTMLImports',
        ],
      );
      const domain = await getLink(this.configData[configIndex].linkId);
      const result = await startParsing(
        domain, this.configData[configIndex].numberOfStreams, browser,
      );

      return { result, browser };
    } catch (error) {
      logger('ERROR', 'workers.environmentInitialization', error.message);
    }
  };
};

export default new JobHandler();
