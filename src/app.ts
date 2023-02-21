import receiveMessage from './subscriber/receive';

(async () => {
  try {
    receiveMessage();
  } catch (error) {
    console.log(error);
  }
})();
