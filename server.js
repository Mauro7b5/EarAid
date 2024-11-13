// server.js
const express = require("express")
const path = require("path")
const app = express()
const port = 11000

app.use(express.static(path.join(__dirname, "public")))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})