import subscriber from './subscriber/subscriber';
import logger from './utils/logger';

(async () => {
  try {
    await subscriber.init();
  } catch (error) {
    logger('ERROR', 'server', error.message);
    process.exit(1);
  }
})();
