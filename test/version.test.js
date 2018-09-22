const test = require('ava')
const ipfsx = require('./helpers/ipfsx')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should get node version', async t => {
  const { node } = t.context
  const info = await node.version()

  t.truthy(info)
  t.truthy(info.version)
  t.truthy(info.commit != null)
  t.truthy(info.repo)
})
