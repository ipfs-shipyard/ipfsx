module.exports = backend => {
  return async function rm (...args) {
    return backend.files.rm(...args)
  }
}
