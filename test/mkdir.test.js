const test = require('ava')
const ipfsx = require('./helpers/ipfsx')
const shortid = require('shortid')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should make a directory', async t => {
  const { node } = t.context
  const path = `/test-mkdir-${shortid()}`
  await node.mkdir(path)
  t.pass()
})

test('should not make a directory if parents do not exist', async t => {
  const { node } = t.context
  const path = `/test-mkdir-${shortid()}/parents`
  await t.throwsAsync(node.mkdir(path), 'file does not exist')
})

test('should make a directory and parents', async t => {
  const { node } = t.context
  const path = `/test-mkdir-${shortid()}/parents`
  await node.mkdir(path, { parents: true })
  t.pass()
})
