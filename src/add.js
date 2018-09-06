const CID = require('cids')
const { isString } = require('./util/type')

module.exports = backend => {
  return async function add (input, options) {
    input = toIterator(input)

    // TODO: stream don't buffer
    let chunks = Buffer.alloc(0)
    let chunkCount = 0

    // TODO: allow objects
    for await (let chunk of input) {
      chunkCount++
      chunks = Buffer.concat([chunks, chunk])
    }

    let output = await backend.files.add(chunks)
    output = output.map(({ path, hash }) => ({ path, cid: new CID(hash) }))
    return output.length > 1 ? output : output[0]
  }
}

function toIterator (input) {
  if (Buffer.isBuffer(input)) {
    return function * () { yield input }()
  }

  if (isString(input)) {
    return function * () { yield Buffer.from(input) }()
  }

  if (input[Symbol.iterator] || input[Symbol.asyncIterator]) {
    return input
  }

  throw new Error('invalid input')
}
