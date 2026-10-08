import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  AlertTriangle,
  Info,
  Shield,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function NotificationsPage({
  searchParams
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await requireSession();
  const { filter } = await searchParams;

  const whereClause: any = { userId: session.user.id };
  if (filter === "unread") {
    whereClause.readAt = null;
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    }),
    prisma.notification.count({
      where: { userId: session.user.id, readAt: null }
    })
  ]);

  async function markAsRead(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() }
    });
    revalidatePath("/notifications");
  }

  async function markAllAsRead() {
    "use server";
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() }
    });
    revalidatePath("/notifications");
  }

  async function deleteNotification(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.notification.delete({
      where: { id }
    });
    revalidatePath("/notifications");
  }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "RISK_ALERT":
        return <AlertTriangle size={20} className="text-rose-600" />;
      case "APPOINTMENT_REMINDER":
        return <Calendar size={20} className="text-emerald-600" />;
      case "SYSTEM":
        return <Shield size={20} className="text-indigo-600" />;
      default:
        return <Info size={20} className="text-sky-600" />;
    }
  };

  const getNotifBg = (type: string) => {
    switch (type) {
      case "RISK_ALERT":
        return "bg-rose-50 border-rose-100";
      case "APPOINTMENT_REMINDER":
        return "bg-emerald-50 border-emerald-100";
      case "SYSTEM":
        return "bg-indigo-50 border-indigo-100";
      default:
        return "bg-sky-50 border-sky-100";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Bell className="text-emerald-600" /> Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Activity updates, appointment reminders, and clinic alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <form action={markAllAsRead}>
              <SubmitButton
                loadingText="Marking all..."
                icon={CheckCheck}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Mark all as read
              </SubmitButton>
            </form>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Link
          href="/notifications"
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            !filter
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          All Notifications ({notifications.length})
        </Link>
        <Link
          href="/notifications?filter=unread"
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === "unread"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Unread Only ({unreadCount})
        </Link>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No Notifications</h3>
            <p className="text-slate-500 text-sm mt-1">
              {filter === "unread"
                ? "You've read all your notifications!"
                : "You don't have any notifications right now."}
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.readAt;
            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUnread
                    ? "bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-100"
                    : "bg-slate-50/70 border-slate-200 opacity-90"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${getNotifBg(
                      notif.type
                    )}`}
                  >
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {notif.type.replace(/_/g, " ")}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      )}
                      <span className="text-slate-400 text-xs">&bull;</span>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      {notif.title}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {notif.body}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  {isUnread && (
                    <form action={markAsRead}>
                      <input type="hidden" name="id" value={notif.id} />
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Mark Read
                      </button>
                    </form>
                  )}
                  <form action={deleteNotification}>
                    <input type="hidden" name="id" value={notif.id} />
                    <button
                      type="submit"
                      title="Delete notification"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
