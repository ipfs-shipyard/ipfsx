const test = require('ava')
const shortid = require('shortid')
const { randomBytes } = require('crypto')
const ipfsx = require('./helpers/ipfsx')
const { randomArray, randomInteger } = require('./helpers/random')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should ls an IPFS path', async t => {
  const { node } = t.context

  const input = randomArray(1, 10, () => ({
    path: shortid(),
    content: randomBytes(randomInteger(32, 256))
  }))

  // Ensure directory handled
  input.push({
    path: `${shortid()}/${shortid()}`,
    content: randomBytes(randomInteger(32, 256))
  })

  const { cid } = await node.add(input, { wrapWithDirectory: true }).last()

  const output = []

  for await (const item of node.ls(`/ipfs/${cid}`)) {
    output.push(item)
  }

  input.forEach((inputItem) => {
    const inputItemName = inputItem.path.split('/')[0]
    const outputItem = output.find(({ name }) => inputItemName === name)
    t.truthy(outputItem)
    t.is(outputItem.size, inputItem.content.length)
    t.is(outputItem.type, inputItem.path.includes('/') ? 'directory' : 'file')
  })
})

test('should ls an MFS path', async t => {
  const { node } = t.context

  const input = randomArray(1, 10, () => ({
    path: shortid(),
    content: randomBytes(randomInteger(32, 256))
  }))

  // Ensure directory handled
  input.push({
    path: `${shortid()}/${shortid()}`,
    content: randomBytes(randomInteger(32, 256))
  })

  const { cid } = await node.add(input, { wrapWithDirectory: true }).last()

  const dirName = shortid()
  await node.cp(`/ipfs/${cid}`, `/${dirName}`)

  const output = []

  for await (const item of node.ls(`/${dirName}`)) {
    output.push(item)
  }

  input.forEach((inputItem) => {
    const inputItemName = inputItem.path.split('/')[0]
    const outputItem = output.find(({ name }) => inputItemName === name)
    t.truthy(outputItem)
    t.is(outputItem.size, inputItem.content.length)
    t.is(outputItem.type, inputItem.path.includes('/') ? 'directory' : 'file')
  })
})
