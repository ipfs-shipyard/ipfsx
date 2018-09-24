const test = require('ava')
const { randomBytes } = require('crypto')
const ipfsx = require('./helpers/ipfsx')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should read a file', async t => {
  const { node } = t.context
  const path = `/test-read-${Date.now()}.txt`
  const data = Array.from(Array(100000).fill(0), () => randomBytes(16))
  const iterator = function * () {
    for (var i = 0; i < data.length; i++) {
      yield data[i]
    }
  }

  await node.write(path, iterator())

  let buffer = Buffer.alloc(0)
  for await (const chunk of node.read(path)) {
    buffer = Buffer.concat([buffer, chunk])
  }

  t.deepEqual(buffer, Buffer.concat(data))
})
