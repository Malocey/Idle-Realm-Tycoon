import React from 'react';
import { useGameContext } from '../context';
import { ICONS } from './Icons';
import { NOTIFICATION_ICONS } from '../constants';

const NotificationArea: React.FC = () => {
  const { gameState, dispatch } = useGameContext();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 w-full max-w-xs sm:max-w-sm">
      {gameState.notifications.slice(0,5).map(notification => {
        const Icon = ICONS[notification.iconName || NOTIFICATION_ICONS[notification.type]];
        const colors = {
          info: 'bg-sky-600 border-sky-500',
          success: 'bg-green-600 border-green-500',
          error: 'bg-red-600 border-red-500',
          warning: 'bg-amber-600 border-amber-500',
        }
        return (
          <div 
            key={notification.id} 
            className={`p-3 rounded-lg shadow-xl text-white text-sm flex items-start space-x-2 border ${colors[notification.type]} glass-effect animate-notification-enter`}
          >
            {Icon && <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />}
            <span className="flex-grow">{notification.message}</span>
            <button onClick={() => dispatch({type: 'DISMISS_NOTIFICATION', payload: notification.id})} className="text-xl font-bold leading-none hover:text-slate-300 active:text-slate-400 transition-colors">&times;</button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationArea;