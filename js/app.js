// Main Application Logic
class ShopPWA {
  constructor() {
    this.init();
  }

  async init() {
    // Register service worker
    await this.registerServiceWorker();
    
    // Initialize components
    this.initNavigation();
    this.initInstallPrompt();
    this.initOfflineDetection();
    this.loadInitialData();
    
    // Show notification permission banner after 3 seconds
    setTimeout(() => {
      this.showNotificationBanner();
    }, 3000);
  }

  // Service Worker Registration
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailableBanner();
            }
          });
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Navigation
  initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    // Mobile menu toggle
    navToggle?.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
    
    // Handle navigation links
    navMenu?.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        this.navigateToSection(href);
        navMenu.classList.remove('active');
      }
    });
  }

  navigateToSection(href) {
    // Hide all sections
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Show target section
    const targetId = href.substring(1); // Remove #
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update URL without page reload
    history.pushState({}, '', href);
  }

  // PWA Install Prompt
  initInstallPrompt() {
    let deferredPrompt;
    const installBanner = document.getElementById('installBanner');
    const installBtn = document.getElementById('installBtn');
    const dismissBtn = document.getElementById('dismissBtn');
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install banner if not already dismissed
      if (!localStorage.getItem('pwa-install-dismissed')) {
        this.showInstallBanner();
      }
    });
    
    // Install button click
    installBtn?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          this.hideInstallBanner();
        }
        
        deferredPrompt = null;
      }
    });
    
    // Dismiss button click
    dismissBtn?.addEventListener('click', () => {
      this.hideInstallBanner();
      localStorage.setItem('pwa-install-dismissed', 'true');
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallBanner();
      this.showToast('App installed successfully! 🎉');
    });
  }

  showInstallBanner() {
    const installBanner = document.getElementById('installBanner');
    if (installBanner) {
      installBanner.style.display = 'block';
      installBanner.classList.add('show');
    }
  }

  hideInstallBanner() {
    const installBanner = document.getElementById('installBanner');
    if (installBanner) {
      installBanner.classList.remove('show');
      setTimeout(() => {
        installBanner.style.display = 'none';
      }, 300);
    }
  }

  // Offline Detection
  initOfflineDetection() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    
    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        offlineIndicator.classList.remove('show');
        this.syncPendingData();
      } else {
        offlineIndicator.style.display = 'block';
        offlineIndicator.classList.add('show');
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();
  }

  // Load Initial Data
  async loadInitialData() {
    try {
      this.showSpinner();
      
      // Load products (this will be handled by products.js)
      if (window.ProductManager) {
        await window.ProductManager.loadProducts();
      }
      
      // Load cart (this will be handled by cart.js)
      if (window.CartManager) {
        await window.CartManager.loadCart();
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showToast('Error loading data. Some features may not work properly.', 'error');
    } finally {
      this.hideSpinner();
    }
  }

  // Notification Banner
  showNotificationBanner() {
    // Only show if notifications are supported and not already granted/denied
    if ('Notification' in window && Notification.permission === 'default') {
      const notificationBanner = document.getElementById('notificationBanner');
      const enableBtn = document.getElementById('enableNotificationsBtn');
      const dismissNotificationBtn = document.getElementById('dismissNotificationBtn');
      
      if (notificationBanner && !localStorage.getItem('notifications-dismissed')) {
        notificationBanner.style.display = 'block';
        notificationBanner.classList.add('show');
        
        enableBtn?.addEventListener('click', async () => {
          if (window.NotificationManager) {
            await window.NotificationManager.requestPermission();
          }
          this.hideNotificationBanner();
        });
        
        dismissNotificationBtn?.addEventListener('click', () => {
          this.hideNotificationBanner();
          localStorage.setItem('notifications-dismissed', 'true');
        });
      }
    }
  }

  hideNotificationBanner() {
    const notificationBanner = document.getElementById('notificationBanner');
    if (notificationBanner) {
      notificationBanner.classList.remove('show');
      setTimeout(() => {
        notificationBanner.style.display = 'none';
      }, 300);
    }
  }

  // Update Available Banner
  showUpdateAvailableBanner() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'install-banner show';
    updateBanner.innerHTML = `
      <div class="install-content">
        <p>A new version is available!</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Update</button>
        <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">Later</button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }

  // Sync pending data when back online
  async syncPendingData() {
    try {
      // Trigger background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync-orders');
      }
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  // Utility Methods
  showSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.style.display = 'flex';
    }
  }

  hideSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'error' ? '#dc3545' : '#28a745'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      z-index: 2001;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Storage helpers
  static async storeData(key, data) {
    try {
      // Try IndexedDB first
      if ('indexedDB' in window) {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('ShopPWADB', 1);
          
          request.onerror = () => reject(request.error);
          
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['store'], 'readwrite');
            const store = transaction.objectStore('store');
            store.put({ key, data });
            transaction.oncomplete = () => resolve();
          };
          
          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('store')) {
              db.createObjectStore('store', { keyPath: 'key' });
            }
          };
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  static async getData(key) {
    try {
      // Try IndexedDB first
      if ('indexedDB' in window) {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('ShopPWADB', 1);
          
          request.onerror = () => reject(request.error);
          
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['store'], 'readonly');
            const store = transaction.objectStore('store');
            const getRequest = store.get(key);
            
            getRequest.onsuccess = () => {
              resolve(getRequest.result ? getRequest.result.data : null);
            };
          };
          
          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('store')) {
              db.createObjectStore('store', { keyPath: 'key' });
            }
          };
        });
      } else {
        // Fallback to localStorage
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ShopPWA();
});

// Add CSS animations for toasts
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);