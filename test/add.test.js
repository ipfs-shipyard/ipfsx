const test = require('ava')
const { randomBytes } = require('crypto')
const CID = require('cids')
const { isString } = require('../src/util/type')
const ipfsx = require('./helpers/ipfsx')
const { randomInteger, randomArray, randomDirectory } = require('./helpers/random')
const { pause } = require('./helpers/async')

test.beforeEach(async t => { t.context.node = await ipfsx() })
test.afterEach.always(t => t.context.node.stop())

test('should add from buffer', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256))
  const { cid, path } = await node.add(data)
  t.true(CID.isCID(cid))
  t.true(isString(path))
})

test('should add from string', async t => {
  const { node } = t.context
  const data = randomBytes(randomInteger(1, 256)).toString('hex')
  const { cid, path } = await node.add(data)
  t.true(CID.isCID(cid))
  t.true(isString(path))
})

test('should add from iterator of buffer', async t => {
  const { node } = t.context
  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  const iterator = function * () {
    for (let i = 0; i < data.length; i++) yield data[i]
  }
  const { cid, path } = await node.add(iterator())
  t.true(CID.isCID(cid))
  t.true(isString(path))
})

test('should return empty array if no data in iterator', async t => {
  const { node } = t.context
  const iterator = function * () {}
  const res = await node.add(iterator())
  t.true(Array.isArray(res))
  t.is(res.length, 0)
})

test('should add from async iterator of buffer', async t => {
  const { node } = t.context
  const data = randomArray(1, 100, () => randomBytes(randomInteger(1, 64)))
  const iterator = async function * () {
    for (let i = 0; i < data.length; i++) {
      yield await pause(randomInteger(1, 10), data[i])
    }
  }
  const { cid, path } = await node.add(iterator())
  t.true(CID.isCID(cid))
  t.true(isString(path))
})

test('should add from async iterator of objects of buffer', async t => {
  const { node } = t.context
  const data = randomDirectory()

  const iterator = async function * () {
    for (let i = 0; i < data.length; i++) {
      yield await pause(randomInteger(1, 10), data[i])
    }
  }

  let res = await node.add(iterator())
  res = Array.isArray(res) ? res : [res]

  if (data.length) {
    t.true(res.length > 0)
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

  let res = await node.add(iterator())
  res = Array.isArray(res) ? res : [res]

  if (data.length) {
    t.true(res.length > 0)
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

  let res = await node.add(iterator())
  res = Array.isArray(res) ? res : [res]

  if (data.length) {
    t.true(res.length > 0)
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
        for (let i = 0; i < data.length; i++) {
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

  let res = await node.add(iterator())
  res = Array.isArray(res) ? res : [res]

  if (data.length) {
    t.true(res.length > 0)
  } else {
    t.is(res.length, 0)
  }
})
