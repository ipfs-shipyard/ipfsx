const toIterator = require('pull-stream-to-async-iterator')

module.exports = backend => {
  return async function cat (path, options) {
    return toIterator(backend.catPullStream(path, options))
  }
}
