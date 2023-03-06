import amqp from 'amqplib/callback_api';

import jobHandler from '../workers/jobHandler';
import parsing from '../workers/parallelParsing';
import showMessage from '../utils/showMessage';

let isPulled = false;
let linkId: number;
let numberOfStreams: number;

const startParsing = async (data: string) => {
  try {
    if ((linkId !== Number(data.split(' ')[0])) && isPulled) {
      showMessage('WARN', 'subscriber.receive.startParsing', 'PROCESS BUSY');
      return;
    }

    if ((linkId === Number(data.split(' ')[0])) &&
      (numberOfStreams === Number(data.split(' ')[1])) &&
      isPulled) {
      showMessage('WARN', 'subscriber.receive.startParsing', 'DATA HAS NOT CHANGED');
      return;
    }

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(Number(data.split(' ')[1])) && isPulled) {
      showMessage('WARN', 'subscriber.receive.startParsing', 'NUMBER OF STREAMS IS NaN');
      return;
    }

    if ((numberOfStreams !== Number(data.split(' ')[1])) && isPulled) {
      numberOfStreams = Number(data.split(' ')[1]);
      showMessage('WARN', 'subscriber.receive.startParsing', 'CHANGE NUMBER OF STREAMS');
      parsing.changeNumberOfStreams(numberOfStreams);
      return;
    }

    linkId = Number(data.split(' ')[0]);
    numberOfStreams = Number(data.split(' ')[1]);
    isPulled = true;
    const { result, browser } = await jobHandler(linkId, numberOfStreams);
    if (result) {
      isPulled = false;
      await browser.close();
      showMessage('WARN', 'subscriber.receive', `PROCESS FREE, FIND ${result.length} LINKS`);
    }
  } catch (error) {
    showMessage('ERROR', 'subscriber.receive.startParsing', error.message);
  }
};

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
        showMessage('INFO', 'subscriber.receive.receiveMessage', 'Waiting for logs. To exit press CTRL+C');

        channel.bindQueue(q.queue, exchange, 'manage');

        channel.consume(q.queue, (msg) => {
          const data = (msg.content).toString();

          showMessage('INFO', 'subscriber.receive.receiveMessage', `Link id received: ${data}`);
          startParsing(data);
        }, {
          noAck: true,
        });
      });
    });
  });
};

export default receiveMessage;
