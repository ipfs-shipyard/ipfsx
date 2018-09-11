const test = require('ava')
const ipfsx = require('./helpers/ipfsx')

test.before(async t => { t.context.node = await ipfsx({ start: false }) })
test.after.always(t => t.context.node.stop())

test('should start', t => t.context.node.start())
