exports.first = async function first (iterator) {
  for await (const value of iterator) return value
}

exports.last = async function last (iterator) {
  let value
  for await (value of iterator) {}
  return value
}
