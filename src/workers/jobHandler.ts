import type { Browser } from 'puppeteer-core';

import type { ILink } from '../types';
import getLink from '../api/getLinks';
import parsing from './parallelParsing';
import createBrowser from '../utils/createBrowser';
import showMessage from '../utils/showMessage';

let browser: Browser;

const parsingLinks = async (
  itemLink: ILink[],
  numberOfStreams: number,
  browser: Browser,
) => {
  try {
    const result1Iteration = await parsing.parallelParsing(
      itemLink, numberOfStreams, browser,
    );

    result1Iteration.length = 15;

    const result2Iteration = await parsing.parallelParsing(
      result1Iteration, numberOfStreams, browser,
    );
    return result2Iteration;
  } catch (error) {
    showMessage('ERROR', 'jobHandler.parsingLinks', error.message);
  }
};

const jobHandler = async (
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

    const result = await parsingLinks(
      [itemLink], numberOfStreams, browser,
    );
    return { result, browser };
  } catch (error) {
    showMessage('ERROR', 'jobHandler.jobHandler', error.message);
  }
};

export default jobHandler;
