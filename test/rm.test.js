const test = require('ava')
const shortid = require('shortid')
const { randomBytes } = require('crypto')
const ipfsx = require('./helpers/ipfsx')
const { randomInteger } = require('./helpers/random')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should remove a file', async t => {
  const { node } = t.context
  const path = `/test-rm-${shortid()}.txt`
  const data = randomBytes(randomInteger(1, 256))
  await node.write(path, data)
  await node.stat(path)
  await node.rm(path)
  await t.throwsAsync(node.stat(path), 'file does not exist')
})

test('should remove multiple files', async t => {
  const { node } = t.context
  const create = async () => {
    const path = `/test-rm-${shortid()}.txt`
    const data = randomBytes(randomInteger(1, 256))
    await node.write(path, data)
    return path
  }
  const pathA = await create()
  const pathB = await create()
  await node.rm(pathA, pathB)
  await t.throwsAsync(node.stat(pathA), 'file does not exist')
  await t.throwsAsync(node.stat(pathB), 'file does not exist')
})

test('should not remove a directory without recursive option', async t => {
  const { node } = t.context
  const path = `/test-rm-${shortid()}`
  await node.mkdir(path)
  await node.stat(path)
  await t.throwsAsync(node.rm(path), /is a directory/)
})

test('should remove a directory recursively', async t => {
  const { node } = t.context
  const path = `/test-rm-${shortid()}/${shortid()}/${shortid()}.txt`
  const data = randomBytes(randomInteger(1, 256))
  await node.write(path, data, { parents: true })
  await node.stat(path)
  await node.rm(`/${path.split('/')[1]}`, { recursive: true })
  await t.throwsAsync(node.stat(path), 'file does not exist')
})
