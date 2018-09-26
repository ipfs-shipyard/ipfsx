const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const { cid } = await node.add('hello world!').first()

  const from = `/ipfs/${cid}`
  const to = `/hello-world-${Date.now()}.txt`

  console.log(`copying from ${from} to ${to}`)

  await node.cp(from, to)

  console.log(`reading from ${to}:`)

  for await (const chunk of node.read(to)) {
    console.log(chunk.toString())
  }

  await node.stop()
}

main()
