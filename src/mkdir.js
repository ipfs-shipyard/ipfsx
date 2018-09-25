module.exports = backend => {
  return async function mkdir (path, options) {
    options = options || {}
    options.parents = options.parents || false
    options.flush = options.flush == null ? true : options.flush
    return backend.files.mkdir(path, options)
  }
}
