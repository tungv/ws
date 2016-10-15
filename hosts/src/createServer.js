const net = require('net')
const uuid = require('uuid')

const createClient = require('./client')

const CMD_SUBSCRIBE = 'SUB'
const CMD_SEND = 'MSG'
const STATS = 'STATS'
const __DEV__ = process.env.NODE_ENV !== 'production'

const removeNewLines = str => str.split('\n').join('')

const writeJSON = (socket, msg) => {
  socket.write(JSON.stringify(msg) + '\n')
}

module.exports = (port) => {
  const socketsMap = new Map
  const { subscribe, send, stats } = createClient(socketsMap)

  const handler = socket => {
    const socketId = uuid()
    socketsMap.set(socketId, socket)

    socket.on('close', () => {
      socketsMap.delete(socketId)
    })

    socket.on('data', buffer => {
      const data = String(buffer)
      const [command, ...params] = data.split(':')

      switch (command) {
      case CMD_SUBSCRIBE:
        const userId = removeNewLines(params[0])
        const unsubscribe = subscribe(userId, socketId, socket)
        writeJSON(socket, { status: 'SUBSCRIBED', message: 'successfully subscribed' })
        socket.on('close', unsubscribe)
        return

      case CMD_SEND:
        const receivers = send(params[0], removeNewLines(params[1]))
        if (receivers) {
          writeJSON(socket, {
            status: 'SENT',
            message: 'sent',
            receiver_count: receivers,
          })
        } else {
          writeJSON(socket, {
            status: 'NOT_FOUND',
            message: 'no clients were listening',
            receiver_count: 0
          })
        }
        return

      case STATS:
        writeJSON(socket, Object.assign({ connections: socketsMap.size }, stats()))
      }
    })
  }
  const server = net.createServer(handler)

  const ready = new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) {
        return reject(err)
      }

      resolve(server.address())
    })
  })

  return {
    close: (cb) => server.close(cb),
    ready,
  }
}
