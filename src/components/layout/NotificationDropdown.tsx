import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { NotificationItem } from "../../types";

interface NotificationDropdownProps {
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationDropdown({
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed sm:absolute top-16 sm:top-12 left-4 sm:left-0 right-4 sm:right-auto z-50 w-auto sm:w-96 max-w-none sm:max-w-[calc(100vw-2rem)] h-auto max-h-[400px] rounded-xl bg-white border border-stone-200 shadow-xl text-stone-900 overflow-hidden flex flex-col"
      dir="rtl"
    >
      {/* Header */}
      <div className="px-4 py-3.5 bg-white border-b border-stone-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm sm:text-base text-stone-900">
            الإشعارات
          </span>
          {unreadCount > 0 && (
            <span className="bg-stone-900 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-stone-700 hover:text-stone-950 transition-colors flex items-center gap-1 font-bold cursor-pointer"
            >
              <Check size={14} />
              <span>قراءة الكل</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="إغلاق الإشعارات"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto max-h-[320px] divide-y divide-stone-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-stone-500 font-bold text-xs sm:text-sm">
            لا توجد إشعارات حالياً
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onMarkAsRead(notif.id)}
              className={`p-4 hover:bg-stone-50 transition-all flex gap-3 cursor-pointer ${
                notif.unread ? "bg-stone-50/60" : "bg-white"
              }`}
            >
              {/* Status unread dot */}
              <div className="shrink-0 pt-1.5">
                <span
                  className={`block w-2 h-2 rounded-full ${notif.unread ? "bg-stone-900" : "bg-stone-300"}`}
                />
              </div>

              {/* Copy */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${notif.unread ? "text-stone-900 font-bold" : "text-stone-700 font-medium"}`}
                >
                  {notif.text}
                </p>
                <span className="text-[10px] sm:text-xs text-stone-400 font-semibold mt-1 block">
                  {notif.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
