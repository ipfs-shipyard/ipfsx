module.exports = backend => async (...args) => {
  const { size } = await backend.block.stat(...args)
  return { size }
}
