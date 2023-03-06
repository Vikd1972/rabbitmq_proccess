import environmentInitialization from './environmentInitialization';
import parsing from './parallelParsing';
import showMessage from '../utils/showMessage';

let isPulled = false;
let linkId: number;
let numberOfStreams: number;

const jobHandler = async (data: string) => {
  try {
    if ((linkId !== Number(data.split(' ')[0])) && isPulled) {
      showMessage('WARN', 'workers.jobHandler', 'PROCESS BUSY');
      return;
    }

    if ((linkId === Number(data.split(' ')[0])) &&
      (numberOfStreams === Number(data.split(' ')[1])) &&
      isPulled) {
      showMessage('WARN', 'workers.jobHandler', 'DATA HAS NOT CHANGED');
      return;
    }

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(Number(data.split(' ')[1])) && isPulled) {
      showMessage('WARN', 'workers.jobHandler', 'NUMBER OF STREAMS IS NaN');
      return;
    }

    if ((numberOfStreams !== Number(data.split(' ')[1])) && isPulled) {
      numberOfStreams = Number(data.split(' ')[1]);
      showMessage('WARN', 'workers.jobHandler', 'CHANGE NUMBER OF STREAMS');
      parsing.changeNumberOfStreams(numberOfStreams);
      return;
    }

    isPulled = true;
    linkId = Number(data.split(' ')[0]);
    numberOfStreams = Number(data.split(' ')[1]);

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
