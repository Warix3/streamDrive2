'use strict'

const qs = require('querystring')
const got = require('got')
const crypto = require('crypto');
const handleError = require('../handle-error')

const decrypt = text => {
  var decipher = crypto.createCipher('aes-256-ctr',process.env.KEY || 'hqtoanhq')
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec
}

module.exports = (req, res) => {
  if (!req.query.hash) throw new Error()
  const upstream = JSON.parse(decrypt(req.query.hash))

  delete req.query.hash
  // delete req.query.driveid
  req.query.driveid = upstream.driveid
  req.query.ip = upstream.ip
  const query = qs.stringify(req.query)
  const originVideo = {
    url: `${upstream.domain}/videoplayback?${query}`,
    cookie: upstream.cookie
  }

  const headers = Object.assign({}, req.headers, {
    cookie: originVideo.cookie
  })

  // do not let upstream know about host and referer
  delete headers.host
  delete headers.referer

  got.stream(originVideo.url, { headers })
    .on('response', (response) => {
      res.statusCode = response.statusCode
      Object.keys(response.headers).forEach(key => {
        res.setHeader(key, response.headers[key])
      })
    })
    .on('error', handleError)
    .pipe(res)
}
