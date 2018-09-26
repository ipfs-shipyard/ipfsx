const test = require('ava')
const ipfsx = require('./helpers/ipfsx')
const shortid = require('shortid')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should copy from an IPFS path', async t => {
  const { node } = t.context

  const input = `hello world ${shortid()}`
  const { cid } = await node.add(input).first()

  const from = `/ipfs/${cid}`
  const to = `/hello-world-${shortid()}.txt`

  await node.cp(from, to)

  for await (const chunk of node.read(to)) {
    t.is(chunk.toString(), input)
  }
})

test('should copy from an MFS path', async t => {
  const { node } = t.context

  const input = `hello world ${shortid()}`
  const from = `/hello-world-from-${shortid()}.txt`
  const to = `/hello-world-to-${shortid()}.txt`

  await node.write(from, input)
  await node.cp(from, to)

  for await (const chunk of node.read(to)) {
    t.is(chunk.toString(), input)
  }
})
