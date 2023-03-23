/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/indent */
import amqp from 'amqplib';

import config from '../config';
import logger from '../utils/logger';

export enum PublishedQueueNamesENUM {
  domainsToParse = 'domainsToParse',
  parserSettingsUpdate = 'parserSettingsUpdate',
}

export type OptionsType = {
  domainId: number;
  numberOfStreams: number;
};

class Subscriber {
  private channel: amqp.Channel;

  // initialisation RabbitMQ **********

  init = async () => {
    const connection = await amqp.connect(config.rabbitHost);

    this.channel = await connection.createChannel();

    logger('SUCCESS', 'subscriber.init', 'Message broker initialized, subscriber is ready');
  };

  // receive from queue ***************

  private receiveFromQueue = async (queueName: PublishedQueueNamesENUM, callback: (payload: number | OptionsType) => void) => {
    let payload: number | OptionsType;
    await this.channel.assertQueue(queueName, {
      durable: false,
    });

    await this.channel.consume(queueName, (msg) => {
      const data = (msg.content).toString();
      payload = JSON.parse(data);
      logger('INFO', 'subscriber.receiveFromQueue', `Subscriber on queue "${queueName}" received data`);

      callback(payload);
    }, {
      noAck: true,
    });
  };

  // start domain parsing queue *******

  startDomainParsing = async (callback: (domainId: number) => void) => {
    await this.receiveFromQueue(PublishedQueueNamesENUM.domainsToParse, callback);
  };

  // start settings update queue ******

  startSettingsUpdate = async (callback: (options: OptionsType) => void) => {
    await this.receiveFromQueue(PublishedQueueNamesENUM.parserSettingsUpdate, callback);
  };
}

export default new Subscriber();
