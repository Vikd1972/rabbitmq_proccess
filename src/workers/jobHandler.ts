import type { Browser } from 'puppeteer-core';

import type { ILink } from '../types';
import getLink from '../api/getLinks';
import parallelParsing from './parallelParsing';
import createBrowser from '../utils/createBrowser';
import showMessage from '../utils/showMessage';

let browser: Browser;

const parsingLinks = async (
  itemLink: ILink[],
  numberOfStreams: number,
  browser: Browser,
  isChangeNumberOfStreams: boolean,
) => {
  let result: ILink[];
  try {
    const arrayOFResults = await parallelParsing(
      itemLink, numberOfStreams, browser, isChangeNumberOfStreams,
    );

    arrayOFResults.length = 3;

    result = await parallelParsing(
      arrayOFResults, numberOfStreams, browser, isChangeNumberOfStreams,
    );
  } catch (error) {
    showMessage('ERROR', 'jobHandler.parsingLinks', error.message);
  }
  return result;
};

const jobHandler = async (
  linkId: number,
  numberOfStreams: number,
  isChangeNumberOfStreams: boolean,
) => {
  try {
    if (!isChangeNumberOfStreams) {
      browser = await createBrowser(
        [
          '--use-gl=egl',
          '--shm-size=1gb',
          '--enable-blink-features=HTMLImports',
        ],
      );
    }

    const itemLink = await getLink(linkId);

    const result = await parsingLinks(
      [itemLink], numberOfStreams, browser, isChangeNumberOfStreams,
    );
    return { result, browser };
  } catch (error) {
    showMessage('ERROR', 'jobHandler.jobHandler', error.message);
  }
};

export default jobHandler;
