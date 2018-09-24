const toIterator = require('pull-stream-to-async-iterator')

module.exports = backend => {
  return function read (path, options) {
    return toIterator(backend.files.readPullStream(path, options))
  }
}
