const express = require('express')
const axios = require('axios')
const app = express()
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', adapter: 'louvre' }))

// Simple stub search endpoint — to be implemented to call Louvre API
app.post('/search', async (req, res) => {
  // echo back the query for now
  const { query, limit = 10 } = req.body || {}
  return res.json({ source: 'louvre', query, results: [], limit })
})

app.get('/artworks/:id', async (req, res) => {
  const { id } = req.params
  // stubbed response
  res.json({ source: 'louvre', id, title: null, metadata: {} })
})

const port = process.env.PORT || 3014
app.listen(port, () => console.log(`Louvre adapter listening on ${port}`))
