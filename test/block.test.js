const test = require('ava')
const unixfs = require('js-unixfsv2-draft')
const Block = require('ipfs-block')
const ipfsx = require('./helpers/ipfsx')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should put file', async t => {
  const { node } = t.context
  const block = await node.block.put(unixfs.file(__filename)).last()
  t.true(Block.isBlock(block))
})

test('should put directory', async t => {
  const { node } = t.context
  const block = await node.block.put(unixfs.dir(__dirname)).last()
  t.true(Block.isBlock(block))
})
