/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import type { Browser } from 'puppeteer';

import logger from '../utils/logger';
import getLink from '../api/getLink';
import Parsing from './Parser';
import type { IDomain } from '../types';
import type { OptionsType } from '../subscriber/Subscriber';

class DomainParser {
  private domainsInOperation: IDomain[] = [];

  private parsing: Record<string, Parsing> = {};

  private browser: Record<string, Browser> = {};

  start = async (domainId: number) => {
    try {
      const isPulled = this.domainsInOperation.find((domainItem) => domainItem.id === domainId);
      if (isPulled) {
        logger('WARN', 'DomainParser.start', `PROCESS WITH DOMAIN ID: ${domainId} IS STARTED UP`);
        return;
      }
      const domain = await getLink(domainId);

      this.domainsInOperation.push(domain);

      this.parsing[domain.id] = new Parsing();

      const idDomain = await this.parsing[domain.id].jobHandler(domain);

      const domainsInOperationIndex = this.domainsInOperation
        .findIndex((domainItem: IDomain) => domainItem.id === idDomain);
      this.domainsInOperation.splice(domainsInOperationIndex, 1);
    } catch (err) {
      logger('ERROR', 'DomainParser.start', err.message);
    }
  };

  updateConfig = (options: OptionsType) => {
    this.parsing[options.domainId].updateConfig(options.numberOfStreams);
  };
}

export default DomainParser;
