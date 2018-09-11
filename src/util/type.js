const isFunction = obj => typeof obj === 'function'
exports.isFunction = isFunction

const isString = obj => Object.prototype.toString.call(obj) === '[object String]'
exports.isString = isString

const isIterator = obj => obj && typeof obj.next === 'function'
exports.isIterator = isIterator

const isIterable = obj => obj && (
  isFunction(obj[Symbol.iterator]) || isFunction(obj[Symbol.asyncIterator])
)
exports.isIterable = isIterable
