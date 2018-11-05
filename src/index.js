const log = require('debug')('ipfsx')

module.exports = async (backend, options) => {
  const api = {
    add: require('./add')(backend, options),
    block: {
      get: require('./block/get')(backend, options),
      put: require('./block/put')(backend, options),
      stat: require('./block/stat')(backend, options)
    },
    cat: require('./cat')(backend, options),
    cp: require('./cp')(backend, options),
    dag: {
      get: require('./dag/get')(backend, options),
      put: require('./dag/put')(backend, options),
      resolve: require('./dag/resolve')(backend, options)
    },
    get: require('./get')(backend, options),
    id: require('./id')(backend, options),
    ls: require('./ls')(backend, options),
    mkdir: require('./mkdir')(backend, options),
    mv: require('./mv')(backend, options),
    read: require('./read')(backend, options),
    rm: require('./rm')(backend, options),
    start: require('./start')(backend, options),
    stat: require('./stat')(backend, options),
    stop: require('./stop')(backend, options),
    version: require('./version')(backend, options),
    write: require('./write')(backend, options)
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
