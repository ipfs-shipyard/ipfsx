const test = require('ava')
const ipfsx = require('./helpers/ipfsx')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should get node identity', async t => {
  const { node } = t.context
  const identity = await node.id()

  t.truthy(identity)
  t.truthy(identity.id)
  t.truthy(identity.publicKey)
  t.truthy(Array.isArray(identity.addresses))
  t.truthy(identity.agentVersion)
  t.truthy(identity.protocolVersion)
})
