import amqp from 'amqplib/callback_api';

import worker from './worker';
import showMessage from '../utils/showMessage';

const receiveMessage = (args: string[]) => {
  if (args.length === 0) {
    showMessage('WARN', 'subscriber.receive', 'Input required');
    process.exit(1);
  }

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
        showMessage('INFO', 'subscriber.receive', `Waiting for logs. To exit press CTRL+C, severity: '${args[0]}'`);

        args.forEach((severity) => {
          channel.bindQueue(q.queue, exchange, severity);
        });

        channel.consume(q.queue, (msg) => {
          showMessage('INFO', 'subscriber.receive', `${msg.fields.routingKey}: ${msg.content}`);

          if (msg.fields.routingKey === 'manage' && msg.content) {
            const arrayOfQueue = (msg.content).toString().split(' ');
            for (let i = 0; i < +arrayOfQueue[0]; i++) {
              const queue = arrayOfQueue[1];
              worker(queue, i);
            }
          }
        }, {
          noAck: true,
        });
      });
    });
  });
};

export default receiveMessage;
