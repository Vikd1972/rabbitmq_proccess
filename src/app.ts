import type { OptionsType } from './subscriber/Subscriber';
import subscriber from './subscriber/Subscriber';
import logger from './utils/logger';
import DomainParser from './DomainParser';

const domainParser = new DomainParser();

(async () => {
  try {
    await subscriber.init();

    subscriber.startDomainParsing((domainId: number) => {
      domainParser.start(domainId);
    });

    subscriber.startSettingsUpdate((payload: OptionsType) => {
      domainParser.updateConfig(payload);
    });
  } catch (error) {
    logger('ERROR', 'server', error.message);
    process.exit(1);
  }
})();
