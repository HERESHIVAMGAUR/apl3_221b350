// Shopping Cart Management
class CartManager {
  constructor() {
    this.cart = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadCart();
  }

  bindEvents() {
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn?.addEventListener('click', () => {
      this.checkout();
    });
  }

  async loadCart() {
    try {
      const savedCart = await ShopPWA.getData('cart');
      if (savedCart && Array.isArray(savedCart)) {
        this.cart = savedCart;
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      this.cart = [];
    }
    
    this.updateCartDisplay();
    this.updateCartCount();
  }

  async saveCart() {
    try {
      await ShopPWA.storeData('cart', this.cart);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  addItem(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    this.saveCart();
    this.updateCartDisplay();
    this.updateCartCount();
    
    // Trigger cart animation
    this.animateCartIcon();
  }

  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartDisplay();
    this.updateCartCount();
    
    if (window.app) {
      window.app.showToast('Item removed from cart');
    }
  }

  updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }
    
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = newQuantity;
      this.saveCart();
      this.updateCartDisplay();
      this.updateCartCount();
    }
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
      cartCountElement.textContent = this.getCartItemCount();
    }
  }

  updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (this.cart.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart" style="text-align: center; padding: 3rem; color: #666;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
          <button class="btn btn-primary" onclick="app.navigateToSection('#products')">
            Browse Products
          </button>
        </div>
      `;
    } else {
      cartItems.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
    }
    
    cartTotal.textContent = this.getCartTotal().toFixed(2);
  }

  createCartItemHTML(item) {
    return `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-image">${item.image}</div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="CartManager.decreaseQuantity(${item.id})">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="CartManager.increaseQuantity(${item.id})">+</button>
          </div>
        </div>
        <div class="cart-item-actions">
          <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
          <button class="btn btn-danger btn-small" onclick="CartManager.removeItem(${item.id})">
            Remove
          </button>
        </div>
      </div>
    `;
  }

  static increaseQuantity(productId) {
    const item = window.CartManager.cart.find(item => item.id === productId);
    if (item) {
      window.CartManager.updateQuantity(productId, item.quantity + 1);
    }
  }

  static decreaseQuantity(productId) {
    const item = window.CartManager.cart.find(item => item.id === productId);
    if (item) {
      window.CartManager.updateQuantity(productId, item.quantity - 1);
    }
  }

  static removeItem(productId) {
    window.CartManager.removeItem(productId);
  }

  animateCartIcon() {
    const cartLink = document.querySelector('a[href="#cart"]');
    if (cartLink) {
      cartLink.style.animation = 'bounce 0.5s ease';
      setTimeout(() => {
        cartLink.style.animation = '';
      }, 500);
    }
  }

  async checkout() {
    if (this.cart.length === 0) {
      if (window.app) {
        window.app.showToast('Your cart is empty!', 'error');
      }
      return;
    }
    
    const order = {
      id: Date.now(),
      items: [...this.cart],
      total: this.getCartTotal(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    try {
      if (navigator.onLine) {
        // Try to submit order online
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          await this.processSuccessfulOrder(order);
        } else {
          throw new Error('Order submission failed');
        }
      } else {
        // Store order for later sync
        await this.storeOrderOffline(order);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Store order for later sync
      await this.storeOrderOffline(order);
    }
  }

  async processSuccessfulOrder(order) {
    // Clear cart
    this.cart = [];
    await this.saveCart();
    this.updateCartDisplay();
    this.updateCartCount();
    
    // Show success message
    this.showOrderConfirmation(order);
    
    // Send notification if permissions granted
    if (window.NotificationManager) {
      window.NotificationManager.showNotification(
        'Order Confirmed! 🎉',
        `Your order #${order.id} has been placed successfully.`
      );
    }
  }

  async storeOrderOffline(order) {
    try {
      // Get existing pending orders
      const pendingOrders = await ShopPWA.getData('pendingOrders') || [];
      pendingOrders.push(order);
      
      // Store updated pending orders
      await ShopPWA.storeData('pendingOrders', pendingOrders);
      
      // Clear cart
      this.cart = [];
      await this.saveCart();
      this.updateCartDisplay();
      this.updateCartCount();
      
      // Show offline order confirmation
      this.showOfflineOrderConfirmation(order);
      
      // Register background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync-orders');
      }
      
    } catch (error) {
      console.error('Error storing offline order:', error);
      if (window.app) {
        window.app.showToast('Order could not be processed. Please try again.', 'error');
      }
    }
  }

  showOrderConfirmation(order) {
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1rem;
    `;
    
    modal.innerHTML = `
      <div class="modal-content" style="
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        text-align: center;
        animation: slideInUp 0.3s ease;
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
        <h2 style="color: #28a745; margin-bottom: 1rem;">Order Confirmed!</h2>
        <p style="margin-bottom: 1rem;">
          Your order #${order.id} has been placed successfully.
        </p>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <h4>Order Summary</h4>
          <p>${order.items.length} item(s) - Total: $${order.total.toFixed(2)}</p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove(); app.navigateToSection('#products')">
            Continue Shopping
          </button>
          <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) {
        modal.remove();
      }
    }, 5000);
  }

  showOfflineOrderConfirmation(order) {
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1rem;
    `;
    
    modal.innerHTML = `
      <div class="modal-content" style="
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        text-align: center;
        animation: slideInUp 0.3s ease;
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">📱</div>
        <h2 style="color: #ff9800; margin-bottom: 1rem;">Order Saved!</h2>
        <p style="margin-bottom: 1rem;">
          You're currently offline. Your order #${order.id} has been saved and will be processed when you're back online.
        </p>
        <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #ffc107;">
          <h4>Order Summary</h4>
          <p>${order.items.length} item(s) - Total: $${order.total.toFixed(2)}</p>
          <small style="color: #856404;">Will be submitted automatically when connection is restored.</small>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove(); app.navigateToSection('#products')">
            Continue Shopping
          </button>
          <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 7 seconds (longer for offline message)
    setTimeout(() => {
      if (document.body.contains(modal)) {
        modal.remove();
      }
    }, 7000);
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartDisplay();
    this.updateCartCount();
  }
}

// Initialize CartManager
window.CartManager = new CartManager();

// Add cart-specific styles
const cartStyles = document.createElement('style');
cartStyles.textContent = `
  @keyframes bounce {
    0%, 20%, 60%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    80% {
      transform: translateY(-5px);
    }
  }
  
  .cart-item {
    position: relative;
  }
  
  .cart-item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }
  
  .item-total {
    font-weight: 700;
    color: #2196f3;
    font-size: 1.1rem;
  }
  
  .quantity-display {
    min-width: 30px;
    text-align: center;
    font-weight: 600;
  }
  
  .empty-cart h3 {
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .order-modal .modal-content h4 {
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  @media (min-width: 768px) {
    .cart-item {
      align-items: center;
    }
    
    .cart-item-actions {
      flex-direction: row;
      align-items: center;
    }
    
    .cart-item-quantity {
      margin-left: auto;
      margin-right: 1rem;
      margin-top: 0;
    }
  }
`;
document.head.appendChild(cartStyles);