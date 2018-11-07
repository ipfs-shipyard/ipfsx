const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const cid = await node.dag.put(Buffer.from('Hello World!')).first()
  console.log(cid.toString()) // zb2rhfE3SX3q7Ha6UErfMqQReKsmLn73BvdDRagHDM6X1eRFN

  // Multiple nodes from iterable:

  const iterable = [
    Buffer.from('Hello World!'),
    Buffer.from('Nice to meet ya!')
  ]

  for await (const cid of node.dag.put(iterable)) {
    console.log(cid.toString())
  }

  // zb2rhfE3SX3q7Ha6UErfMqQReKsmLn73BvdDRagHDM6X1eRFN
  // zb2rheUvNiPZtWauZfu2H1Kb64oRum1yuqkVLgMkD3j8nSCuX

  // Store with IPLD format "dag-cbor":

  const cborNodeCid = await node.dag.put({ msg: ['hello', 'world', '!'] }, { format: 'dag-cbor' }).first()
  console.log(cborNodeCid.toString()) // zdpuAqiXL8e6RZj5PoittgkYQPvE3Y4APxXD4sSdXYfS3x7P8

  const msg0 = await node.dag.get(`/ipfs/${cborNodeCid}/msg/0`)
  console.log(msg0) // hello

  await node.stop()
}

main()
