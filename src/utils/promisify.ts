// We don't have access to node's util.promsifiy in the browser!
function promisify<Result>(
  callbackStyle: (
    callback: (error: Error | null, result: Result) => void
  ) => void
): Promise<Result> {
  return new Promise((resolve, reject) => {
    callbackStyle((err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

export default promisify;
