/* eslint-disable no-console */
import receiveMessage from './subscriber/receive';

(async () => {
  try {
    receiveMessage(['#']);
    receiveMessage(['kern.*']);
    receiveMessage(['*.critical']);
    receiveMessage(['kern.*', '*.critical']);
  } catch (error) {
    console.log(error);
  }
})();
