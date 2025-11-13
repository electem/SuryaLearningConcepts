// routes/payments.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js"; // ✅ Import Cart model so we can clear it

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===========================================================
// ✅ CREATE CHECKOUT SESSION
// ===========================================================
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, userInfo = {}, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    // Create Stripe line_items
    const line_items = items.map((it) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: it.name,
          metadata: { productId: it.productId },
        },
        unit_amount: Math.round(it.price * 100),
      },
      quantity: it.quantity,
    }));

    // ✅ Only send small metadata — avoid JSON overflow (>500 chars)
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      metadata: {
        userId: userId || "guest",
        name: userInfo.name || "",
        phone: userInfo.phone || "",
        address: userInfo.address || "",
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Create session error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===========================================================
// ✅ GET SESSION STATUS (For success page)
// ===========================================================
router.get("/session-status", async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "line_items", "customer_details"],
    });

    res.json({
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
      payment_status: session.payment_status,
      line_items: session.line_items?.data || [],
    });
  } catch (err) {
    console.error("Error retrieving session:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===========================================================
// ✅ STRIPE WEBHOOK — Create Order & Clear Cart
// ===========================================================
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!webhookSecret) {
        return res.status(400).send("⚠️ Webhook secret missing");
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.log("⚠️ Webhook signature verification failed:", err.message);
      return res.sendStatus(400);
    }

    // ✅ Handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;

      try {
        // 🛒 Get cart items for this user
        const cartItems = await Cart.find({ userId });

        if (!cartItems.length) {
          console.log("⚠️ No cart found for user:", userId);
        }

        // ✅ Create new Order
        const newOrder = await Order.create({
          userId: userId !== "guest" ? userId : null, // avoid invalid ObjectId
          items: cartItems.map((it) => ({
            productId: it.productId,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
          })),
          total: session.amount_total / 100,
          currency: session.currency,
          status: "paid",
          paymentIntentId: session.payment_intent,
          userInfo: {
            name: session.metadata.name,
            phone: session.metadata.phone,
            address: session.metadata.address,
          },
        });

        console.log("✅ Order created from webhook:", newOrder._id);

        // 🧹 Clear user’s cart after successful order
        if (userId !== "guest") {
          await Cart.deleteMany({ userId });
          console.log("🧺 Cart cleared for user:", userId);
        }
      } catch (err) {
        console.error("❌ Error creating order from webhook:", err);
      }
    }

    res.status(200).json({ received: true });
  }
);

export default router;
