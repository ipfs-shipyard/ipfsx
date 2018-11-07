const CID = require('cids')
const { normalize } = require('path')
const { isString } = require('../util/type')
const log = require('debug')('ipfsx:dag:resolve')
const ipldDagPb = require('ipld-dag-pb')
const ipldDagCbor = require('ipld-dag-cbor')
const ipldRaw = require('ipld-raw')
const explain = require('explain-error')

module.exports = (backend, options) => {
  const formats = options && Array.isArray(options.ipldFormats)
    ? options.ipldFromats
    : [ipldDagPb, ipldDagCbor, ipldRaw]

  // TODO: use backend.dag.tree when js-ipfs supports it
  return async (path, options) => {
    options = options || {}

    if (Buffer.isBuffer(path)) {
      try {
        path = `/ipfs/${new CID(path)}`
      } catch (err) {
        throw explain(err, 'invalid path')
      }
    }

    if (CID.isCID(path)) path = `/ipfs/${path}`
    if (!isString(path)) throw new Error('invalid path')

    path = normalize(path)

    if (path[0] !== '/') path = `/${path}`
    if (!path.startsWith('/ipfs')) path = `/ipfs${path}`

    const parts = path.split('/')

    let cid
    try {
      cid = new CID(parts[2])
    } catch (err) {
      throw explain(err, 'invalid path')
    }

    path = parts.slice(3).join('/')

    return resolve(cid, path, options.signal)
  }

  async function resolve (cid, path, signal) {
    log(`resolve ${cid}/${path}`)
    if (!path) return { cid }

    const format = formats.find(r => r.resolver.multicodec === cid.codec)
    if (!format) throw new Error(`missing IPLD format ${cid.codec}`)

    let resolved

    if (signal) {
      const abort = new Promise((resolve, reject) => {
        signal.onabort = () => reject(new Error('operation aborted'))
      })

      const block = await Promise.race([abort, backend.block.get(cid)])
      resolved = await Promise.race([abort, formatResolve(format, block.data, path)])
    } else {
      const block = await backend.block.get(cid)
      resolved = await formatResolve(format, block.data, path)
    }

    // If not a link, then it is a value within this node
    if (!isLink(resolved.value)) {
      return { cid, path }
    }

    return resolve(getLinkCid(resolved.value), resolved.remainderPath, signal)
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

function isLink (obj) {
  if (CID.isCID(obj)) return true
  try {
    new CID(obj['/']) // eslint-disable-line
    return true
  } catch (err) {
    return false
  }
}

function getLinkCid (obj) {
  return CID.isCID(obj) ? obj : new CID(obj['/'])
}
