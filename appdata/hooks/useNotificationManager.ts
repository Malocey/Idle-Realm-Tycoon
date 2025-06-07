
import { useEffect } from 'react';
import { GameState, GameAction, GameNotification } from '../types';

const NOTIFICATION_DISPLAY_DURATION = 7000; // Display for 7 seconds

export const useNotificationManager = (
  dispatch: React.Dispatch<GameAction>,
  notifications: GameState['notifications']
) => {
  useEffect(() => {
    const activeTimers: number[] = [];

    notifications.forEach(notification => {
      const timeSinceNotificationCreated = Date.now() - notification.timestamp;
      const remainingTime = NOTIFICATION_DISPLAY_DURATION - timeSinceNotificationCreated;

      if (remainingTime > 0) {
        const dismissTimer = window.setTimeout(() => {
          dispatch({ type: 'DISMISS_NOTIFICATION', payload: notification.id });
        }, remainingTime);
        activeTimers.push(dismissTimer);
      } else {
        // If for some reason the notification is already older than its display duration when this effect runs,
        // dismiss it immediately. This can happen if the hook re-runs after a delay.
        dispatch({ type: 'DISMISS_NOTIFICATION', payload: notification.id });
      }
    });

    return () => {
      activeTimers.forEach(timerId => clearTimeout(timerId));
    };
  }, [notifications, dispatch]);
};
