exports.pause = (ms, value) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(value), ms)
})
