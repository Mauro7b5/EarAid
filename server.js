const express = require("express")
const path = require("path")
const https = require("https")
const fs = require("fs")

const app = express()
const port = process.env.port || 443

const options = {
  key: fs.readFileSync(path.join(__dirname, "HTTPS", "private.key")),
  cert: fs.readFileSync(path.join(__dirname, "HTTPS", "certificate.crt"))
}

app.use(express.static(path.join(__dirname, "public")))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get('/help', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "help.html"))
})

https.createServer(options, app).listen(port, () => {
    console.log(`HTTPS server listening on port: ${port}`)
})