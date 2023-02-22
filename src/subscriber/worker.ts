import amqp from 'amqplib/callback_api';

import showMessage from '../utils/showMessage';

const worker = (queue: string, i: number) => {
  amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      channel.assertQueue(queue, {
        durable: true,
      });
      channel.prefetch(1);

      showMessage('INFO', 'subscriber.worker', `Waiting for messages in ${queue}${i}. To exit press CTRL+C`);
      channel.consume(queue, (msg) => {
        // const secs = msg.content.toString().split('.').length - 1;

        showMessage('INFO', 'subscriber.worker', `Received in ${queue}${i}: ${msg.content.toString()}`);

        setTimeout(() => {
          showMessage('SUCCESS', 'subscriber.worker', `Done ${i}`);
          channel.ack(msg);
        }, Math.round(Math.random() * 15) * 1000);
      }, {
        noAck: false,
      });
    });
  });
};

export default worker;
