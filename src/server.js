"use strict"

const ctrl = require('./controller')
const app = require('express')()
const bp = require('body-parser')

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use('/file', ctrl.apiFile)
app.use(ctrl.apiDefault)

var server = app.listen(process.env.PORT || 8080, function () {
  console.log("Server started on port %s", server.address().port)
})

module.exports = app
