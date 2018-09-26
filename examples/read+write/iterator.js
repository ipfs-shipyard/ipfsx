const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const { randomBytes } = require('crypto')
const { inspect } = require('util')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  const path = `/example-read+write-iterator-${Date.now()}.txt`
  const { data, iterator } = randomData()

  console.log('iterator[Symbol.iterable]=', iterator)

  console.log(`writing to ${path}`)
  await node.write(path, iterator)

  console.log(`reading from ${path}`)
  let buffer = Buffer.alloc(0)
  for await (const chunk of node.read(path)) {
    console.log(`read ${inspect(chunk)}`)
    buffer = Buffer.concat([buffer, chunk])
  }

  if (!buffer.equals(data)) {
    throw new Error('something went wrong, data written was not equal to data read')
  }

  console.log('success! data written was equal to data read')
  await node.stop()
}

function randomData () {
  const data = Array.from(Array(100000).fill(0), () => randomBytes(16))
  const it = function * () {
    for (var i = 0; i < data.length; i++) {
      console.log(`writing ${inspect(data[i])}`)
      yield data[i]
    }
  }
  console.log(it)
  return {
    data: Buffer.concat(data),
    iterator: (it)()
  }
}

main()
