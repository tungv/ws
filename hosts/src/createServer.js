const net = require('net')
const uuid = require('uuid')
const { Subject, Observable } = require('rx')

const createClient = require('./client')

const CMD_SUBSCRIBE = 'SUB'
const CMD_SEND = 'MSG'
const STATS = 'STATS'
const WELCOME = 'CONNECTED'
const __DEV__ = process.env.NODE_ENV !== 'production'

const removeNewLines = str => str.split('\n').join('')

const writeJSON = (socket, msg) => {
  if (socket.destroyed) {
    return
  }
  socket.write(JSON.stringify(msg) + '\n')
}

module.exports = (port) => {
  const socketsMap = new Map
  const { subscribe, send, stats } = createClient(socketsMap)

  const handler = socket => {
    const socketId = uuid()

    const messages$ = new Subject()
    messages$
      .bufferTime(100)
      .filter(array => array.length)
      .startWith(WELCOME)
      .subscribe(message => {
        writeJSON(socket, message)
      });

    socketsMap.set(socketId, messages$)

    socket.on('close', () => {
      socketsMap.delete(socketId)
    })

    socket.on('data', buffer => {
      const data = String(buffer)
      let [command, ...params] = data.split(':')

      command = command || data

      switch (command) {
      case CMD_SUBSCRIBE:
        const userId = removeNewLines(params[0])
        const unsubscribe = subscribe(userId, socketId, socket)
        messages$.onNext({ status: 'SUBSCRIBED', message: 'successfully subscribed' })
        socket.on('close', unsubscribe)
        return

      case CMD_SEND:
        const receivers = send(params[0], removeNewLines(params[1]))
        if (receivers) {
          messages$.onNext({
            status: 'SENT',
            message: 'sent',
            receiver_count: receivers,
          })
        } else {
          messages$.onNext({
            status: 'NOT_FOUND',
            message: 'no clients were listening',
            receiver_count: 0
          })
        }
        return

      case STATS:
        messages$.onNext(Object.assign({ connections: socketsMap.size }, stats()))
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
