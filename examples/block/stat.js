const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))
  const data = Buffer.from('hello world')
  const block = await node.block.put(data).first()
  const stats = await node.block.stat(block.cid)

  console.log(block.cid.toBaseEncodedString(), stats)
  // zb2rhj7crUKTQYRGCRATFaQ6YFLTde2YzdqbbhAASkL9uRDXn { size: 11 }

  await node.stop()
}

main()
