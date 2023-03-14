import type { Browser } from 'puppeteer-core';

import type { IDomain } from '../types';
import parsing from './parallelParsing';
import showMessage from '../utils/showMessage';

const startParsing = async (
  domain: IDomain,
  numberOfStreams: number,
  browser: Browser,
) => {
  try {
    // the number of iterations for testing is fixed
    const result = await parsing.parallelParsing(domain.domain, numberOfStreams, browser);
    // result.length = 15;
    // const result2Iteration = await parsing.parallelParsing(
    //   result, numberOfStreams, browser,
    // );
    return result;
  } catch (error) {
    showMessage('ERROR', 'workers.startParsing', error.message);
  }
};

export default startParsing;
