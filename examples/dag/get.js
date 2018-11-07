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

  // node.add creates content with IPLD format dag-pb
  // The dag-pb resolver returns DAGNode instances, see:
  // https://github.com/ipld/js-ipld-dag-pb
  const file1 = await node.dag.get(`/ipfs/${cid}/test/file1.txt`)
  console.log(file1.data.toString()) // hello world!

  const file2 = await node.dag.get(`/ipfs/${cid}/test/file2.txt`)
  console.log(file2.data.toString()) // hello IPFS!

  // Traversing linked ndoes:

  const itemsCid = await node.dag.put({ apples: 5, pears: 2 }, { format: 'dag-cbor' }).first()
  const basketCid = await node.dag.put({ items: itemsCid }, { format: 'dag-cbor' }).first()

  const basket = await node.dag.get(`/ipfs/${basketCid}`)
  console.log(basket) // { items: CID<zdpuAzD1F5ttkuXKHE9a2rcMCRdurmSzfmk9HFrz69dRm3YMd> }

  const items = await node.dag.get(`/ipfs/${basketCid}/items`)
  console.log(items) // { pears: 2, apples: 5 }

  const apples = await node.dag.get(`/ipfs/${basketCid}/items/apples`)
  console.log(apples) // 5

  await node.stop()
}

main()
