const log = require('debug')('ipfsx')

module.exports = async backend => {
  const api = {
    add: require('./add')(backend),
    cat: require('./cat')(backend),
    start: require('./start')(backend),
    stop: require('./stop')(backend)
  }

  // Backend is IpfsApi
  if (!backend.libp2p) {
    log('backend is IPFS API')
    return api
  }

  backend.on('error', log)

  // Already ready?
  if (backend.isOnline()) {
    log('backend is ready')
    return api
  }

  log('waiting for backend to be ready')

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
