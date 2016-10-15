const net = require('net')
const createServer = require('../createServer')

const testConnection = port =>
  new Promise((resolve, reject) => {
    net.connect(port, (err) => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })

test('should create server on the given port', () => {
  const { close, ready } = createServer(51432);
  return ready.then(testConnection).then(close);
});

test('should not create server on an invalid port', () => {
  const { close, ready } = createServer(514320);
  return ready.then(testConnection).catch(close);
});
