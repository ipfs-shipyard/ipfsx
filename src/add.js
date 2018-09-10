const CID = require('cids')
const toPull = require('async-iterator-to-pull-stream')
const pull = require('pull-stream')
const log = require('debug')('ipfsx:add')
const { isString } = require('./util/type')

module.exports = backend => {
  return async function add (input, options) {
    input = toIterator(input)

    const first = await input.next()
    if (first.done) return []

    let source

    if (Buffer.isBuffer(first.value)) {
      log('first value is buffer')

      const iterator = async function * () {
        yield first.value
        for await (let chunk of input) {
          yield chunk
        }
      }

      source = pull.values([{ content: toPull(iterator()) }])
    } else if (first.value && first.value.content) {
      log('first value is object')

      const iterator = async function * () {
        yield { ...first, content: toPull(toIterator(first.value.content)) }
        for await (let chunk of input) {
          yield { ...chunk, content: toPull(toIterator(chunk.content)) }
        }
      }

      source = toPull(iterator())
    } else {
      throw new Error('invalid input')
    }

    return new Promise((resolve, reject) => {
      pull(
        source,
        backend.files.addPullStream(options),
        pull.map(({ path, hash }) => ({ path, cid: new CID(hash) })),
        pull.collect((err, output) => {
          if (err) return reject(err)
          resolve(output.length > 1 ? output : output[0])
        })
      )
    })
  }
}

function toIterator (input) {
  if (Buffer.isBuffer(input)) {
    return (function * () { yield input })()
  }

  if (isString(input)) {
    return (function * () { yield Buffer.from(input) })()
  }

  if (input && (input[Symbol.iterator] || input[Symbol.asyncIterator])) {
    return input
  }

  throw new Error('invalid input')
}
