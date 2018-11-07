const Block = require('ipfs-block')
const log = require('debug')('ipfsx:block:put')
const { isIterable, isIterator } = require('../util/type')
const { ends } = require('../util/iterator')

module.exports = backend => {
  return function put (input, options) {
    input = toInputIterable(input)
    if (options) log(options)
    options = options || {}

    const outputIterator = (async function * () {
      for await (const block of input) {
        if (Block.isBlock(block)) {
          log('put', block.cid.toBaseEncodedString(), block.data)
          yield await backend.block.put(block)
        } else {
          log('put', block)
          yield await backend.block.put(block, {
            format: options.format || 'raw',
            version: options.cidVersion || 1,
            mhtype: options.hashAlg || 'sha2-256',
            mhlen: options.hashLen
          })
        }
      }
    })()

    return ends(outputIterator)
  }
}

function toInputIterable (input) {
  if (Buffer.isBuffer(input) || Block.isBlock(input)) {
    return (function * () { yield input })()
  }

  if (isIterator(input)) {
    return { [Symbol.asyncIterator]: () => input }
  }

  if (isIterable(input)) {
    return input
  }

  throw new Error('invalid input')
}
