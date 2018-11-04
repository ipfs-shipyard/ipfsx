const ipldDagPb = require('ipld-dag-pb')
const ipldDagCbor = require('ipld-dag-cbor')
const ipldRaw = require('ipld-raw')
const { isIterable, isIterator } = require('../util/type')

module.exports = (backend, options) => {
  const formats = options && Array.isArray(options.ipldFormats)
    ? options.ipldFromats
    : [ipldDagPb, ipldDagCbor, ipldRaw]

  return (input, options) => {
    options = options || {}
    options.cidCodec = options.cidCodec || 'raw'
    options.hashAlg = options.hashAlg || 'sha2-256'

    const format = formats.find(r => r.resolver.multicodec === options.cidCodec)
    if (!format) throw new Error(`missing IPLD format ${options.cidCodec}`)

    return (async function * () {
      for await (const obj of toInputIterable(input)) {
        const data = await formatSerialize(format, obj)
        const block = await backend.block.put(data, {
          version: 1,
          mhtype: options.hashAlg,
          format: options.cidCodec
        })
        yield block.cid
      }
    })()
  }
}

function formatSerialize (format, obj) {
  return new Promise((resolve, reject) => {
    format.util.serialize(obj, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

function toInputIterable (input) {
  if (isIterator(input)) {
    return { [Symbol.asyncIterator]: () => input }
  }

  if (isIterable(input)) {
    return input
  }

  return (function * () { yield input })()
}
