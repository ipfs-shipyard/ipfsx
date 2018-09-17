const test = require('ava')
const unixfs = require('js-unixfsv2-draft')
const Block = require('ipfs-block')
const { randomBytes } = require('crypto')
const CID = require('cids')
const { sha2mh } = require('./helpers/multihash')
const { randomInteger, randomArray } = require('./helpers/random')
const ipfsx = require('./helpers/ipfsx')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should put from buffer', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const block = await node.block.put(data, { cidCodec: 'raw' }).last()
  t.true(Block.isBlock(block))
  t.deepEqual(block.data, data)
})

test('should put from block', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = new CID(1, 'raw', sha2mh(data))
  const block = await node.block.put(new Block(data, cid)).last()
  t.true(Block.isBlock(block))
  t.deepEqual(block.data, data)
})

test('should put from iterator of block', async t => {
  const { node } = t.context
  const block = await node.block.put(unixfs.dir(__dirname)).last()
  t.true(Block.isBlock(block))
})

test('should put from iterator of buffer', async t => {
  const { node } = t.context

  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  let i = 0

  for await (const block of node.block.put(data, { cidCodec: 'raw' })) {
    t.true(Block.isBlock(block))
    t.deepEqual(block.data, data[i])
    t.is(block.cid.codec, 'raw')
    i++
  }
})
