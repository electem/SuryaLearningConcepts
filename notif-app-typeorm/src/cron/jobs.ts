import cron from "node-cron";
import { AppDataSource } from "../data-source";
import { Notification } from "../entity/Notification";
import { sendMail } from "../mailer";

export function startCron() {
  const notifRepo = AppDataSource.getRepository(Notification);

  cron.schedule("* * * * *", async () => {
    const due = await notifRepo.find({ where: { sent: false } });
    const now = new Date();
    for (const n of due) {
      if (new Date(n.sendAt) <= now) {
        try {
          await sendMail({ to: n.to, subject: n.subject, text: n.body });
          n.sent = true;
          n.sentAt = new Date();
          await notifRepo.save(n);
          console.log(`✅ Sent email to ${n.to}`);
        } catch (err) {
          console.error(`❌ Error sending ${n.id}:`, err);
        }
      }
    }
  });

  console.log("Cron started: checking every minute.");
}
