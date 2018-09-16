exports.first = async iterator => {
  for await (const value of iterator) return value
}

exports.last = async iterator => {
  let value
  for await (value of iterator) {}
  return value
}

exports.ends = iterator => {
  iterator.first = exports.first(iterator)
  iterator.last = exports.last(iterator)
  return iterator
}
