const express = require("express")
const path = require("path")

const app = express()
const port = process.env.PORT || 13000

app.use(express.static(path.join(__dirname, "public")))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get('/help', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "help.html"))
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})