import type { Browser } from 'puppeteer-core';

import type { ILink } from '../types';
import parsing from './parallelParsing';
import showMessage from '../utils/showMessage';

const startParsing = async (
  itemLink: ILink[],
  numberOfStreams: number,
  browser: Browser,
) => {
  try {
    // the number of iterations for testing is fixed
    const result = await parsing.parallelParsing(itemLink, numberOfStreams, browser);
    result.length = 5;
    const result2Iteration = await parsing.parallelParsing(
      result, numberOfStreams, browser,
    );
    return result2Iteration;
  } catch (error) {
    showMessage('ERROR', 'workers.startParsing', error.message);
  }
};

export default startParsing;
