const CID = require('cids')
const toPull = require('async-iterator-to-pull-stream')
const toIterator = require('pull-stream-to-async-iterator')
const pull = require('pull-stream')
const log = require('debug')('ipfsx:add')
const { isString, isIterable, isIterator } = require('./util/type')
const { first, last } = require('./util/iterator')

module.exports = backend => {
  return function add (input, options) {
    input = toInputIterator(input)

    const inputIterator = async function * () {
      const first = await input.next()
      if (first.done) return

      if (Buffer.isBuffer(first.value)) {
        log('first value is buffer')

        const contentIterator = async function * () {
          yield first.value
          for await (let chunk of input) {
            yield chunk
          }
        }

        yield { content: toPull(contentIterator()) }
      } else if (isString(first.value)) {
        log('first value is string')

        const contentIterator = async function * () {
          yield Buffer.from(first.value)
          for await (let chunk of input) {
            yield Buffer.from(chunk)
          }
        }

        yield { content: toPull(contentIterator()) }
      } else if (first.value && first.value.content) {
        log('first value is object')

        yield { ...first, content: toPull(toInputIterator(first.value.content)) }

        for await (let chunk of input) {
          yield { ...chunk, content: toPull(toInputIterator(chunk.content)) }
        }
      } else {
        throw new Error('invalid input')
      }
    }

    const outputIterator = toIterator(
      pull(
        toPull(inputIterator()),
        backend.files.addPullStream(options),
        pull.map(({ path, hash }) => ({ path, cid: new CID(hash) }))
      )
    )

    outputIterator.first = () => first(outputIterator)
    outputIterator.last = () => last(outputIterator)

    return outputIterator
  }
}

function toInputIterator (input) {
  if (Buffer.isBuffer(input)) {
    return (function * () { yield input })()
  }

  if (isString(input)) {
    return (function * () { yield Buffer.from(input) })()
  }

  if (isIterator(input)) {
    return input
  }

  if (isIterable(input)) {
    return input[Symbol.iterator]
      ? input[Symbol.iterator]()
      : input[Symbol.asyncIterator]()
  }

  if (input && input.content) {
    return (function * () { yield input })()
  }

  throw new Error('invalid input')
}
