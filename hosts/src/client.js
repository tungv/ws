const __DEV__ = process.env.NODE_ENV !== 'production'

module.exports = (socketsMap) => {
  const clientsMap = new Map

  const subscribe = (userId, socketId) => {
    __DEV__ && console.log('subscribe', userId, socketId)
    let userSockets
    if (!clientsMap.has(userId)) {
      clientsMap.set(userId, userSockets = new Set)
    } else {
      userSockets = clientsMap.get(userId)
    }

    userSockets.add(socketId)

    return () => unsubscribe(userId, socketId)
  }

  let totalReceived = 0
  let totalSent = 0

  const stats = () => ({
    topics: clientsMap.size,
    sent: totalSent,
    received: totalReceived,
  })

  const unsubscribe = (userId, socketId) => {
    __DEV__ && console.log('unsubscribe', userId, socketId)
    if (!clientsMap.has(userId)) {
      return
    }

    const userSockets = clientsMap.get(userId)
    userSockets.delete(socketId)
    if (userSockets.size === 0) {
      clientsMap.delete(userId)
    }
  }

  const send = (userId, message) => {
    __DEV__ && console.log('send', userId, message)
    ++totalReceived
    if (!clientsMap.has(userId)) {
      return
    }

    const userSockets = clientsMap.get(userId)
    let sent = 0
    for (const socketId of userSockets) {
      debugger
      const socket = socketsMap.get(socketId)
      if (!socket) {
        socketsMap.delete(socketId)
        continue
      }

      socket.write(message + '\n')
      ++totalSent
      ++sent
    }

    console.log('message sent to %d clients', sent)

    return sent
  }

  return {
    subscribe,
    send,
    stats,
  }
}
