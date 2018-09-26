const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const now = new Date()
  const path = `/example-read+write-string-${now.getTime()}.txt`
  const data = `The date is now ${now.toISOString()}`

  console.log(`writing "${data}" to ${path}`)
  await node.write(path, data)

  console.log(`reading from ${path}`)
  let buffer = Buffer.alloc(0)
  for await (const chunk of node.read(path)) {
    buffer = Buffer.concat([buffer, chunk])
  }

  if (buffer.toString() !== data) {
    throw new Error('something went wrong, data written was not equal to data read')
  }

  console.log('success! data written was equal to data read')
  await node.stop()
}

main()
