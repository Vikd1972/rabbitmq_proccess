/* eslint-disable no-await-in-loop */
import type { Page } from 'puppeteer';

import type { ILink } from '../types';
import logger from '../utils/logger';
import clearingLink from './clearingLink';

const getPageLinks = async (page: Page, itemLink: ILink) => {
  try {
    const result: Array<ILink> = [];
    const linksList = await page.$$('a');
    if (!linksList) {
      return [];
    }
    for (const linksRow of linksList) {
      const link = await clearingLink(linksRow);

      if (link) {
        const endPath = link.path.slice(link.path.length - 10);
        if (!Number(endPath) && link.title) {
          const checkByTitle = result.findIndex((item) => item.title === link.title);
          const checkByPath = result.findIndex((item) => item.path === link.path);

          const rootPath = `${itemLink.path.split('/')[0]}//${itemLink.path.split('/')[2]}`;

          if (checkByTitle === -1 && checkByPath === -1 && itemLink.path !== link.path) {
            // eslint-disable-next-line max-len
            const currentPath = link.path.startsWith('http') ? `${link.path}` : `${rootPath}${link.path}`;
            result.push({
              ...link,
              idDomain: itemLink.id,
              path: currentPath,
            });
          }
        }
      }
    }
    return result;
  } catch (error) {
    logger('ERROR', 'searhLinks', error.message);
    return [];
  }
};

export default getPageLinks;
