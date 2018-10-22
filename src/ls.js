const toIterator = require('pull-stream-to-async-iterator')
const CID = require('cids')
const { isString } = require('./util/type')

module.exports = backend => {
  return function ls (path, options) {
    if (!isString(path)) throw new Error('invalid path')

    if (path.startsWith('/ipfs')) {
      return (async function * () {
        const it = toIterator(backend.lsPullStream(path, options))
        for await (const { name, path, size, hash, type } of it) {
          yield {
            cid: new CID(hash),
            name,
            path,
            size,
            type: type === 'dir' ? 'directory' : 'file'
          }
        }
      })()
    }

    return (async function * () {
      const res = await backend.files.ls(path, Object.assign({}, options, { long: true }))
      for (const { name, size, hash, type } of res) {
        yield {
          cid: new CID(hash),
          name,
          path,
          size,
          type: type === 1 ? 'directory' : 'file'
        }
      }
    })()
  }
}
