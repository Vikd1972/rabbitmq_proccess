import dotenv from 'dotenv';
import path from 'path';

const localEnv = dotenv.config({ path: path.normalize(`${__dirname}/../.env`) }).parsed;
const defaultEnv = dotenv.config({ path: path.normalize(`${__dirname}../default.env`) }).parsed;

const joinedEnv = {
  ...defaultEnv,
  ...localEnv,
};

const config = {
  postgresDb: {
    host: joinedEnv.POSTGRES_DB_HOST,
    port: +joinedEnv.POSTGRES_DB_PORT,
    user: joinedEnv.POSTGRES_DB_USER,
    password: joinedEnv.POSTGRES_DB_PASSWORD,
    database: joinedEnv.POSTGRES_DB_NAME,
    logging: Boolean(joinedEnv.POSTGRES_DB_LOGGING),
  },
  port: +joinedEnv.SERVER_PORT,
  urlVodokanal: joinedEnv.URL_VODOKANAL,
  urlAvito: joinedEnv.URL_AVITO,
  urlAvitoNotes: joinedEnv.URL_AVITO_NOTES,
  urlProxyServer: joinedEnv.URL_PROXY_SERVER,
  urlProxyServer2: joinedEnv.URL_PROXY_SERVER2,
  isCronJobsRun: joinedEnv.SERVER_IS_CRON_JOBS_ENABLED,
  numberOfStreams: +joinedEnv.NUMBER_OF_STREAMS,
};

export default config;
