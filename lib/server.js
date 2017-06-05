'use strict'

const http = require('http')
const app = require('router')()

// middleware
app.use(require('./parse-query'))

// hide all url from spiderbot
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.end('User-agent: *\nDisallow: /')
})

// server endpoint
app.get('/videoplayback', require('./router/videoplayback'))
app.get('/get/:id',
  (req, res, next) => {
    if ( req.query.token !== process.env.TOKEN ) {
      return res.end('Invalid token')
    }
    next()
  },
  require('./router/getVideos')
)
app.get('/direct/:id', require('./router/direct'))
module.exports = http.createServer((req, res) => {
  app(req, res, require('finalhandler')(req, res))
})
