import { Router } from "express";
import { auth, AuthRequest } from "../middleware/auth";
import { AppDataSource } from "../data-source";
import { Notification } from "../entity/Notification";
import { sendMail } from "../mailer"; // ✅ make sure this exists

const router = Router();
const notifRepo = AppDataSource.getRepository(Notification);

router.post("/create", auth, async (req: AuthRequest, res) => {
  try {
    const { to, subject, body, sendAt } = req.body;

    // Create notification record
    const notification = notifRepo.create({
      user: req.user!,
      to,
      subject,
      body,
      sendAt: sendAt ? new Date(sendAt) : new Date(),
      sent: false,
    });
    await notifRepo.save(notification);

    // 📨 Instant send if sendAt is now or in the past
    const now = new Date();
    if (!sendAt || new Date(sendAt) <= now) {
      try {
        await sendMail({ to, subject, text: body });
        notification.sent = true;
        notification.sentAt = new Date();
        await notifRepo.save(notification);
        console.log(`✅ Instant email sent to ${to}`);
      } catch (err) {
        console.error(`❌ Error sending instant email to ${to}:`, err);
      }
    }

    res.json({ notification });
  } catch (err) {
    console.error("❌ Error creating notification:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const list = await notifRepo.find({
      where: { user: { id: req.user!.id } },
      order: { id: "DESC" },
    });
    res.json({ notifications: list });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

