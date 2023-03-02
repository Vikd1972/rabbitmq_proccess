import type { Browser } from 'puppeteer-core';

import type { ILink } from '../types';
import getLink from '../api/getLinks';
import parallelParsing from './parallelParsing';
import createBrowser from '../utils/createBrowser';
import showMessage from '../utils/showMessage';

const parsingLinks = async (itemLink: ILink[], numberOfStreams: number, browser: Browser) => {
  try {
    const arrayOFResults = await parallelParsing(itemLink, numberOfStreams, browser);

    await parallelParsing(arrayOFResults, numberOfStreams, browser);
  } catch (error) {
    showMessage('ERROR', 'jobHandler', error.message);
  } finally {
    await browser.close();
  }
};

const jobHandler = async (data: string) => {
  const browser = await createBrowser(
    [
      '--use-gl=egl',
      '--shm-size=1gb',
      '--enable-blink-features=HTMLImports',
    ],
  );

  const linkId = Number(data.split(' ')[0]);
  const numberOfStreams = Number(data.split(' ')[1]);

  const itemLink = await getLink(linkId);

  parsingLinks([itemLink], numberOfStreams, browser);
};

export default jobHandler;
