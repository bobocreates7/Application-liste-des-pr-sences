import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {
  async checkAndRequestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }
    try {
      const { display } = await LocalNotifications.checkPermissions();
      if (display === 'granted') return true;
      
      if (display === 'prompt') {
        const { display: newDisplay } = await LocalNotifications.requestPermissions();
        return newDisplay === 'granted';
      }
      return false;
    } catch (e) {
      console.error('Error checking notification permissions', e);
      return false;
    }
  },

  async scheduleOverdueReminder(pendingCount: number) {
    try {
      const hasPermission = await this.checkAndRequestPermissions();
      if (!hasPermission) return;

      // Cancel previous reminders (IDs 1 to 7)
      await this.cancelReminders();

      // Create a notification channel for Android 8+
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: 'reminders',
          name: 'Rappels',
          description: 'Rappels pour la validation des présences',
          importance: 5, // High importance (heads up + sound)
          visibility: 1, // Public
        });
      }

      const notifications = [];
      const now = new Date();

      for (let i = 0; i < 7; i++) {
        const scheduleDate = new Date();
        scheduleDate.setDate(scheduleDate.getDate() + i);
        scheduleDate.setHours(10, 0, 0, 0);

        // If it's today
        if (i === 0) {
          // Skip if all tasks are done today
          if (pendingCount <= 0) continue;
          // Skip if it's already past 10:00 today
          if (now.getTime() > scheduleDate.getTime()) continue;
        }

        notifications.push({
          title: 'Appel en attente',
          body: i === 0 
            ? `Il vous reste ${pendingCount} classe(s) à valider aujourd'hui.`
            : `N'oubliez pas de valider vos appels aujourd'hui.`,
          id: i + 1,
          schedule: { at: scheduleDate },
          sound: null,
          channelId: 'reminders',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        });
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} reminders.`);
      }
    } catch (e) {
      console.error('Error scheduling notification', e);
    }
  },

  async cancelReminders() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (e) {
      console.error('Error canceling notifications', e);
    }
  }
};
