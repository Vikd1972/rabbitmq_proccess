/* eslint-disable class-methods-use-this */
// import type { Browser } from 'puppeteer';

// import type { IDomain } from '../types';
// import ParallelParsing from './parallelParsing';
// import logger from '../utils/logger';

// // const PAGES_TO_PARSE_LIMIT = 15;

// const startParsing = async (domain: IDomain, browser: Browser) => {
//   try {
//     // the number of iterations for testing is fixed
//     const parallelParsing = new ParallelParsing();
//     const result = await parallelParsing.parsing(domain, browser);
//     // result.length = PAGES_TO_PARSE_LIMIT;
//     // const result2Iteration = await parallelParsing.parsing(result, browser);
//     const currentDomainId = domain.id;
//     return { result, currentDomainId };
//   } catch (error) {
//     logger('ERROR', 'workers.startParsing', error.message);
//   }
// };

// export default startParsing;
