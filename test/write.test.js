const test = require('ava')
const { randomBytes } = require('crypto')
const Fs = require('fs')
const ipfsx = require('./helpers/ipfsx')
const { randomInteger, randomArray } = require('./helpers/random')
const { pause } = require('./helpers/async')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should write from buffer', async t => {
  const { node } = t.context
  const path = `/test-write-buffer-${Date.now()}.txt`
  const data = randomBytes(randomInteger(1, 256))
  await node.write(path, data)
  t.pass()
})

test('should write from string', async t => {
  const { node } = t.context
  const path = `/test-write-string-${Date.now()}.txt`
  const data = randomBytes(randomInteger(1, 256)).toString('hex')
  await node.write(path, data)
  t.pass()
})

test('should write from Node.js stream', async t => {
  const { node } = t.context
  const path = `/test-write-nodejs-stream-${Date.now()}.txt`
  const data = Fs.createReadStream(__filename)
  await node.write(path, data)
  t.pass()
})

test('should write from iterator of buffer', async t => {
  const { node } = t.context
  const path = `/test-write-iterator-${Date.now()}.txt`
  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  await node.write(path, data)
  t.pass()
})

test('should write from async iterator of buffer', async t => {
  const { node } = t.context
  const path = `/test-write-iterator-${Date.now()}.txt`
  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  const iterator = async function * () {
    for (let i = 0; i < data.length; i++) {
      yield await pause(randomInteger(1, 10), data[i])
    }
  }
  await node.write(path, iterator())
  t.pass()
})
