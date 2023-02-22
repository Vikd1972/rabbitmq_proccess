/* eslint-disable no-console */
import receiveMessage from './subscriber/receive';

(async () => {
  try {
    receiveMessage(['30']);
    // receiveMessage(['kern.*']);
    // receiveMessage(['*.critical']);
    // receiveMessage(['kern.*', '*.critical']);
  } catch (error) {
    console.log(error);
  }
})();
