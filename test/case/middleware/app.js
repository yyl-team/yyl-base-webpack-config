const express = require('express')
const serveIndex = require('serve-index')
const serveStatic = require('serve-static')
const path = require('path')
const fs = require('fs')



function start () {
  const app = express()
  const rootPath = path.join(__dirname, './dist')
  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath)
  }

  app.use(serveStatic(rootPath))
  app.use(serveStatic(rootPath))
  return app
}

module.exports = {
  start
}