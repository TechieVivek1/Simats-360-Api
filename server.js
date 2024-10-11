const express = require('express')
const app = express()
const body = require('body-parser')

app.use(express.json())
app.use(body.json())

app.get('/', function (req, res) {
  res.json(
    { "status": true,
        "message" : "hello world"

    })
})

app.listen(3000)

console.log("Listen on 3000");