const test = require('ava')
const { randomBytes } = require('crypto')
const ipfsx = require('./helpers/ipfsx')
const { randomInteger } = require('./helpers/random')

test.beforeEach(async t => { t.context.node = await ipfsx() })
test.afterEach.always(t => t.context.node.stop())

test('should cat', async t => {
  const { node } = t.context
  const input = randomBytes(randomInteger(1, 256))
  const { cid } = await node.add(input)
  let output = Buffer.alloc(0)
  for await (const chunk of node.cat(cid)) {
    output = Buffer.concat([output, chunk])
  }
  t.deepEqual(output, input)
})
