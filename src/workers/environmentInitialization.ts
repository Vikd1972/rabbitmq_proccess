import type { Browser } from 'puppeteer-core';

import getLink from '../api/getLinks';
import startParsing from './startParsing';
import createBrowser from '../utils/createBrowser';
import showMessage from '../utils/showMessage';

let browser: Browser;

const environmentInitialization = async (
  linkId: number,
  numberOfStreams: number,
) => {
  try {
    browser = await createBrowser(
      [
        '--use-gl=egl',
        '--shm-size=1gb',
        '--enable-blink-features=HTMLImports',
      ],
    );
    const itemLink = await getLink(linkId);

    const result = await startParsing(
      [itemLink], numberOfStreams, browser,
    );
    return { result, browser };
  } catch (error) {
    showMessage('ERROR', 'workers.environmentInitialization', error.message);
  }
};

export default environmentInitialization;
