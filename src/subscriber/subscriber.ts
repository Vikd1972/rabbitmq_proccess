/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-console */
import amqp from 'amqplib';

import jobHandler from '../workers/jobHandler';
import showMessage from '../utils/showMessage';
import config from '../config';

export type DataType = {
  severity: string;
  linkId: number;
  numberOfStreams?: number;
};

const Subscriber = class {
  queues = ['domain', 'config'];

  channel: Promise<amqp.Channel>;

  init = async () => {
    const connection = await amqp.connect(config.rabbitHost);
    this.channel = connection.createChannel();
    const result = (await this.channel).assertExchange(config.rabbitExchange, 'direct', {
      durable: false,
    });
    const pointExchange = Object.values(await result);

    showMessage('SUCCESS', 'subscriber.init', `Point of exchange "${pointExchange}" created`);

    for (const itemQueue of this.queues) {
      this.startReceiver(itemQueue);
    }
    return pointExchange;
  };

  startReceiver = async (itemQueue: string) => {
    const assertQueue = (await this.channel).assertQueue('', {
      exclusive: true,
    });

    showMessage('INFO', 'subscriber.startReceiver', `Subscriber on queue "${itemQueue}" waiting for logs. To exit press CTRL+C`);
    (await this.channel).bindQueue((await assertQueue).queue, config.rabbitExchange, itemQueue);
    (await this.channel).consume((await assertQueue).queue, (msg) => {
      const data = (msg.content).toString();
      const currentData = JSON.parse(data) as DataType;
      showMessage('INFO', 'subscriber.startReceiver', `Subscriber on queue "${itemQueue}" received.`);
      switch (currentData.severity) {
        case 'domain':
          jobHandler(currentData);
          break;
        case 'config':
          // console.log('config');
          break;
        default:
          showMessage('WARN', 'subscriber.startReceiver', `Subscriber on queue "${itemQueue}" not exists`);
      }
    }, {
      noAck: true,
    });
  };
};

export default new Subscriber();
