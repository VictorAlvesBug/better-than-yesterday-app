import { backendApi } from '../utils/apiUtils';

export type AppNotification = {
  id: string;
  planId: string;
  kind: string;
  message: string;
  createdAt: string;
};

export default function createNotificationRepository() {
  const generate = async (userId: string): Promise<AppNotification[]> => {
    return backendApi.generateNotifications(userId);
  };

  return { generate };
}
