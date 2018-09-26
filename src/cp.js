const { isString } = require('./util/type')

module.exports = backend => {
  return async function cp (...args) {
    if (!isString(args[args.length - 1])) {
      args.push({})
    }
    const options = args[args.length - 1]
    options.parents = options.parents || false
    options.flush = options.flush == null ? true : options.flush
    return backend.files.cp(...args)
  }
}
