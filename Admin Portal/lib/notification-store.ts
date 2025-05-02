import { create } from "zustand";

export type Notification = {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
};

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "New restock request #1234 has been created",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    read: false,
  },
  {
    id: "2",
    message: "Restock request #1230 has been approved",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
  },
  {
    id: "3",
    message: "Inventory alert: Product ITM-789 is running low",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: true,
  },
  {
    id: "4",
    message: "Monthly inventory report is ready for review",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };

    set((state: NotificationState) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id: string) => {
    set((state: NotificationState) => {
      const updatedNotifications = state.notifications.map(
        (notification: Notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
      );

      const unreadCount = updatedNotifications.filter(
        (n: Notification) => !n.read
      ).length;

      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  },

  markAllAsRead: () => {
    set((state: NotificationState) => ({
      notifications: state.notifications.map((notification: Notification) => ({
        ...notification,
        read: true,
      })),
      unreadCount: 0,
    }));
  },

  fetchNotifications: async () => {
    // In a real app, this would be an API call
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    set({
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((n: Notification) => !n.read)
        .length,
    });
  },
}));
