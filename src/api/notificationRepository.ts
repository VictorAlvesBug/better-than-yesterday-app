import { NotificationPayload } from '@/types/notification.type';
import { backendApi } from '../utils/apiUtils';

export type AppNotification = {
  id: string;
  planId: string;
  kind: string;
  message: string;
  createdAt: string;
  payload?: NotificationPayload;
};

export default function createNotificationRepository() {
  const generate = async (userId: string): Promise<AppNotification[]> => {
    const data = await backendApi.generateNotifications(userId);
    return data as AppNotification[];
  };

  return { generate };
}
