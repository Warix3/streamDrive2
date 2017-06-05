'use strict'

const qs = require('querystring')
const base64 = require('base64url')
const fs = require('fs')
const got = require('got')
const handleError = require('../handle-error')
const fetchDriveEndpoint = require('../fetch-drive-endpoint')
const proxy = require('../proxy')
const extractVideos = require('../extract-videos')

module.exports = (req, res) => {
  const direct = ''
  if (!req.params.id) throw new Error()
  const driveId = req.params.id
  if (fs.existsSync("./lib/cache/" + driveId + ".txt")) {
    fs.readFile("./lib/cache/" + driveId + ".txt", 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }
      const upstream = JSON.parse(base64.decode(data))
        got.stream(upstream.video, {
          headers: {
            cookie: upstream.cookie
          }
        })
        .on('response', (response) => {
          res.statusCode = response.statusCode
          Object.keys(response.headers).forEach(key => {
            res.setHeader(key, response.headers[key])
          })
        })
        .on('error', handleError)
        .pipe(res)
          
    });
  } else {
    fetchDriveEndpoint(driveId)
      .then(
      response => {
        const direct = extractVideos(response.body)
        direct.map(video => {
          if (video.res === 360) {
            const data = base64(JSON.stringify({
              video: video.originSrc,
              cookie: response.headers['set-cookie']
            }))
            fs.writeFile("./lib/cache/" + driveId + ".txt", data, function (err) {
              if (err) {
                return console.log(err);
              }
            })
            got.stream(video.originSrc, {
              headers: {
                cookie: response.headers['set-cookie']
              }
            })
              .on('response', (response) => {
                res.statusCode = response.statusCode
                Object.keys(response.headers).forEach(key => {
                  res.setHeader(key, response.headers[key])
                })
              })
              .on('error', handleError)
              .pipe(res)
          }
        })
      }
      )
      .catch((err) => {

      })
  }

}