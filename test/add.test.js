const test = require('ava')
const { randomBytes } = require('crypto')
const CID = require('cids')
const { isString } = require('../src/util/type')
const ipfsx = require('./helpers/ipfsx')
const { randomInteger, randomArray, randomDirectory } = require('./helpers/random')
const { pause } = require('./helpers/async')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should add from buffer', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from string', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256)).toString('hex')
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from iterable of buffer', async t => {
  const { node } = t.context
  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from iterable of string', async t => {
  const { node } = t.context
  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)).toString('hex'))
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from iterable of object of buffer', async t => {
  const { node } = t.context
  const data = randomArray(2, 100, () => randomBytes(randomInteger(1, 64)))
    .map(chunk => ({ content: chunk }))
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from iterable of object of string', async t => {
  const { node } = t.context
  const data = randomArray(2, 100, () => randomBytes(randomInteger(1, 64)))
    .map(chunk => ({ content: chunk.toString('hex') }))
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from iterable of object of iterator', async t => {
  const { node } = t.context
  const data = randomArray(2, 100, () => randomBytes(randomInteger(1, 64)))
    .map(chunk => ({ content: (function * () { yield chunk })() }))
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from iterable of object of iterable', async t => {
  const { node } = t.context
  const data = randomArray(2, 100, () => randomBytes(randomInteger(1, 64)))
    .map(chunk => ({ content: [chunk] }))
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from object of buffer', async t => {
  const { node } = t.context
  const data = { content: randomBytes(randomInteger(1, 64)) }
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from object of string', async t => {
  const { node } = t.context
  const data = { content: randomBytes(randomInteger(1, 64)).toString('hex') }
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from object of iterator', async t => {
  const { node } = t.context
  const data = {
    content: (function * () {
      yield randomBytes(randomInteger(1, 64))
    })()
  }
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from object of iterable', async t => {
  const { node } = t.context
  const data = {
    content: randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  }
  for await (const { cid, path } of node.add(data)) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from iterator of buffer', async t => {
  const { node } = t.context
  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  const iterator = function * () {
    for (let i = 0; i < data.length; i++) yield data[i]
  }
  for await (const { cid, path } of node.add(iterator())) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should not yield when no data in iterator', async t => {
  const { node } = t.context
  const iterator = function * () {}
  for await (const _ of node.add(iterator())) { // eslint-disable-line
    throw new Error('unexpected yield')
  }
})

test('should add from async iterator of buffer', async t => {
  const { node } = t.context
  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  const iterator = async function * () {
    for (let i = 0; i < data.length; i++) {
      yield await pause(randomInteger(1, 10), data[i])
    }
  }
  for await (const { cid, path } of node.add(iterator())) {
    t.true(CID.isCID(cid))
    t.true(isString(path))
  }
})

test('should add from async iterator of objects of buffer', async t => {
  const { node } = t.context
  const data = randomDirectory()

  const iterator = async function * () {
    for (let i = 0; i < data.length; i++) {
      yield await pause(randomInteger(1, 10), data[i])
    }
  }

  const res = []

  for await (const item of node.add(iterator())) {
    res.push(item)
  }

  if (data.length) {
    t.true(res.length > 0)
    res.forEach(({ cid, path }) => {
      t.true(CID.isCID(cid))
      t.true(isString(path))
    })
  } else {
    t.is(res.length, 0)
  }
})

test('should add from async iterator of objects of string', async t => {
  const { node } = t.context
  const data = randomDirectory({
    createContent: () => randomBytes(randomInteger(1, 64)).toString('hex')
  })

  const iterator = async function * () {
    for (let i = 0; i < data.length; i++) {
      yield await pause(randomInteger(1, 10), data[i])
    }
  }

  const res = []

  for await (const item of node.add(iterator())) {
    res.push(item)
  }

  if (data.length) {
    t.true(res.length > 0)
    res.forEach(({ cid, path }) => {
      t.true(CID.isCID(cid))
      t.true(isString(path))
    })
  } else {
    t.is(res.length, 0)
  }
})

test('should add from async iterator of objects of iterator', async t => {
  const { node } = t.context
  const data = randomDirectory({
    createContent: () => {
      const content = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
      const iterator = function * () {
        for (let i = 0; i < content.length; i++) yield content[i]
      }
      return iterator()
    }
  })

  const iterator = async function * () {
    for (let i = 0; i < data.length; i++) {
      yield await pause(randomInteger(1, 10), data[i])
    }
  }

  const res = []

  for await (const item of node.add(iterator())) {
    res.push(item)
  }

  if (data.length) {
    t.true(res.length > 0)
    res.forEach(({ cid, path }) => {
      t.true(CID.isCID(cid))
      t.true(isString(path))
    })
  } else {
    t.is(res.length, 0)
  }
})

test('should add from async iterator of objects of async iterator', async t => {
  const { node } = t.context

  const data = randomDirectory({
    createContent: () => {
      const content = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
      const iterator = async function * () {
        for (let i = 0; i < content.length; i++) {
          yield await pause(randomInteger(1, 10), content[i])
        }
      }
      return iterator()
    }
  })

  const iterator = async function * () {
    for (let i = 0; i < data.length; i++) {
      yield await pause(randomInteger(1, 10), data[i])
    }
  }

  const res = []

  for await (const item of node.add(iterator())) {
    res.push(item)
  }

  if (data.length) {
    t.true(res.length > 0)
    res.forEach(({ cid, path }) => {
      t.true(CID.isCID(cid))
      t.true(isString(path))
    })
  } else {
    t.is(res.length, 0)
  }
})

test('should add and take first', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const { cid, path } = await node.add(data).first()
  t.true(CID.isCID(cid))
  t.true(isString(path))
})

test('should add and take last', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const { cid, path } = await node.add(data).last()
  t.true(CID.isCID(cid))
  t.true(isString(path))
})
