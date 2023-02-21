import sendMessge from './publisher/send';
import receiveMessage from './subscriber/receive';

(async () => {
  try {
    sendMessge();
    receiveMessage();
    receiveMessage();
  } catch (error) {
    console.log(error);
  }
})();
