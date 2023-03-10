import type { DataType } from 'src/subscriber/subscriber';
import environmentInitialization from './environmentInitialization';
import parsing from './parallelParsing';
import showMessage from '../utils/showMessage';

let isPulled = false;
let linkId: number;
let numberOfStreams: number;

const jobHandler = async (data: DataType) => {
  // console.log(data);
  try {
    if ((linkId !== data.linkId) && isPulled) {
      showMessage('WARN', 'workers.jobHandler', 'PROCESS BUSY');
      return;
    }

    if ((linkId === data.linkId) &&
      (numberOfStreams === data.numberOfStreams) &&
      isPulled) {
      showMessage('WARN', 'workers.jobHandler', 'DATA HAS NOT CHANGED');
      return;
    }

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(data.numberOfStreams) && isPulled) {
      showMessage('WARN', 'workers.jobHandler', 'NUMBER OF STREAMS IS NaN');
      return;
    }

    if ((numberOfStreams !== data.numberOfStreams) && isPulled) {
      numberOfStreams = data.numberOfStreams;
      showMessage('WARN', 'workers.jobHandler', 'CHANGE NUMBER OF STREAMS');
      parsing.changeNumberOfStreams(numberOfStreams);
      return;
    }

    isPulled = true;
    linkId = data.linkId;
    numberOfStreams = data.numberOfStreams;

    const { result, browser } = await environmentInitialization(linkId, numberOfStreams);

    if (result) {
      await browser.close();
      showMessage('WARN', 'workers.jobHandler', `PROCESS FREE, FIND ${result.length} LINKS`);
      isPulled = false;
    }
  } catch (error) {
    showMessage('ERROR', 'workers.jobHandler', error.message);
  }
};

export default jobHandler;
