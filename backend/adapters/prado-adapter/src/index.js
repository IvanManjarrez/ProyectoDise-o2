const express = require('express')
const axios = require('axios')
const app = express()
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', adapter: 'prado' }))

app.post('/search', async (req, res) => {
  const { query, limit = 10 } = req.body || {}
  return res.json({ source: 'prado', query, results: [], limit })
})

app.get('/artworks/:id', async (req, res) => {
  const { id } = req.params
  res.json({ source: 'prado', id, title: null, metadata: {} })
})

const port = process.env.PORT || 3015
app.listen(port, () => console.log(`Prado adapter listening on ${port}`))
