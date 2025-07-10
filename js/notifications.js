// Push Notifications Management
class NotificationManager {
  constructor() {
    this.init();
  }

  init() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.log('This browser does not support service workers');
      return;
    }

    this.checkPermission();
  }

  checkPermission() {
    const permission = Notification.permission;
    console.log('Notification permission:', permission);
    
    if (permission === 'granted') {
      this.subscribeToNotifications();
    }
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        await this.subscribeToNotifications();
        
        // Show welcome notification
        this.showNotification(
          'Notifications Enabled! 🔔',
          'You\'ll now receive updates about deals and order status.'
        );
        
        if (window.app) {
          window.app.showToast('Notifications enabled successfully!');
        }
      } else {
        console.log('Notification permission denied');
        if (window.app) {
          window.app.showToast('Notifications disabled. You can enable them later in settings.', 'error');
        }
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      if (window.app) {
        window.app.showToast('Error enabling notifications.', 'error');
      }
    }
  }

  async subscribeToNotifications() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.getVapidPublicKey())
        });
        
        console.log('New push subscription created:', subscription);
      }
      
      // Store subscription for later use
      await this.storeSubscription(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
    }
  }

  async storeSubscription(subscription) {
    try {
      // Store subscription locally
      await ShopPWA.storeData('pushSubscription', subscription);
      
      // In a real app, you would send this to your server
      console.log('Push subscription stored locally');
    } catch (error) {
      console.error('Failed to store subscription:', error);
    }
  }

  // VAPID public key (in a real app, this would come from your server)
  getVapidPublicKey() {
    // This is a demo key - replace with your actual VAPID public key
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NlMpOD5wfPYL6pnJ6KYqKOA0VZEGKozJQNLw3mWD9E6tPXe3TFjz5w';
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Show local notification
  showNotification(title, body, options = {}) {
    if (Notification.permission === 'granted') {
      const defaultOptions = {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'shop-pwa',
        vibrate: [200, 100, 200],
        ...options
      };

      new Notification(title, {
        body,
        ...defaultOptions
      });
    }
  }

  // Send push notification (demo - simulates server-sent notification)
  async sendDemoNotification(type = 'promotion') {
    const notifications = {
      promotion: {
        title: '🎉 Special Offer!',
        body: '20% off on all electronics! Limited time offer.',
        data: { url: '/#products' },
        tag: 'promotion'
      },
      orderUpdate: {
        title: '📦 Order Update',
        body: 'Your order has been shipped and is on the way!',
        data: { url: '/#orders' },
        tag: 'order-update'
      },
      newProduct: {
        title: '✨ New Product Alert',
        body: 'Check out our latest wireless earbuds with noise cancellation!',
        data: { url: '/#products' },
        tag: 'new-product'
      },
      lowStock: {
        title: '⚠️ Low Stock Alert',
        body: 'Items in your wishlist are running low. Order now!',
        data: { url: '/#cart' },
        tag: 'low-stock'
      }
    };

    const notification = notifications[type] || notifications.promotion;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Simulate push notification
      await registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: notification.data,
        tag: notification.tag,
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/icons/icon-72x72.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });

      console.log('Demo notification sent:', notification.title);
    } catch (error) {
      console.error('Failed to send demo notification:', error);
    }
  }

  // Schedule notifications for demo purposes
  scheduleDemoNotifications() {
    if (Notification.permission !== 'granted') {
      return;
    }

    // Schedule promotional notification after 30 seconds
    setTimeout(() => {
      this.sendDemoNotification('promotion');
    }, 30000);

    // Schedule new product notification after 2 minutes
    setTimeout(() => {
      this.sendDemoNotification('newProduct');
    }, 120000);

    // Schedule order update notification after 5 minutes
    setTimeout(() => {
      this.sendDemoNotification('orderUpdate');
    }, 300000);
  }

  // Unsubscribe from notifications
  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await ShopPWA.storeData('pushSubscription', null);
        console.log('Unsubscribed from notifications');
        
        if (window.app) {
          window.app.showToast('Notifications disabled');
        }
      }
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const subscription = await ShopPWA.getData('pushSubscription');
      return {
        supported: 'Notification' in window,
        permission: Notification.permission,
        subscribed: !!subscription
      };
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return {
        supported: false,
        permission: 'denied',
        subscribed: false
      };
    }
  }
}

// Initialize NotificationManager
window.NotificationManager = new NotificationManager();

// Demo notification buttons (for testing)
document.addEventListener('DOMContentLoaded', () => {
  // Add demo notification controls to the page (for development/testing)
  if (window.location.search.includes('demo=true')) {
    const demoControls = document.createElement('div');
    demoControls.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      z-index: 1000;
      border: 2px solid #2196f3;
    `;
    
    demoControls.innerHTML = `
      <h4 style="margin-bottom: 0.5rem; color: #2196f3;">Demo Controls</h4>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <button class="btn btn-small btn-primary" onclick="NotificationManager.sendDemoNotification('promotion')">
          Send Promo
        </button>
        <button class="btn btn-small btn-primary" onclick="NotificationManager.sendDemoNotification('orderUpdate')">
          Order Update
        </button>
        <button class="btn btn-small btn-primary" onclick="NotificationManager.sendDemoNotification('newProduct')">
          New Product
        </button>
        <button class="btn btn-small btn-secondary" onclick="this.parentElement.parentElement.remove()">
          Hide
        </button>
      </div>
    `;
    
    document.body.appendChild(demoControls);
  }
  
  // Auto-schedule demo notifications if permission is granted
  if (Notification.permission === 'granted') {
    window.NotificationManager.scheduleDemoNotifications();
  }
});

// Add notification-specific styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification-settings {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .notification-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  
  .status-indicator.granted {
    background: #28a745;
  }
  
  .status-indicator.denied {
    background: #dc3545;
  }
  
  .status-indicator.default {
    background: #ffc107;
  }
`;
document.head.appendChild(notificationStyles);