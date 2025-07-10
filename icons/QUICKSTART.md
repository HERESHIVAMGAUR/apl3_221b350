# ShopPWA - E-commerce Progressive Web Application

## Quick Start
1. Start a local server: python -m http.server 8000
2. Open browser: http://localhost:8000
3. Test PWA features:
   - Install the app (browser prompt)
   - Test offline mode (disable network in DevTools)
   - Enable notifications for push notifications

## Features Implemented
✅ Service Workers with caching strategies
✅ Offline functionality 
✅ Push notifications
✅ Responsive design (mobile-first)
✅ Shopping cart with offline storage
✅ Background sync for orders
✅ PWA installability

## File Structure
- index.html - Main app page
- manifest.json - PWA manifest
- sw.js - Service worker
- css/styles.css - Responsive styles
- js/app.js - Main app logic
- js/products.js - Product management
- js/cart.js - Shopping cart
- js/notifications.js - Push notifications

## Testing
Open Chrome DevTools > Application tab to inspect:
- Service Workers
- Cache Storage
- IndexedDB
- Push Notifications
- Manifest

Run Lighthouse audit for PWA score.

