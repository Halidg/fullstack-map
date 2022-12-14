const express = require('express')
const router = express.Router()
const url = require('url')
const axios = require('axios')

router.get("/:query", async (req, res) => {
  try {
    const params = new URLSearchParams({
      access_token: process.env.API_KEY,
      ...url.parse(req.url, true).query,
    });
    const query = req.params.query;
    const results = await axios(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?${params}`
    );
   
    results.data.features.forEach((item) => {
      item.context.forEach((type) => {
        if (type.id.includes("place")) {
          item.city = item.text;
        }
        if (type.id.includes("region")) {
          item.state = item.text;
        }
      });
    });

    const data = results.data;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router