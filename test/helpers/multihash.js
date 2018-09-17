const { createHash } = require('crypto')
const Multihash = require('multihashes')

const sha2 = buffer => createHash('sha256').update(buffer).digest()
exports.sha2 = sha2

const sha2mh = buffer => Multihash.encode(sha2(buffer), 'sha2-256')
exports.sha2mh = sha2mh
