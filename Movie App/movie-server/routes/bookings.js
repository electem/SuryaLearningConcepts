const express = require("express");
const Booking = require("../models/Booking");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { protect, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// GET bookings
// - Admin: get all
// - User: only own
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const bookings = await Booking.find().sort({ createdAt: -1 }).populate('user','email name role');
      return res.json(bookings);
    } else {
      const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json(bookings);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE booking - admin OR booking owner
router.delete("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // owner or admin
    if (req.user.role !== 'admin' && String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await booking.remove();
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create-checkout-session stays public (Stripe redirect), but saving booking must record user
router.post("/create-checkout-session",protect, async (req, res) => {
  try {
    const { name, movieId, movieTitle, tickets, amount } = req.body;
      console.log("Incoming checkout request body:", req.body);
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

// save-booking: require auth so we can attach user
router.post("/save-booking", protect, async (req, res) => {
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
      { stripeSessionId },               
      {
        $setOnInsert: {
          user: req.user._id,           // attach user
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
        new: true,
        upsert: true,
      }
    );

    res.json(booking);

  } catch (err) {
    console.error("Error saving booking:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
