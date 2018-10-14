const Os = require('os')
const Path = require('path')
const AbortController = require('abort-controller')
const Ipfs = require('ipfs')
const ipfsx = require('../../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))

  // abort if not complete after 5 seconds
  const controller = new AbortController()
  setTimeout(() => controller.abort(), 5000)

  const cid = 'zb2rhbry6PX6Qktru4SpxuVdkJm4mjdTqs8qzaPpvHk2tmx2w'
  console.log(`attempting to cat ${cid} for 5 seconds...`)

  try {
    // eslint-disable-next-line
    for await (const _ of node.cat(cid, { signal: controller.signal })) {
      // do nothing!
    }
  } catch (err) {
    if (err.message === 'operation aborted') {
      console.log('aborted successfully after 5 seconds')
    } else {
      throw err
    }
  } finally {
    await node.stop()
  }
}

main()
