const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const { cid } = await node.add([
    { content: 'hello world!', path: 'test/file1.txt' },
    { content: 'hello IPFS!', path: 'test/file2.txt' }
  ], { wrapWithDirectory: true }).last()

  // Returns a DAGNode because node.add creates content with format dag-pb
  const file1 = await node.dag.get(`/ipfs/${cid}/test/file1.txt`)
  console.log(file1.data.toString()) // hello world!

  const file2 = await node.dag.get(`/ipfs/${cid}/test/file2.txt`)
  console.log(file2.data.toString()) // hello IPFS!

  await node.stop()
}

main()
