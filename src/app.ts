/* eslint-disable no-console */
import receiveMessage from './subscriber/receive';

(async () => {
  try {
    receiveMessage(['info']);
    receiveMessage(['error']);
    receiveMessage(['warning']);
    receiveMessage(['info', 'error', 'warning']);
  } catch (error) {
    console.log(error);
  }
})();
