module.exports = backend => {
  return async function mv (...args) {
    return backend.files.mv(...args)
  }
}
