/* eslint-disable no-console */
import type { Browser } from 'puppeteer-core';

import getLink from '../api/getLink';
import startParsing from './startParsing';
import createBrowser from '../utils/createBrowser';
import showMessage from '../utils/showMessage';

const environmentInitialization = async (
  linkId: number,
  numberOfStreams: number,
) => {
  let browser: Browser;
  try {
    browser = await createBrowser(
      [
        '--use-gl=egl',
        '--shm-size=1gb',
        '--enable-blink-features=HTMLImports',
      ],
    );
    const domain = await getLink(linkId);
    const result = await startParsing(
      domain, numberOfStreams, browser,
    );
    console.log('28', result);
    return { result, browser };
  } catch (error) {
    showMessage('ERROR', 'workers.environmentInitialization', error.message);
  }
};

export default environmentInitialization;
