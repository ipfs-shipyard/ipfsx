const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const dirName = `/test-${Date.now()}`

  await node.write(`${dirName}/file1`, `${Math.random()}`, { parents: true })
  await node.write(`${dirName}/file2`, `${Math.random()}`, { parents: true })
  await node.write(`${dirName}/dir/file3`, `${Math.random()}`, { parents: true })

  for await (const { cid, name, size, type } of node.ls(dirName)) {
    console.log({ cid: cid.toString(), name, size, type })
  }

  /*
  { cid: 'Qmcao818uTXkZcV7JfwSKuBkTmGJUqkAY4Ur1mJDD2w87X',
    name: 'file2',
    size: 19,
    type: 'file' }
  { cid: 'QmZbdgi3ZesUbiHAGG5yaGqS7Dav3yUiGgiL4Lqee9DP3E',
    name: 'file1',
    size: 18,
    type: 'file' }
  { cid: 'QmXYZQedxLmp33HtkgNvSSHn7US3UhSNzYe8aF8N8wXpxH',
    name: 'dir',
    size: 0,
    type: 'directory' }
  */

  await node.stop()
}

main()
