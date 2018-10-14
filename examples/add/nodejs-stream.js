const Os = require('os')
const Path = require('path')
const Fs = require('fs')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const { cid } = await node.add(Fs.createReadStream(__filename)).first()

  let buffer = Buffer.alloc(0)
  for await (const chunk of node.cat(cid)) {
    buffer = Buffer.concat([buffer, chunk])
  }

  if (!buffer.equals(await Fs.promises.readFile(__filename))) {
    throw new Error('something went wrong, data written was not equal to data read')
  }

  console.log('success! data written was equal to data read')
  await node.stop()
}

main()
