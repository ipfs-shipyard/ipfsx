const Multiaddr = require('multiaddr')
const Queue = require('promise-queue')
const { promisify } = require('util')
const HTTP = require('http')
const QueryString = require('querystring')
const PortManager = require('port-manager')
const shortid = require('shortid')
const { DEFAULT_PORT_SERVICE_ADDR } = require('./')

module.exports = async addr => {
  addr = Multiaddr(addr || process.env.PORT_SERVICE_ADDR || DEFAULT_PORT_SERVICE_ADDR)

  if (!addr.protoNames().includes('http')) {
    throw new Error('invalid protocol')
  }

  const portManager = new PortManager().include(3000, 9999)

  const claim = name => new Promise((resolve, reject) => {
    portManager.claim(name, (err, service) => {
      // TODO: err might be string, remove when fixed upstream
      // https://github.com/mgesmundo/port-manager/pull/2
      if (err) {
        if (Object.prototype.toString.call(err) === '[object String]') {
          return reject(new Error(err))
        }
        return reject(err)
      }
      resolve(service)
    })
  })

  const queue = new Queue(1)

  // TODO: implement release endpoint so we don't run out of ports!
  const handler = req => {
    const queryParams = QueryString.parse(req.url.split('?')[1] || '')
    const numPorts = getNumPorts(queryParams)
    const serviceName = queryParams.name || `ipfs-${shortid()}`

    return queue.add(async () => {
      const ports = []
      for (let i = 0; i < numPorts; i++) {
        const { port } = await claim(`${serviceName}[${i}]`)
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
