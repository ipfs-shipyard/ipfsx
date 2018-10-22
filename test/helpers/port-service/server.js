const Multiaddr = require('multiaddr')
const Queue = require('promise-queue')
const { promisify } = require('util')
const HTTP = require('http')
const QueryString = require('querystring')
const getPort = require('get-port')
const { DEFAULT_PORT_SERVICE_ADDR } = require('./')

module.exports = async addr => {
  addr = Multiaddr(addr || process.env.PORT_SERVICE_ADDR || DEFAULT_PORT_SERVICE_ADDR)

  if (!addr.protoNames().includes('http')) {
    throw new Error('invalid protocol')
  }

  const queue = new Queue(1)

  const handler = req => {
    const queryParams = QueryString.parse(req.url.split('?')[1] || '')
    const numPorts = getNumPorts(queryParams)

    return queue.add(async () => {
      const ports = []
      for (let i = 0; i < numPorts; i++) {
        const port = await getPort()
        ports.push(port)
      }
      return { ports }
    })
  }

  const server = HTTP.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    let data

    try {
      data = await handler(req)
    } catch (err) {
      console.error(err)
      res.statusCode = err.statusCode || 500
      res.write(JSON.stringify({ message: err.message }))
      return res.end()
    }

    res.write(JSON.stringify(data))
    res.end()
  })

  const { hostname, port } = parseHost(addr)
  await promisify(server.listen.bind(server))(port, hostname)

  return { addr, stop: promisify(server.close) }
}

// Extract the hostname and port from a multiaddr
function parseHost (addr) {
  const parts = addr.toString().split('/')

  const hostnameProtos = ['ip4', 'ip6', 'dns4', 'dns6', 'dnsaddr']
  const hostnameIndex = parts.findIndex(p => hostnameProtos.includes(p))
  const hostname = parts[hostnameIndex + 1]

  const portIndex = parts.findIndex(p => p === 'tcp')
  const port = parseInt(portIndex === -1 ? 0 : parts[portIndex + 1])

  return { hostname, port }
}

function getNumPorts (queryParams) {
  const num = parseInt(queryParams.num || 1)
  if (isNaN(num) || num < 0) throw badRequest('invalid number of ports')
  return num
}

function badRequest (message) {
  const err = new Error(message)
  err.statusCode = 400
  return err
}
