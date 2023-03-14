import subscriber from './subscriber/subscriber';
import showMessage from './utils/showMessage';

(async () => {
  try {
    await subscriber.init();
  } catch (error) {
    showMessage('ERROR', 'server', error.message);
    process.exit(1);
  }
})();
