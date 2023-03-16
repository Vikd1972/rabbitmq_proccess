/* eslint-disable no-console */
const arrayOfColors = {
  ERROR: '\x1b[31m', // red
  SUCCESS: '\x1b[32m', // green
  WARN: '\x1b[33m', // yellow
  INFO: '\x1b[36m', // cyan
  TRACE: '\x1b[90m', // grey
  // black: '\x1b[30m',
  // blue: '\x1b[34m',
  // magenta: '\x1b[35m',
  // white: '\x1b[37m',
};

const logger = (type: keyof typeof arrayOfColors, proccess: string, message: string) => {
  const colorMessage = Object.entries(arrayOfColors).filter((item) => item[0] === type)[0][1];

  console.log(`\u2554= type: ${type}, proccess: ${proccess}`);
  console.log('\u2551', colorMessage, message, '\x1b[0m');
  console.log('\u255A============================');
};
export default logger;
