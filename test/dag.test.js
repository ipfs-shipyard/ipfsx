const test = require('ava')
const { randomBytes } = require('crypto')
const CID = require('cids')
const Multihash = require('multihashes')
const { randomInteger } = require('./helpers/random')
const ipfsx = require('./helpers/ipfsx')
const { sha2mh } = require('./helpers/multihash')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should put a buffer', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = await node.dag.put(data).first()
  t.true(CID.isCID(cid))
})

test('should throw for missing IPLD format', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const format = `test${Date.now()}`
  const error = await t.throws(() => node.dag.put(data, { format }))
  t.is(error.message, `missing IPLD format ${format}`)
})

test('should put with a non-default IPLD format', async t => {
  const { node } = t.context
  const linkData = randomBytes(randomInteger(1, 256))
  const data = { [`test${Date.now()}`]: new CID(1, 'raw', sha2mh(linkData)) }
  const cid = await node.dag.put(data, { format: 'dag-cbor' }).first()
  t.true(CID.isCID(cid))
  t.is(cid.codec, 'dag-cbor')
})

test('should put with a non-default hash algorithm', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = await node.dag.put(data, { hashAlg: 'sha1' }).first()
  t.true(CID.isCID(cid))
  t.is(Multihash.decode(cid.multihash).name, 'sha1')
})
