const Os = require('os')
const Path = require('path')
const shortid = require('shortid')
const rmfr = require('rmfr')
const ipfsx = require('../../')
const { createPortServiceClient } = require('./port-service')
const deepmerge = require('deepmerge')
const IPFS = require('ipfs')

const portClient = createPortServiceClient()

module.exports = async options => {
  options = options || {}

  const ports = await portClient.claim(4, { name: `ipfs-${shortid()}` })
  const repoPath = Path.join(Os.tmpdir(), shortid())

  options = deepmerge({
    repo: repoPath,
    init: { bits: 512 },
    config: {
      Addresses: {
        Swarm: [
          `/ip4/0.0.0.0/tcp/${ports[0]}`,
          `/ip4/127.0.0.1/tcp/${ports[1]}/ws`
        ],
        API: `/ip4/127.0.0.1/tcp/${ports[2]}`,
        Gateway: `/ip4/127.0.0.1/tcp/${ports[3]}`
      }
    }
  }, options)

  const node = await ipfsx(new IPFS(options))
  const stop = node.stop

  node.stop = async () => {
    try {
      await stop()
    } finally {
      await rmfr(repoPath)
    }
  }

  return node
}
