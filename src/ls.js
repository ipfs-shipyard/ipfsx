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
      const res = await backend.files.ls(path, options)
      console.log(res)
      for (const item of res) {
        const { name, size, hash, type } = item
        console.log(item)
        yield { cid: new CID(hash), name, path, size, type }
      }
    })()
  }
}
