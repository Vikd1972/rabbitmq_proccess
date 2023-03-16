import type { Browser } from 'puppeteer-core';

import type { IDomain } from '../types';
import parallelParsing from './parallelParsing';
import logger from '../utils/logger';

const startParsing = async (
  domain: IDomain,
  numberOfStreams: number,
  browser: Browser,
) => {
  try {
    // the number of iterations for testing is fixed
    const result = await parallelParsing.parsing(domain, numberOfStreams, browser);
    result.length = 15;
    const result2Iteration = await parallelParsing.parsing(
      result, numberOfStreams, browser,
    );
    return result2Iteration;
  } catch (error) {
    logger('ERROR', 'workers.startParsing', error.message);
  }
};

export default startParsing;
