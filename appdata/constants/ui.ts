
import { GameNotification } from '../types';

export const NOTIFICATION_ICONS: Record<GameNotification['type'], string> = {
  info: 'INFO',
  success: 'CHECK_CIRCLE',
  error: 'X_CIRCLE',
  warning: 'WARNING',
};
