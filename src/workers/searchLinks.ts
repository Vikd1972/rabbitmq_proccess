/* eslint-disable no-await-in-loop */
import type { Page, ElementHandle } from 'puppeteer';

import type { ILink } from '../types';
import logger from '../utils/logger';

const getLink = async (linksRow: ElementHandle<HTMLAnchorElement>) => {
  try {
    const link = await linksRow.evaluate((el) => {
      let title = el.textContent
        .replace('\n', ' ')
        .replace('- ', '') as string;

      const pathString = (el.outerHTML as string);

      if (!pathString.includes('href=')) {
        return;
      }

      const path = pathString
        .split(' ')
        .find((item) => item.startsWith('href='))
        .slice(6, pathString.length - 1)
        .split('"')[0]
        .split('?')[0]
        .split('-')[0];
      if ((path.startsWith('https://avito')) ||
        (path.startsWith('//')) ||
        (path.startsWith('#')) ||
        (path === '/')) {
        title = '';
      }
      return {
        title: title.trim(),
        path,
      };
    });
    return link;
  } catch (error) {
    console.error('40', error.message);
  }
};

const searhLinks = async (page: Page, itemLink: ILink) => {
  try {
    const result: Array<ILink> = [];
    const linksList = await page.$$('a');
    if (!linksList) {
      return [];
    }
    for (const linksRow of linksList) {
      const link = await getLink(linksRow);

      if (link) {
        const endPath = link.path.slice(link.path.length - 10);
        if (!Number(endPath) && link.title) {
          const checkByTitle = result.findIndex((item) => item.title === link.title);
          const checkByPath = result.findIndex((item) => item.path === link.path);

          const rootPath = `${itemLink.path.split('/')[0]}//${itemLink.path.split('/')[2]}`;

          if (checkByTitle === -1 && checkByPath === -1 && itemLink.path !== link.path) {
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

export default searhLinks;
