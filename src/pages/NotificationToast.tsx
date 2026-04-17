import { useEffect } from "react";
import type { Notification } from "./hooks/useWebSocket";
import { cn } from "@/lib/utils";
import { Package, Wallet, ShoppingCart, CreditCard, Bell, X } from "lucide-react";

interface Props {
  notifications: Notification[];
  onDismiss: (index: number) => void;
}

const iconFor = (type: string) => {
  switch (type) {
    case "ORDER_UPDATE":
      return Package;
    case "BALANCE_UPDATE":
      return Wallet;
    case "NEW_ORDER":
      return ShoppingCart;
    case "PAYMENT":
      return CreditCard;
    default:
      return Bell;
  }
};

export const NotificationToast = ({ notifications, onDismiss }: Props) => {
  useEffect(() => {
    const timers = notifications.map((_, index) => setTimeout(() => onDismiss(index), 5000));
    return () => timers.forEach(clearTimeout);
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed right-4 top-20 z-[100] flex flex-col gap-2">
      {notifications.map((notification, index) => {
        const Icon = iconFor(notification.type);
        return (
          <div
            key={index}
            className={cn(
              "relative min-w-[320px] max-w-md rounded-xl border border-white/10 bg-[#141414] p-4 shadow-2xl",
              "animate-in slide-in-from-right-5 fade-in duration-300"
            )}
          >
            <button
              onClick={() => onDismiss(index)}
              className="absolute right-2 top-2 rounded-lg p-1 text-neutral-500 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                <Icon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="pr-6">
                <div className="text-sm font-semibold text-white">
                  {notification.type.replace("_", " ")}
                </div>
                <div className="mt-1 text-xs text-neutral-400">{notification.message}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
