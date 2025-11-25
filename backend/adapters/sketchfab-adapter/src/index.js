const express = require('express')
const axios = require('axios')
const app = express()
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', adapter: 'sketchfab' }))

app.post('/search', async (req, res) => {
  const { query, limit = 10 } = req.body || {}
  return res.json({ source: 'sketchfab', query, results: [], limit })
})

app.get('/models/:id', async (req, res) => {
  const { id } = req.params
  res.json({ source: 'sketchfab', id, modelUrl: null })
})

const port = process.env.PORT || 3016
app.listen(port, () => console.log(`Sketchfab adapter listening on ${port}`))
