const createServer = require('./createServer')

createServer(9000).ready.then(address => {
  console.log('tcp server has started at', address)
})
