import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { MaintenanceSchedule } from '@/types';
import { addDays, addWeeks, addMonths, parseISO } from 'date-fns';

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleMaintenanceNotification = async (
  schedule: MaintenanceSchedule,
  machineName: string
): Promise<string> => {
  try {
    const notificationId = parseInt(schedule.id);
    const dueDate = parseISO(schedule.nextDueDate);

    const notification: ScheduleOptions = {
      notifications: [
        {
          id: notificationId,
          title: 'تذكير صيانة',
          body: `حان موعد صيانة ${machineName}`,
          schedule: {
            at: dueDate,
            allowWhileIdle: true,
          },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: {
            scheduleId: schedule.id,
            machineId: schedule.machineId,
          },
        },
      ],
    };

    await LocalNotifications.schedule(notification);
    return notificationId.toString();
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

export const scheduleRecurringNotification = async (
  schedule: MaintenanceSchedule,
  machineName: string
): Promise<string> => {
  try {
    // Cancel existing notification if any
    if (schedule.notificationId) {
      await cancelNotification(schedule.notificationId);
    }

    // Schedule new notification
    const notificationId = await scheduleMaintenanceNotification(schedule, machineName);

    return notificationId;
  } catch (error) {
    console.error('Error scheduling recurring notification:', error);
    throw error;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    const id = parseInt(notificationId);
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id }))
      });
    }
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

export const getNextMaintenanceDate = (schedule: MaintenanceSchedule): Date => {
  const currentDate = parseISO(schedule.nextDueDate);
  
  switch (schedule.recurrence) {
    case 'Daily':
      return addDays(currentDate, 1);
    case 'Weekly':
      return addWeeks(currentDate, 1);
    case 'Monthly':
      return addMonths(currentDate, 1);
    case 'Custom':
      return addDays(currentDate, schedule.intervalDays || 7);
    default:
      return currentDate;
  }
};
