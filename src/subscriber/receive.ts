/* eslint-disable no-console */
import amqp from 'amqplib/callback_api';

const receiveMessage = () => {
  amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      const queue = 'task_queue';

      channel.assertQueue(queue, {
        durable: true,
      });
      channel.prefetch(1);
      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
      channel.consume(queue, (msg) => {
        const secs = msg.content.toString().split('.').length - 1;

        console.log(' [x] Received %s', msg.content.toString());
        setTimeout(() => {
          console.log(' [x] Done');
          channel.ack(msg);
        }, secs * 1000);
      }, {
        noAck: false,
      });
    });
  });
};

export default receiveMessage;
