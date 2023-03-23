const scalablePromiseAll = async (promisesList: Promise<unknown>[]) => {
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.all(promisesList);

    const pendingPromise = results.find((result) => result instanceof Promise);

    if (!pendingPromise) {
      return results;
    }
  }
};

export default scalablePromiseAll;
