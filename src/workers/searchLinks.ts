/* eslint-disable no-await-in-loop */
import type { Page } from 'puppeteer-core';
import showMessage from '../utils/showMessage';
import type { ILink } from '../types';

const searhLinks = async (page: Page, itemLink: ILink) => {
  try {
    const listOfLinks: Array<ILink> = [];
    const searchArea = await page.$('[id="app"]');
    if (!searchArea) {
      return [];
    }
    const linksList = await searchArea.$$('a');
    for (const linksRow of linksList) {
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
        if ((path.startsWith('http')) ||
          (path.startsWith('//')) ||
          (path.startsWith('#')) ||
          (path === '/')) {
          title = '';
        }
        return {
          title,
          path,
          isChecked: false,
        };
      });

      if (link) {
        const endPath = link.path.slice(link.path.length - 10);
        if (!Number(endPath) && link.title) {
          const checkByTitle = listOfLinks.findIndex((item) => item.title === link.title);
          const checkByPath = listOfLinks.findIndex((item) => item.path === link.path);

          const rootPath = `${itemLink.path.split('/')[0]}//${itemLink.path.split('/')[2]}`;

          if (checkByTitle === -1 && checkByPath === -1 && itemLink.path !== link.path) {
            listOfLinks.push({
              ...link,
              idRootPage: itemLink.id,
              path: `${rootPath}${link.path}`,
            });
          }
        }
      }
    }

    return listOfLinks;
  } catch (error) {
    showMessage('ERROR', 'searhLinks', error.message);
  }
};

export default searhLinks;
