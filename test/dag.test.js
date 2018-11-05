const test = require('ava')
const { randomBytes } = require('crypto')
const CID = require('cids')
const Multihash = require('multihashes')
const { randomInteger, randomArray } = require('./helpers/random')
const ipfsx = require('./helpers/ipfsx')
const { sha2mh } = require('./helpers/multihash')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should put a buffer', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = await node.dag.put(data).first()
  t.true(CID.isCID(cid))
  t.is(cid.version, 1)
  t.is(cid.codec, 'raw')
})

test('should put from iterator of buffer', async t => {
  const { node } = t.context

  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  let count = 0

  for await (const cid of node.dag.put(data)) {
    t.is(cid.version, 1)
    t.is(cid.codec, 'raw')
    count++
  }

  t.is(count, data.length)
})

test('should put from async iterable of buffer', async t => {
  const { node } = t.context

  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))

  const it = {
    [Symbol.asyncIterator] () {
      let i = 0
      return {
        async next () {
          if (i === data.length) return { done: true }
          const value = await new Promise((resolve, reject) => {
            setTimeout(() => resolve(data[i++]), randomInteger(1, 10))
          })
          return { value, done: false }
        }
      }
    }
  }
  let count = 0

  for await (const cid of node.dag.put(it)) {
    t.is(cid.version, 1)
    t.is(cid.codec, 'raw')
    count++
  }

  t.is(count, data.length)
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

test('should resolve from path', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = await node.dag.put(data).first()
  const res = await node.dag.resolve(`/ipfs/${cid}`)
  t.true(res.cid.equals(cid))
  t.falsy(res.path)
})

test('should resolve to CID from multi node traversing path', async t => {
  const { node } = t.context

  const leaf = await (() => {
    const data = randomBytes(randomInteger(1, 256))
    return node.dag.put(data, { format: 'raw' }).first()
  })()

  const mid = await (() => {
    const data = {
      now: Date.now(),
      toLeaf: leaf
    }
    return node.dag.put(data, { format: 'dag-cbor' }).first()
  })()

  const root = await (() => {
    const data = {
      i: randomInteger(1, 1138),
      nested: {
        toMid: mid
      }
    }
    return node.dag.put(data, { format: 'dag-cbor' }).first()
  })()

  const res = await node.dag.resolve(`/ipfs/${root}/nested/toMid/toLeaf`)
  t.true(res.cid.equals(leaf))
  t.falsy(res.path)
})

test('should resolve to CID and path from multi node traversing path', async t => {
  const { node } = t.context

  const leaf = await (() => {
    const data = randomBytes(randomInteger(1, 256))
    return node.dag.put(data, { format: 'raw' }).first()
  })()

  const root = await (() => {
    const data = {
      now: Date.now(),
      nested: {
        toLeaf: leaf
      }
    }
    return node.dag.put(data, { format: 'dag-cbor' }).first()
  })()

  const res = await node.dag.resolve(`/ipfs/${root}/nested`)
  t.true(res.cid.equals(root))
  t.is(res.path, 'nested')
})

test('should resolve from CID instance', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = await node.dag.put(data).first()
  const res = await node.dag.resolve(cid)
  t.true(res.cid.equals(cid))
  t.falsy(res.path)
})

test('should resolve from CID buffer', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = await node.dag.put(data).first()
  const res = await node.dag.resolve(cid.buffer)
  t.true(res.cid.equals(cid))
  t.falsy(res.path)
})

test('should get from path', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = await node.dag.put(data).first()
  const res = await node.dag.get(`/ipfs/${cid}`)
  t.deepEqual(res, data)
})

test('should get local value from path', async t => {
  const { node } = t.context
  const data = { now: Date.now(), nested: { value: 5 } }
  const cid = await node.dag.put(data, { format: 'dag-cbor' }).first()
  const res = await node.dag.get(`/ipfs/${cid}/nested/value`)
  t.deepEqual(res, data.nested.value)
})

test('should get from multi node traversing path', async t => {
  const { node } = t.context

  const leafData = randomBytes(randomInteger(1, 256))
  const leaf = await node.dag.put(leafData, { format: 'raw' }).first()

  const root = await (() => {
    const data = {
      now: Date.now(),
      nested: {
        toLeaf: leaf
      }
    }
    return node.dag.put(data, { format: 'dag-cbor' }).first()
  })()

  const res = await node.dag.get(`/ipfs/${root}/nested/toLeaf`)
  t.deepEqual(res, leafData)
})

test('should get from CID instance', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = await node.dag.put(data).first()
  const res = await node.dag.get(cid)
  t.deepEqual(res, data)
})

test('should get from CID buffer', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const cid = await node.dag.put(data).first()
  const res = await node.dag.get(cid.buffer)
  t.deepEqual(res, data)
})
