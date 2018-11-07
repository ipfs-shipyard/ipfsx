const toIterator = require('pull-stream-to-async-iterator')
const abortable = require('abortable-iterator')

module.exports = backend => {
  return function cat (path, options) {
    const it = toIterator(backend.files.catPullStream(path, options))
    return options && options.signal ? abortable(it, options.signal) : it
  }
}
