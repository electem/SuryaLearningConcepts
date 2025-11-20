const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const movieRoutes = require('./routes/movies');
const bookingRoutes = require('./routes/bookings');

// health
app.get('/health',(req,res)=>res.send("server is running fine"))

app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);

// Connect to MongoDB for bookings
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
