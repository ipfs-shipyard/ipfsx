const CID = require('cids')

module.exports = backend => {
  return async function stat (path) {
    const {
      hash,
      size,
      cumulativeSize,
      blocks,
      type
    } = await backend.files.stat(path)

    return { cid: new CID(hash), size, cumulativeSize, blocks, type }
  }
}
