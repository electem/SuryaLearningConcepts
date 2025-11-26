const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");
const { protect, authorizeRoles } = require("../middleware/auth");
const axios = require("axios");

// GET all movies (user)
router.get("/all", protect, async (req, res) => {
  try {
    const { search = "", sortBy = "createdAt", order = "desc", page = 1, limit = 20 } = req.query;

    const query = {
      title: { $regex: search, $options: "i" }, // case-insensitive search
    };

    const movies = await Movie.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ data: movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all movies (admin)
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { search = "", sortBy = "createdAt", order = "desc", page = 1, limit = 20 } = req.query;

    const query = {
      title: { $regex: search, $options: "i" },
    };

    const movies = await Movie.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST add new movie
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { title, overview, poster_path, release_date, vote_average } = req.body;

    // Validate required fields
    if (!title || !overview || !poster_path || !release_date || vote_average == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const movie = new Movie({
      movie_id: Date.now(), // unique numeric ID
      title,
      overview,
      poster_path,
      release_date,
      vote_average,
      createdBy: req.user._id
    });

    await movie.save();
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT update movie
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE movie
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST sync movies from external API
router.post("/sync", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const page = req.body.page || 1;
    const response = await axios.get(`https://jsonfakery.com/movies/paginated?page=${page}`);
    const moviesData = response.data.data;

    for (let m of moviesData) {
      // Map API fields to schema
      await Movie.findOneAndUpdate(
        { movie_id: m.movie_id }, 
        {
          movie_id: m.movie_id,
          title: m.original_title,
          overview: m.overview,
          poster_path: m.poster_path,
          release_date: m.release_date,
          vote_average: m.vote_average,
          createdBy: req.user._id
        }, 
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, synced: moviesData.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
