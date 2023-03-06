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
  let result1Iteration: ILink[] = [];
  try {
    if (!isChangeNumberOfStreams) {
      result1Iteration = await parallelParsing(
        itemLink, numberOfStreams, browser, isChangeNumberOfStreams,
      );

      result1Iteration.length = 8;
    }

    const result2Iteration = await parallelParsing(
      result1Iteration, numberOfStreams, browser, isChangeNumberOfStreams,
    );
    return result2Iteration;
  } catch (error) {
    showMessage('ERROR', 'jobHandler.parsingLinks', error.message);
  }
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
    // console.log('jobHandler 53, itemLink', itemLink);

    const result = await parsingLinks(
      [itemLink], numberOfStreams, browser, isChangeNumberOfStreams,
    );
    // console.log('jobHandler 58, result.length', result.length);
    // console.log('jobHandler 59, result[0]', result[0]);
    return { result, browser };
  } catch (error) {
    showMessage('ERROR', 'jobHandler.jobHandler', error.message);
  }
};

export default jobHandler;
