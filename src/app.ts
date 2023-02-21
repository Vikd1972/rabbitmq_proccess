import sendMessge from './publisher/send';
import receiveMessage from './subscriber/receive';

(async () => {
  try {
    sendMessge();
    receiveMessage();
  } catch (error) {
    console.log(error);
  }
})();
