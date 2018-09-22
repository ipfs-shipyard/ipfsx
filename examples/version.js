const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../')

;(async () => {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))
  const info = await node.version()
  console.log(info)
  // { version: '0.32.2', repo: 7, commit: '' }
})()
