const mongoose = require('mongoose');

const castSchema = new mongoose.Schema({
  id: String,
  name: String,
  original_name: String,
  profile_path: String,
  character: String,
  popularity: String,
  created_at: Date,
  updated_at: Date
});

const movieSchema = new mongoose.Schema({
  movie_id: { type: Number, unique: true }, // id from external API for sync
  title: { type: String, required: true }, // fallback title
  original_title: { type: String },        // from API
  overview: { type: String },
  poster_path: { type: String },
  backdrop_path: { type: String },
  release_date: { type: String },
  vote_average: { type: Number, default: 0 },
  vote_count: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
  casts: [castSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
