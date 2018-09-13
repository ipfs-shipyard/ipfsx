const test = require('ava')
const { randomBytes } = require('crypto')
const ipfsx = require('./helpers/ipfsx')
const { randomInteger } = require('./helpers/random')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should cat', async t => {
  const { node } = t.context
  const input = randomBytes(randomInteger(1, 256))
  const { cid } = (await node.add(input).next()).value
  let output = Buffer.alloc(0)
  for await (const chunk of node.cat(cid)) {
    output = Buffer.concat([output, chunk])
  }
  t.deepEqual(output, input)
})
