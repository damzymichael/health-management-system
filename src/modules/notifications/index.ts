import { prisma } from "@/lib/auth";
import { NotifChannel } from "@prisma/client";

interface SendNotificationArgs {
  userId: string;
  channel?: NotifChannel;
  type: string;
  title: string;
  body: string;
  relatedType?: string;
  relatedId?: string;
}

export async function sendNotification(args: SendNotificationArgs) {
  const channel = args.channel || "IN_APP";
  
  // 1. Create in database
  const notif = await prisma.notification.create({
    data: {
      userId: args.userId,
      channel,
      type: args.type,
      title: args.title,
      body: args.body,
      relatedType: args.relatedType,
      relatedId: args.relatedId,
      status: channel === "IN_APP" ? "PENDING" : "SENT", // In-app is pending until read
      sentAt: channel !== "IN_APP" ? new Date() : null,
    }
  });

  // 2. Dispatch via provider if not IN_APP
  if (channel !== "IN_APP") {
    const user = await prisma.user.findUnique({ where: { id: args.userId } });
    if (user) {
      if (process.env.NOTIFICATION_PROVIDER === "console") {
        console.log(`[Notification - ${channel}] To: ${user.email} | Title: ${args.title} | Body: ${args.body}`);
      }
    }
  }

  return notif;
}
