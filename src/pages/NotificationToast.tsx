import { useEffect } from 'react';
import type { Notification } from '../pages/hooks/useWebSocket';

interface Props {
  notifications: Notification[];
  onDismiss: (index: number) => void;
}

export const NotificationToast = ({ notifications, onDismiss }: Props) => {
  useEffect(() => {
    const timers = notifications.map((_, index) =>
      setTimeout(() => onDismiss(index), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {notifications.map((notification, index) => (
        <div
          key={index}
          onClick={() => onDismiss(index)}
          style={{
            backgroundColor: getBackgroundColor(notification.type),
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            minWidth: '320px',
            maxWidth: '400px',
            cursor: 'pointer',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
            {getIcon(notification.type)} {notification.type.replace('_', ' ')}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.95 }}>
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
};

const getBackgroundColor = (type: string) => {
  switch (type) {
    case 'ORDER_UPDATE': return '#667eea';
    case 'BALANCE_UPDATE': return '#10b981';
    case 'NEW_ORDER': return '#f59e0b';
    case 'PAYMENT': return '#3b82f6';
    default: return '#6b7280';
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case 'ORDER_UPDATE': return '📦';
    case 'BALANCE_UPDATE': return '💰';
    case 'NEW_ORDER': return '🛒';
    case 'PAYMENT': return '💳';
    default: return '🔔';
  }
};