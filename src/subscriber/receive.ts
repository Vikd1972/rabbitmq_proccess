import amqp from 'amqplib/callback_api';

import jobHandler from '../workers/jobHandler';
import showMessage from '../utils/showMessage';

const receiveMessage = () => {
  amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      const exchange = 'direct_logs';

      channel.assertExchange(exchange, 'direct', {
        durable: false,
      });

      channel.assertQueue('', {
        exclusive: true,
      }, (error2, q) => {
        if (error2) {
          throw error2;
        }
        showMessage('INFO', 'subscriber.receive', 'Waiting for logs. To exit press CTRL+C');

        channel.bindQueue(q.queue, exchange, 'manage');

        channel.consume(q.queue, (msg) => {
          const data = (msg.content).toString();

          showMessage('INFO', 'subscriber.receive', `Link id received: ${data}`);
          jobHandler(data);
        }, {
          noAck: true,
        });
      });
    });
  });
};

export default receiveMessage;
