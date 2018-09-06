const toUri = require('multiaddr-to-uri')
const { URL } = require('url')
const got = require('got')
const { DEFAULT_PORT_SERVICE_ADDR } = require('./')

module.exports = apiAddr => {
  const url = new URL(toUri(apiAddr || process.env.PORT_SERVICE_ADDR || DEFAULT_PORT_SERVICE_ADDR))

  return {
    async claim (num, options) {
      options = options || {}

      const res = await got(url + 'claim', {
        json: true,
        query: { num, name: options.name }
      })

      return res.body.ports
    }
  }
}
