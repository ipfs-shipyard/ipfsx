const Os = require('os')
const Path = require('path')
const Fs = require('fs')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const path = `/example-read+write-nodejs-stream-${Date.now()}.js`

  await node.write(path, Fs.createReadStream(__filename))

  let buffer = Buffer.alloc(0)
  for await (const chunk of node.read(path)) {
    buffer = Buffer.concat([buffer, chunk])
  }

  if (!buffer.equals(await Fs.promises.readFile(__filename))) {
    throw new Error('something went wrong, data written was not equal to data read')
  }

  console.log('success! data written was equal to data read')
  await node.stop()
}

main()
