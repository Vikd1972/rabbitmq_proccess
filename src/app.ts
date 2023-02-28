import receiveMessage from './subscriber/receive';
import showMessage from './utils/showMessage';

(async () => {
  try {
    receiveMessage();
  } catch (error) {
    showMessage('ERROR', 'server', error.message);
  }
})();
