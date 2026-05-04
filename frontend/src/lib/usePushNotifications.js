import { useState, useCallback } from 'react';
import { API_BASE_URL } from './api';

const VAPID_PUBLIC_KEY = 'BD49BGird7PQBqcp3k-0qpfdugIvVAh7G8Oiao3U3n-bHgWSK4pIjhEshA9aIBxrPwWAyw4kUns7s9RiFQgeDew';

// Utility to convert Base64 string to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(user) {
  const [permissionGranted, setPermissionGranted] = useState(Notification.permission === 'granted');

  const subscribeUser = useCallback((swReg) => {
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      // Send to backend
      fetch(`${API_BASE_URL}/push_subscribe.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subscription: subscription
        })
      });
      setPermissionGranted(true);
    })
    .catch(function(err) {
      console.log('Failed to subscribe the user: ', err);
    });
  }, [user]);

  const requestPermission = useCallback(() => {
    if (!user || !user.id) return;
    
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then(function(swReg) {
          if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                subscribeUser(swReg);
              }
            });
          } else if (Notification.permission === 'granted') {
            subscribeUser(swReg);
          }
        })
        .catch(function(error) {
          console.error('Service Worker Error', error);
        });
    }
  }, [user, subscribeUser]);

  return { requestPermission, permissionGranted };
}
