import dotenv from 'dotenv';
import path from 'path';

const localEnv = dotenv.config({ path: path.normalize(`${__dirname}/../.env`) }).parsed;
const defaultEnv = dotenv.config({ path: path.normalize(`${__dirname}../default.env`) }).parsed;

const joinedEnv = {
  ...defaultEnv,
  ...localEnv,
};

const config = {
  numberOfStreams: +joinedEnv.NUMBER_OF_STREAMS,
  rabbitExchange: joinedEnv.RABBIT_EXCHANGE,
  rabbitHost: joinedEnv.RABBIT_HOST,
  baseUrl: joinedEnv.BASE_URL,
};

export default config;
