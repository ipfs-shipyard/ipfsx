const toIterator = require('pull-stream-to-async-iterator')

module.exports = backend => {
  return function cat (path, options) {
    return toIterator(backend.files.catPullStream(path, options))
  }
}
