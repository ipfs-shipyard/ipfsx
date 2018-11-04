const toIterator = require('pull-stream-to-async-iterator')
const abortable = require('abortable-iterator')

module.exports = backend => {
  return function get (path, options) {
    const it = (async function * () {
      for await (const value of toIterator(backend.files.getPullStream(path))) {
        value.content = value.content ? toIterator(value.content) : null
        yield value
      }
    })()

    return options && options.signal ? abortable(it, options.signal) : it
  }
}
