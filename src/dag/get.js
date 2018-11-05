const ipldDagPb = require('ipld-dag-pb')
const ipldDagCbor = require('ipld-dag-cbor')
const ipldRaw = require('ipld-raw')

module.exports = (backend, options) => {
  const formats = options && Array.isArray(options.ipldFormats)
    ? options.ipldFromats
    : [ipldDagPb, ipldDagCbor, ipldRaw]

  const resolve = require('./resolve')(backend, options)

  return async (path, options) => {
    options = options || {}

    const resolved = await resolve(path, options)

    const format = formats.find(r => r.resolver.multicodec === resolved.cid.codec)
    if (!format) throw new Error(`missing IPLD format ${resolved.cid.codec}`)

    if (options.signal) {
      const abort = new Promise((resolve, reject) => {
        options.signal.onabort = () => reject(new Error('operation aborted'))
      })

      const block = await Promise.race([abort, backend.block.get(resolved.cid)])
      const { value } = await Promise.race([abort, formatResolve(format, block.data, resolved.path)])
      return value
    }

    const block = await backend.block.get(resolved.cid)
    const { value } = await formatResolve(format, block.data, resolved.path)
    return value
  }
}

function formatResolve (format, data, path) {
  return new Promise((resolve, reject) => {
    format.resolver.resolve(data, path, (err, res) => {
      if (err) return reject(err)
      resolve(res)
    })
  })
}
