// routes/auth.js
const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_REDIRECT_URI = process.env.BACKEND_REDIRECT_URI;

// STEP 1: Redirect to Google
router.get("/google", (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${BACKEND_REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
});

// STEP 2: Callback
router.get("/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange code for token
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: BACKEND_REDIRECT_URI,
      grant_type: "authorization_code"
    });

    const accessToken = tokenRes.data.access_token;

    // Get user info
    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const { id, email, name, picture } = userRes.data;

    // Save user
    let user = await User.findOne({ googleId: id });

    if (!user) {
      user = await User.create({
        googleId: id,
        email,
        name,
        picture
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

   res.cookie("token", token, {
     httpOnly: true,
     secure: false, // true in production (https)
     sameSite: "lax",
   });

   res.redirect(`${FRONTEND_URL}/dashboard`);

  } catch (err) {
    console.log(err);
    res.send("Error");
  }
});

module.exports = router;