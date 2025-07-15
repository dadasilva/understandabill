import { messaging } from './firebase';
import Subscriber from '@/models/Subscriber';
import connectDB from './database';

export interface NotificationData {
  title: string;
  body: string;
  billId?: string;
  congress?: number;
}

export async function sendNotificationsToAllSubscribers(data: NotificationData): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  await connectDB();
  
  const subscribers = await Subscriber.find({ isActive: true });
  const tokens = subscribers.map(sub => sub.fcmToken);
  
  if (tokens.length === 0) {
    return { success: 0, failed: 0, errors: [] };
  }

  const multicastMessage = {
    notification: {
      title: data.title,
      body: data.body,
    },
    data: {
      billId: data.billId || '',
      congress: data.congress?.toString() || '',
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
    tokens,
    android: {
      notification: {
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
    apns: {
      payload: {
        aps: {
          'mutable-content': 1,
        },
      },
    },
  };

  try {
    // Use sendEachForMulticast for v13+
    const response = await messaging.sendEachForMulticast(multicastMessage);
    
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    response.responses.forEach((resp, index) => {
      if (resp.success) {
        success++;
      } else {
        failed++;
        errors.push(`Token ${index}: ${resp.error?.message}`);
        // If token is invalid, remove it from database
        if (resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered') {
          const subscriber = subscribers[index];
          if (subscriber) {
            Subscriber.findByIdAndDelete(subscriber._id).catch(console.error);
          }
        }
      }
    });

    return { success, failed, errors };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      success: 0,
      failed: tokens.length,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

export async function sendNotificationToSubscriber(
  subscriberId: string,
  data: NotificationData
): Promise<boolean> {
  await connectDB();
  
  const subscriber = await Subscriber.findById(subscriberId);
  if (!subscriber || !subscriber.isActive) {
    return false;
  }

  const message = {
    notification: {
      title: data.title,
      body: data.body,
    },
    data: {
      billId: data.billId || '',
      congress: data.congress?.toString() || '',
    },
    token: subscriber.fcmToken,
  };

  try {
    await messaging.send(message);
    return true;
  } catch (error) {
    console.error('Error sending notification to subscriber:', error);
    
    // If token is invalid, deactivate subscriber
    if (error instanceof Error && 
        (error.message.includes('invalid-registration-token') ||
         error.message.includes('registration-token-not-registered'))) {
      await Subscriber.findByIdAndUpdate(subscriberId, { isActive: false });
    }
    
    return false;
  }
} 