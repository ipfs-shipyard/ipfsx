const toPull = require('async-iterator-to-pull-stream')
const { isString, isIterable, isIterator } = require('./util/type')

module.exports = backend => {
  return function write (path, input, options) {
    input = toIterable(input)
    options = options || {}
    options.create = options.create == null ? true : options.create
    options.cidVersion = options.cidVersion == null ? 1 : options.cidVersion

    const inputGenerator = async function * () {
      for await (const chunk of input) {
        if (Buffer.isBuffer(chunk)) {
          yield chunk
        } else if (isString(chunk)) {
          yield Buffer.from(chunk)
        } else {
          throw new Error('invalid input')
        }
      }
    }

    return backend.files.write(path, toPull(inputGenerator()), options)
  }
}

function toIterable (input) {
  if (Buffer.isBuffer(input)) {
    return (function * () { yield input })()
  }

  if (isString(input)) {
    return (function * () { yield Buffer.from(input) })()
  }

  if (isIterator(input)) {
    return { [Symbol.asyncIterator]: () => input }
  }

  if (isIterable(input)) {
    return input
  }

  throw new Error('invalid input')
}
