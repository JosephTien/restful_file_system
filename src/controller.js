"use strict"

const fileUtils = require('./file_utils')
const AsyncLock = require('async-lock');
const lock = new AsyncLock()

const apiFile = (req, res) => {
  var path = req.path.split('/').slice(1).join('/')
  lock.acquire(path, async () => {
    switch (req.method) {
      case 'GET':
        let file = await fileUtils.read(path, req.query)
        if (file) {
          res.send(file);
        } else {
          res.sendStatus(404)
        }
        break;
      case 'POST':
        if (await fileUtils.create(path, req.body.file)) {
          res.sendStatus(200)
        } else {
          res.sendStatus(404)
        }
        break;
      case 'PATCH':
        if (await fileUtils.update(path, req.body.file)) {
          res.sendStatus(200)
        } else {
          res.sendStatus(404)
        }
        break;
      case 'DELETE':
        if (await fileUtils.remove(path)) {
          res.sendStatus(200)
        } else {
          res.sendStatus(404)
        }
        break;
      default:
        res.sendStatus(404)
    }
  })
}

const apiDefault = (_, res) => {
  res.sendStatus(404)
}

module.exports = { apiFile, apiDefault }
