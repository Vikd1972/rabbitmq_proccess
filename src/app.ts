import receiveMessage from './subscriber/receiveMessage';
import showMessage from './utils/showMessage';

(async () => {
  try {
    receiveMessage();
  } catch (error) {
    showMessage('ERROR', 'server', error.message);
  }
})();
