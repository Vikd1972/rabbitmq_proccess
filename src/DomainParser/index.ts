/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import type { Browser } from 'puppeteer';

import logger from '../utils/logger';
import getLink from '../api/getLink';
import createPuppeteerEnv from '../utils/createPuppeteerEnv';
import Parsing from './Parsing';
import type { IDomain } from '../types';
import type { OptionsType } from '../subscriber/Subscriber';

class DomainParser {
  private domainsInOperation: IDomain[] = [];

  private parsing: Record<string, Parsing> = {};

  private browser: Browser;

  constructor(
  ) {
    this.jobHandler = this.jobHandler.bind(this);
  }

  start = async (domainId: number) => {
    try {
      const isPulled = this.domainsInOperation.find((domainItem) => domainItem.id === domainId);
      if (isPulled) {
        logger('WARN', 'DomainParser.start', `PROCESS WITH DOMAIN ID: ${domainId} IS STARTED UP`);
        return;
      }
      const domain = await getLink(domainId);

      this.domainsInOperation.push(domain);

      this.jobHandler(domain);
    } catch (err) {
      logger('ERROR', 'DomainParser.start', err.message);
    }
  };

  private jobHandler = async (domain: IDomain) => {
    try {
      this.browser = await createPuppeteerEnv.createBrowser();

      this.parsing[domain.id] = new Parsing();

      this.parsing[domain.id].setBrowser(this.browser);

      const result1pass = await this.parsing[domain.id].parsing(domain);
      const result2pass = await this.parsing[domain.id].parsing(result1pass);

      if (result2pass) {
        logger('WARN', 'DomainParser.environmentInitialization', `PROCESS WITH ID ${domain.id} FREE, FIND ${result1pass.length} LINKS`);
        const domainsInOperationIndex = this.domainsInOperation
          .findIndex((domainItem: IDomain) => domainItem.id === domain.id);
        this.domainsInOperation.splice(domainsInOperationIndex, 1);
      }

      await this.browser.close();

      return;
    } catch (error) {
      logger('ERROR', 'DomainParser.environmentInitialization', error.message);
    }
  };

  updateConfig = (options: OptionsType) => {
    this.parsing[options.domainId].updateConfig(options.numberOfStreams);
  };
}

export default DomainParser;
