const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const res = await node.add([
    { path: `file1`, content: `${Math.random()}` },
    { path: `file2`, content: `${Math.random()}` },
    { path: `dir/file3`, content: `${Math.random()}` }
  ], { wrapWithDirectory: true }).last()

  for await (const { cid, name, size, type } of node.ls(`/ipfs/${res.cid}`)) {
    console.log({ cid: cid.toString(), name, size, type })
  }

  /*
  { cid: 'QmdyDRruDdLc8ZFU8ekfsbgbL6QAVvfCXherJte1muRng6',
    name: 'dir',
    size: 78,
    type: 'directory' }
  { cid: 'QmSBZyCUSVv5ByZpDcC3MMd7fGFr1t7racVAGeo1P7wP4b',
    name: 'file1',
    size: 27,
    type: 'file' }
  { cid: 'QmTScjxfdvkoTre1ySsmmhXFUnikRGbevYPN97MFEzwLGP',
    name: 'file2',
    size: 27,
    type: 'file' }
  */

  await node.stop()
}

main()
