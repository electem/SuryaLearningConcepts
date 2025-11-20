const express = require("express");
const Booking = require("../models/Booking");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();


// ================================
// GET ALL BOOKINGS
// ================================
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================================
// DELETE BOOKING
// ================================
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================================
// CREATE STRIPE CHECKOUT SESSION
// ================================
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { name, movieId, movieTitle, tickets, amount } = req.body;

    if (!name || !movieId || !movieTitle || !tickets || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: movieTitle },
            unit_amount: amount * 100
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/failed`
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================================
// SAVE BOOKING (FINAL SOLUTION)
// ================================
router.post("/save-booking", async (req, res) => {
  try {
    const {
      name,
      movieId,
      movieTitle,
      tickets,
      amount,
      stripeSessionId,
      paymentStatus
    } = req.body;

    if (!name || !movieId || !movieTitle || !tickets || !stripeSessionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const booking = await Booking.findOneAndUpdate(
      { stripeSessionId },                // Find by stripe session
      {
        $setOnInsert: {
          name,
          movieId,
          movieTitle,
          tickets: Number(tickets),
          amount: Number(amount),
          paymentStatus,
          stripeSessionId
        }
      },
      {
        new: true,        // return the document
        upsert: true,     // insert if not exists
      }
    );

    res.json(booking);

  } catch (err) {
    console.error("Error saving booking:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
