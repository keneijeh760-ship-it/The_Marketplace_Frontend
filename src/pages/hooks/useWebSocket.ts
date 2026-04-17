import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export interface Notification {
  type: string;
  message: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketReturn {
  connected: boolean;
  notifications: Notification[];
  clearNotifications: () => void;
}

export const useWebSocket = (userId: number | null): UseWebSocketReturn => {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!userId) return;

    const rawWsUrl = import.meta.env.VITE_WS_URL || '';
    const wsUrl =
      rawWsUrl.trim().length === 0
        ? (import.meta.env.PROD ? '/bff/ws' : 'http://localhost:5000/ws')
        : (import.meta.env.PROD && /^http:\/\//i.test(rawWsUrl) ? '/bff/ws' : rawWsUrl);
    const socket = new SockJS(wsUrl);
    
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ WebSocket Connected');
      setConnected(true);

      client.subscribe(`/queue/${userId}/notifications`, (message) => {
        const notification: Notification = JSON.parse(message.body);
        console.log('📬 Notification:', notification);
        
        setNotifications((prev) => [notification, ...prev]);
        
        // Browser notification
        if (Notification.permission === 'granted') {
          new Notification(notification.type.replace('_', ' '), {
            body: notification.message,
          });
        }
      });
    };

    client.onDisconnect = () => {
      console.log('❌ WebSocket Disconnected');
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      client.deactivate();
    };
  }, [userId]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return { connected, notifications, clearNotifications };
};