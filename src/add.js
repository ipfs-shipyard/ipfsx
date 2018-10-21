const CID = require('cids')
const toPull = require('async-iterator-to-pull-stream')
const toIterator = require('pull-stream-to-async-iterator')
const pull = require('pull-stream')
const log = require('debug')('ipfsx:add')
const { isString, isIterable, isIterator } = require('./util/type')
const { ends } = require('./util/iterator')

module.exports = backend => {
  return function add (input, options) {
    input = toIterable(input)

    const inputIterator = input[Symbol.iterator]
      ? input[Symbol.iterator]()
      : input[Symbol.asyncIterator]()

    const inputGenerator = async function * () {
      const first = await inputIterator.next()
      if (first.done) return

      if (Buffer.isBuffer(first.value)) {
        log('first value is buffer')

        const contentIterator = async function * () {
          yield first.value

          const restIterable = { [Symbol.asyncIterator]: () => inputIterator }
          for await (const chunk of restIterable) {
            yield chunk
          }
        }

        yield { content: toPull(contentIterator()) }
      } else if (isString(first.value)) {
        log('first value is string')

        const contentIterator = async function * () {
          yield Buffer.from(first.value)

          const restIterable = { [Symbol.asyncIterator]: () => inputIterator }
          for await (const chunk of restIterable) {
            yield Buffer.from(chunk)
          }
        }

        yield { content: toPull(contentIterator()) }
      } else if (first.value && first.value.content) {
        log('first value is object')

        yield { ...first.value, content: toPull(toIterable(first.value.content)) }

        const restIterable = { [Symbol.asyncIterator]: () => inputIterator }
        for await (const chunk of restIterable) {
          yield { ...chunk, content: toPull(toIterable(chunk.content)) }
        }
      } else {
        throw new Error('invalid input')
      }
    }

    const outputIterator = toIterator(
      pull(
        toPull(inputGenerator()),
        backend.files.addPullStream(options),
        pull.map(({ path, hash }) => ({ path, cid: new CID(hash) }))
      )
    )

    return ends(outputIterator)
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

  if (input && input.content) {
    return (function * () { yield input })()
  }

  throw new Error('invalid input')
}
