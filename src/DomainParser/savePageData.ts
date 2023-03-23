/* eslint-disable max-len */
import type { Metrics } from 'puppeteer';

import logger from '../utils/logger';
import type { IDomain, ILink } from '../types';
import setLink from '../api/setLink';
import updateDomain from '../api/updateDomain';

const savePageData = async (link: ILink, getMetrics: Metrics, resultArray: ILink[], domain: IDomain, isDomain: boolean) => {
  logger('INFO', 'parallelParsing.saveLink', `Result array generated, length: ${resultArray.length}`);
  const newItemLink = {
    ...link,
    idDomain: domain.id,
    taskDuration: getMetrics.TaskDuration,
    numberOfLinks: resultArray.length,
    isChecked: true,
  };

  if (!isDomain) {
    await setLink(newItemLink);
  } else {
    await updateDomain(newItemLink.id);
  }
};

export default savePageData;
