import type { ElementHandle } from 'puppeteer';

const clearingLink = async (linksRow: ElementHandle<HTMLAnchorElement>) => {
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
      if (
        path.startsWith('https://avito') ||
        path.startsWith('//') ||
        path.startsWith('#') ||
        path === '/'
      ) {
        title = '';
      }
      return {
        title: title.trim(),
        path,
      };
    });
    return link;
  } catch (err) {
    console.error(err.message);
  }
};

export default clearingLink;
