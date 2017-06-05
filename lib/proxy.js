'use strict'

const crypto = require('crypto');
const qs = require('querystring')

const createProxyVideo = (video, cookie) => {
  return Object.assign({}, video, {
    provider: 'proxy',
    src: toProxyURL(video.originSrc, cookie)
  })
}

const toProxyURL = (url, cookie) => {
  const query = qs.parse(url)
  const hash = encrypt(JSON.stringify({
    cookie,
    domain: url.split('/videoplayback?')[0],
    driveid: query.driveid,
    ip: query.ip
  }))
  delete query.driveid
  delete query.ip
  if(process.env.SSL === 'true')
    return `https://${process.env.VIRTUAL_HOST}/videoplayback?hash=${hash}&` +  decodeURIComponent(qs.stringify(query)).split('?').pop()
  return `http://${process.env.VIRTUAL_HOST}/videoplayback?hash=${hash}&` + decodeURIComponent(qs.stringify(query)).split('?').pop()
}

module.exports = {
  createProxyVideo: createProxyVideo
}
const  encrypt = text => {
  var cipher = crypto.createCipher('aes-256-ctr',process.env.KEY || 'hqtoanhq')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted
}
