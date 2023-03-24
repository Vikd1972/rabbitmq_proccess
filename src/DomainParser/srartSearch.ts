/* eslint-disable max-len */
import type { Page } from 'puppeteer';

import logger from '../utils/logger';
import type { IDomain, ILink } from '../types';
import getPageLinks from './getPageLinks';

const startSearch = async (link: ILink, page: Page, initialArray: ILink[], resultArray: ILink[], domain: IDomain) => {
  await page.goto(link.path, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });
  const resultsArray = [];

  const getMetrics = await page.metrics();

  const result = await getPageLinks(page, link);

  for (const oneLink of result) {
    const checkPathByOriginArray = initialArray.findIndex((item) => item.path === oneLink.path);
    const checkPathByResultArray = resultArray.findIndex((item) => item.path === oneLink.path);
    const checkByDomain = oneLink.path.startsWith(domain.domain);
    if (checkPathByOriginArray === -1 && checkPathByResultArray === -1 && checkByDomain) {
      resultsArray.push(oneLink);
    }
  }

  logger('SUCCESS', 'parallelParsing.runSearch', `url ${link.path} has been verified`);
  return { getMetrics, resultsArray };
};

export default startSearch;
