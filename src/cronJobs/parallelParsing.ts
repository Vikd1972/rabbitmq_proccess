/* eslint-disable no-async-promise-executor */
/* eslint-disable no-await-in-loop */
import type { Browser } from 'puppeteer-core';

import createBrowser from '../utils/createBrowser';
import createPage from '../utils/createPage';
import config from '../config';
import showMessage from '../utils/showMessage';

const arrayOfLinks1 = [
  'https://avito.ru/business',
  'https://avito.ru/taganrog/transport',
  'https://avito.ru/taganrog/rabota',
  'https://avito.ru/taganrog/lichnye_veschi',
  'https://avito.ru/taganrog/hobbi_i_otdyh',
  'https://avito.ru/taganrog/zhivotnye',
  'https://avito.ru/taganrog/dlya_biznesa',
  'https://avito.ru/taganrog/bytovaya_elektronika',
  'https://avito.ru/taganrog/dlya_doma_i_dachi',
  'https://avito.ru/taganrog/nedvizhimost',
];
const arrayOfLinks = [...arrayOfLinks1];

const searchUrls = async (browser: Browser) => {
  const page = await createPage(browser);

  while (arrayOfLinks.length) {
    const link = arrayOfLinks.pop();

    await page.goto(link, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });
    showMessage('SUCCESS', 'parallelParsing', `url ${link} has been verified`);
  }
  await page.close();
};

const streamsHandker = async () => {
  const browser = await createBrowser(
    [
      '--use-gl=egl',
    ],
  );

  const loadItem = (): Promise<void> => {
    return searchUrls(browser);
  };

  const listOfInquiry = new Array(config.numberOfStreams);

  for (let i = 0; i < listOfInquiry.length; i++) {
    listOfInquiry[i] = loadItem();
  }
  await Promise.all(listOfInquiry);

  await browser.close();
};

export default {
  cronTime: '0 */20 * * * *',
  onTick: streamsHandker,
  // onTick: (() => console.log('streamsHandker')),
  onComplete: undefined,
  startNow: false,
  timeZone: undefined,
  context: undefined,
  runOnInit: true,
  utcOffset: undefined,
  unrefTimeout: undefined,
};
