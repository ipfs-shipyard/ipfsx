const toIterator = require('pull-stream-to-async-iterator')

module.exports = backend => {
  return function get (path) {
    return (async function * () {
      for await (const file of toIterator(backend.files.getPullStream(path))) {
        file.content = file.content ? toIterator(file.content) : null
        yield file
      }
    })()
  }
}
