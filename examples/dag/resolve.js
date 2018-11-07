const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const itemsCid = await node.dag.put(
    { apples: { count: 5 }, pears: { count: 2 } },
    { format: 'dag-cbor' }
  ).first()

  const basketCid = await node.dag.put({ items: itemsCid }, { format: 'dag-cbor' }).first()
  let path = `/ipfs/${basketCid}/items/apples/count`

  const res = await node.dag.resolve(path)
  console.log(`resolved ${path} to`, res)

  path = `/ipfs/${res.cid}/${res.path}`

  const count = await node.dag.get(path)
  console.log(`get ${path} = ${count}`)

  await node.stop()
}

main()
