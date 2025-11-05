import { Router } from "express";
import { auth, AuthRequest } from "../middleware/auth";
import { AppDataSource } from "../data-source";
import { Notification } from "../entity/Notification";
import { sendMail } from "../mailer";
import { sendSms, sendWhatsApp } from "../twilio";

const router = Router();
const notifRepo = AppDataSource.getRepository(Notification);

router.post("/create", auth, async (req: AuthRequest, res) => {
  try {
    const { to, subject, body, sendAt, smsNumber, whatsAppNumber } = req.body;

    const notification = notifRepo.create({
      user: req.user!,
      to: to || smsNumber || whatsAppNumber,
      subject,
      body,
      sendAt: sendAt ? new Date(sendAt) : new Date(),
      sent: false,
    });
    await notifRepo.save(notification);

    const now = new Date();
    if (!sendAt || new Date(sendAt) <= now) {
      try {
        if (to) {
          await sendMail({ to, subject, text: body });
          console.log(`📧 Email sent to ${to}`);
        }
      } catch (err) {
        console.error("❌ Email send failed:", err);
      }

      try {
        if (smsNumber) {
          await sendSms({ to: smsNumber, body });
          console.log(`📱 SMS sent to ${smsNumber}`);
        }
      } catch (err) {
        console.error("❌ SMS send failed:", err);
      }

      try {
        if (whatsAppNumber) {
          await sendWhatsApp({ to: whatsAppNumber, body });
          console.log(`💬 WhatsApp sent to ${whatsAppNumber}`);
        }
      } catch (err) {
        console.error("❌ WhatsApp send failed:", err);
      }

      notification.sent = true;
      notification.sentAt = new Date();
      await notifRepo.save(notification);
    }

    res.json({ success: true, notification });
  } catch (err) {
    console.error("❌ Error creating notification (outer):", err);
    res.status(500).json({ error: "Server error", details: (err as Error).message });
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
