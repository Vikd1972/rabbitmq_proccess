/* eslint-disable no-console */
import amqp from 'amqplib/callback_api';

const receiveMessage = (args: string[]) => {
  // const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: receive_logs_topic.js <facility>.<severity>');
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
      const exchange = 'topic_logs';

      channel.assertExchange(exchange, 'topic', {
        durable: false,
      });

      channel.assertQueue('', {
        exclusive: true,
      }, (error2, q) => {
        if (error2) {
          throw error2;
        }
        console.log(' [*] Waiting for logs. To exit press CTRL+C', args);

        args.forEach((key) => {
          channel.bindQueue(q.queue, exchange, key);
        });

        channel.consume(q.queue, (msg) => {
          console.log(" [x] args: %s; %s:'%s'", args, msg.fields.routingKey, msg.content.toString());
        }, {
          noAck: true,
        });
      });
    });
  });
};

export default receiveMessage;
