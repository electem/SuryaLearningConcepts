const express = require('express');
const axios = require('axios');
const router = express.Router();

// Base URL for JSON Fakery movies
const JSON_FAKERY_URL = 'https://jsonfakery.com/movies/paginated';

/**
 * GET /api/movies
 * Query params: page (optional)
 */
router.get('/', async (req, res) => {
  try {
    const { page } = req.query;
    const url = page
      ? `${JSON_FAKERY_URL}?page=${page}`
      : JSON_FAKERY_URL;

    const response = await axios.get(url);
    const data = response.data;

    // Example of what JSON Fakery returns (you should log once to verify)
    // {
    //   "current_page": 1,
    //   "data": [ { movie objects } ],
    //   "first_page_url": "...",
    //   "from": 1,
    //   "last_page": 100,
    //   "next_page_url": "...",
    //   "prev_page_url": null,
    //   ...
    // }

    // Return the paginated data as is (or you can transform)
    res.json(data);
  } catch (err) {
    console.error('Error fetching movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

module.exports = router;
