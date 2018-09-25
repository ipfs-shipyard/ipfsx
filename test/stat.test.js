const test = require('ava')
const { randomBytes } = require('crypto')
const CID = require('cids')
const Path = require('path')
const shortid = require('shortid')
const ipfsx = require('./helpers/ipfsx')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should stat a file', async t => {
  const { node } = t.context
  const path = `/test-stat-${shortid()}.txt`
  const data = randomBytes(256)

  await node.write(path, data)
  const stats = await node.stat(path)

  t.true(CID.isCID(stats.cid))
  t.is(stats.size, data.length)
  t.true(stats.cumulativeSize > data.length)
  t.is(stats.blocks, 1)
  t.is(stats.type, 'file')
})

test('should stat a directory', async t => {
  const { node } = t.context
  const path = `/test/test-stat-${shortid()}.txt`
  const data = randomBytes(256)

  await node.write(path, data, { parents: true })
  const stats = await node.stat(Path.dirname(path))

  t.true(CID.isCID(stats.cid))
  t.is(stats.size, 0)
  t.true(stats.cumulativeSize > data.length)
  t.is(stats.blocks, 1)
  t.is(stats.type, 'directory')
})
