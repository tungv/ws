const createClient = require('../client')

test('createClient() should return { subscribe }', () => {
  expect(createClient(new Map).subscribe).toBeInstanceOf(Function)
})

test('createClient() should return { send }', () => {
  expect(createClient(new Map).send).toBeInstanceOf(Function)
})

describe('subscribe', () => {
  const setup = () => {
    const client = createClient(new Map)
    return client.subscribe
  }
  test('subscribe should return unsubscribe', () => {
    const subscribe = setup()
    expect(subscribe('user', 'socket')).toBeInstanceOf(Function)
  })
});
