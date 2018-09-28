const test = require('ava')
const shortid = require('shortid')
const { randomBytes } = require('crypto')
const ipfsx = require('./helpers/ipfsx')
const { randomInteger } = require('./helpers/random')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should move a file', async t => {
  const { node } = t.context
  const path = `/test-mv-${shortid()}.txt`
  const nextPath = `/test-mv-${shortid()}.txt`
  const data = randomBytes(randomInteger(1, 256))

  await node.write(path, data)
  await node.stat(path)
  await node.mv(path, nextPath)

  await t.throwsAsync(node.stat(path), 'file does not exist')
  for await (const chunk of node.read(nextPath)) {
    t.deepEqual(chunk, data)
  }
})

test('should not move a file into a directory that does not exist', async t => {
  const { node } = t.context
  const path = `/test-mv-${shortid()}.txt`
  const nextPath = `/test-mv-${shortid()}/test-mv-${shortid()}.txt`
  const data = randomBytes(randomInteger(1, 256))

  await node.write(path, data)
  await node.stat(path)
  await t.throwsAsync(node.mv(path, nextPath), 'file does not exist')
})

test('should move multiple files', async t => {
  const { node } = t.context
  const create = async () => {
    const path = `/test-mv-${shortid()}.txt`
    const data = randomBytes(randomInteger(1, 256))
    await node.write(path, data)
    return { path, data }
  }
  const fileA = await create()
  const fileB = await create()
  const dir = `/test-mv-${shortid()}`

  await node.mv(fileA.path, fileB.path, dir, { parents: true })
  await t.throwsAsync(node.stat(fileA.path), 'file does not exist')
  await t.throwsAsync(node.stat(fileB.path), 'file does not exist')

  for await (const chunk of node.read(dir + fileA.path)) {
    t.deepEqual(chunk, fileA.data)
  }
  for await (const chunk of node.read(dir + fileB.path)) {
    t.deepEqual(chunk, fileB.data)
  }
})
