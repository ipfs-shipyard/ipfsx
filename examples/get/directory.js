const Fs = require('fs')
const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

const rootDir = Path.resolve(__dirname, '..', '..')

;(async () => {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const { cid, path } = await node.add([
    { path: 'ipfsx/LICENSE', content: Fs.createReadStream(Path.join(rootDir, 'LICENSE')) },
    { path: 'ipfsx/README.md', content: Fs.createReadStream(Path.join(rootDir, 'README.md')) }
  ]).last()

  console.log(cid.toBaseEncodedString(), path)

  for await (const file of node.get(cid)) {
    console.log('Path:', file.path)

    // Directory has no content
    if (!file.content) continue

    let data = Buffer.alloc(0)

    for await (const chunk of file.content) {
      data = Buffer.concat([data, chunk])
    }

    console.log('Data:', data)
  }
})()
