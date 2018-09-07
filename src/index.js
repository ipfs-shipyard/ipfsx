const IPFS = require('ipfs')
const log = require('debug')('ipfsx')

module.exports = async (opts) => {
  opts = opts || {}

  const backend = new IPFS(opts)
  backend.on('error', log)

  const api = {
    add: require('./add')(backend),
    cat: require('./cat')(backend),
    start: require('./start')(backend),
    stop: require('./stop')(backend)
  }

  return new Promise((resolve, reject) => {
    const onError = err => {
      backend.off('ready', onReady)
      reject(err)
    }
    const onReady = () => {
      backend.off('error', onError)
      resolve(api)
    }
    backend.on('ready', onReady)
    backend.on('error', onError)
  })
}
