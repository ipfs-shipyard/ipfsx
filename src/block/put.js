const Block = require('ipfs-block')
const { isIterable, isIterator } = require('./util/type')
const { ends } = require('./util/iterator')

module.exports = backend => {
  return function put (input, options) {
    input = toInputIterator(input)

    const outputIterator = (async function * () {
      for await (const block of input) {
        yield await backend.block.put(block, options)
      }
    })()

    return ends(outputIterator)
  }
}

function toInputIterator (input) {
  if (Buffer.isBuffer(input) || Block.isBlock(input)) {
    return (function * () { yield input })()
  }

  if (isIterator(input)) {
    return input
  }

  if (isIterable(input)) {
    return input[Symbol.iterator]
      ? input[Symbol.iterator]()
      : input[Symbol.asyncIterator]()
  }

  throw new Error('invalid input')
}
