const test = require('ava')
const { randomBytes } = require('crypto')
const AbortController = require('abort-controller')
const ipfsx = require('./helpers/ipfsx')
const { randomInteger } = require('./helpers/random')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should cat', async t => {
  const { node } = t.context
  const input = randomBytes(randomInteger(1, 256))
  const { cid } = await node.add(input).first()
  let output = Buffer.alloc(0)
  for await (const chunk of node.cat(cid)) {
    output = Buffer.concat([output, chunk])
  }
  t.deepEqual(output, input)
})

test('should abort cat', async t => {
  const { node } = t.context
  const input = randomBytes(randomInteger(1, 256))
  const { cid } = await node.add(input).first()

  const controller = new AbortController()
  const signal = controller.signal

  setTimeout(() => controller.abort())

  try {
    for await (const _ of node.cat(cid, { signal })) { // eslint-disable-line
      t.fail()
    }
  } catch (err) {
    return t.is(err.message, 'operation aborted')
  }

  t.fail()
})
