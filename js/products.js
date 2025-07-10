// Products Management
class ProductManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Search functionality (if search input exists)
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterProducts(e.target.value);
      });
    }
  }

  async loadProducts() {
    try {
      // Try to load from API first
      const response = await fetch('/api/products');
      
      if (response.ok) {
        this.products = await response.json();
        // Cache products locally
        await ShopPWA.storeData('products', this.products);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.log('Loading products from cache or fallback data');
      // Try to load from cache
      const cachedProducts = await ShopPWA.getData('products');
      
      if (cachedProducts) {
        this.products = cachedProducts;
      } else {
        // Use fallback data
        this.products = this.getFallbackProducts();
        await ShopPWA.storeData('products', this.products);
      }
    }
    
    this.filteredProducts = [...this.products];
    this.renderProducts();
  }

  getFallbackProducts() {
    return [
      {
        id: 1,
        title: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 199.99,
        image: '🎧',
        category: 'Electronics',
        inStock: true,
        rating: 4.5
      },
      {
        id: 2,
        title: 'Smart Fitness Watch',
        description: 'Track your fitness goals with GPS, heart rate monitoring, and smartphone integration.',
        price: 299.99,
        image: '⌚',
        category: 'Electronics',
        inStock: true,
        rating: 4.7
      },
      {
        id: 3,
        title: 'Organic Coffee Beans',
        description: 'Premium organic coffee beans sourced from sustainable farms. Rich, bold flavor.',
        price: 24.99,
        image: '☕',
        category: 'Food & Beverage',
        inStock: true,
        rating: 4.3
      },
      {
        id: 4,
        title: 'Yoga Mat',
        description: 'Non-slip, eco-friendly yoga mat perfect for all types of yoga and exercises.',
        price: 49.99,
        image: '🧘',
        category: 'Fitness',
        inStock: true,
        rating: 4.6
      },
      {
        id: 5,
        title: 'Wireless Phone Charger',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
        price: 39.99,
        image: '🔌',
        category: 'Electronics',
        inStock: false,
        rating: 4.4
      },
      {
        id: 6,
        title: 'Stainless Steel Water Bottle',
        description: 'Insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
        price: 34.99,
        image: '🍼',
        category: 'Lifestyle',
        inStock: true,
        rating: 4.8
      },
      {
        id: 7,
        title: 'LED Desk Lamp',
        description: 'Adjustable LED desk lamp with multiple brightness levels and USB charging port.',
        price: 89.99,
        image: '💡',
        category: 'Home & Office',
        inStock: true,
        rating: 4.2
      },
      {
        id: 8,
        title: 'Portable Bluetooth Speaker',
        description: 'Compact waterproof speaker with 360-degree sound and 20-hour battery life.',
        price: 79.99,
        image: '🔊',
        category: 'Electronics',
        inStock: true,
        rating: 4.5
      }
    ];
  }

  filterProducts(searchTerm) {
    if (!searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredProducts = this.products.filter(product =>
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }
    this.renderProducts();
  }

  renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (this.filteredProducts.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search terms or browse all products.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
    
    // Add fade-in animation
    const cards = productsGrid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('fade-in');
    });
  }

  createProductCard(product) {
    const isOutOfStock = !product.inStock;
    const stockStatus = isOutOfStock ? 'Out of Stock' : 'In Stock';
    const stockClass = isOutOfStock ? 'out-of-stock' : 'in-stock';
    
    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image" style="${isOutOfStock ? 'filter: grayscale(50%);' : ''}">
          ${product.image}
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-meta">
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-rating">
              ${this.renderStars(product.rating)} (${product.rating})
            </div>
            <div class="product-stock ${stockClass}">
              ${stockStatus}
            </div>
          </div>
          <div class="product-actions">
            <button 
              class="btn btn-primary ${isOutOfStock ? 'btn-disabled' : ''}" 
              onclick="ProductManager.addToCart(${product.id})"
              ${isOutOfStock ? 'disabled' : ''}
            >
              ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button 
              class="btn btn-secondary btn-small" 
              onclick="ProductManager.viewProduct(${product.id})"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }

  static addToCart(productId) {
    const product = window.ProductManager.getProductById(productId);
    if (product && product.inStock && window.CartManager) {
      window.CartManager.addItem(product);
      
      // Show success feedback
      if (window.app) {
        window.app.showToast(`${product.title} added to cart! 🛒`);
      }
      
      // Add visual feedback to button
      const button = document.querySelector(`[data-product-id="${productId}"] .btn-primary`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '';
        }, 1000);
      }
    }
  }

  static viewProduct(productId) {
    const product = window.ProductManager.getProductById(productId);
    if (product) {
      window.ProductManager.showProductModal(product);
    }
  }

  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  showProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
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
    
    const modalContent = `
      <div class="modal-content" style="
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
      ">
        <button class="modal-close" style="
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        ">&times;</button>
        
        <div class="modal-product">
          <div class="product-image" style="
            text-align: center;
            font-size: 4rem;
            margin-bottom: 1rem;
            padding: 2rem;
            background: #f8f9fa;
            border-radius: 8px;
          ">${product.image}</div>
          
          <h2 style="margin-bottom: 1rem; color: #333;">${product.title}</h2>
          <p style="color: #666; margin-bottom: 1rem; line-height: 1.6;">${product.description}</p>
          
          <div class="product-details" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>Category:</span>
              <span style="font-weight: 600;">${product.category}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>Rating:</span>
              <span>${this.renderStars(product.rating)} (${product.rating})</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>Availability:</span>
              <span style="color: ${product.inStock ? '#28a745' : '#dc3545'};">
                ${product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
              <span style="font-size: 1.5rem; font-weight: 700; color: #2196f3;">
                $${product.price.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div class="modal-actions" style="display: flex; gap: 1rem;">
            <button 
              class="btn btn-primary" 
              style="flex: 1;"
              onclick="ProductManager.addToCart(${product.id}); document.querySelector('.product-modal').remove();"
              ${!product.inStock ? 'disabled' : ''}
            >
              ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button 
              class="btn btn-secondary" 
              onclick="document.querySelector('.product-modal').remove();"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    
    modal.innerHTML = modalContent;
    
    // Close modal when clicking outside or on close button
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        modal.remove();
      }
    });
    
    // Close modal with escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    document.body.appendChild(modal);
  }
}

// Initialize ProductManager
window.ProductManager = new ProductManager();

// Add additional CSS for product modal and states
const productStyles = document.createElement('style');
productStyles.textContent = `
  .product-stock.out-of-stock {
    color: #dc3545;
    font-weight: 600;
  }
  
  .product-stock.in-stock {
    color: #28a745;
    font-weight: 600;
  }
  
  .product-rating {
    color: #ffc107;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  
  .product-meta {
    margin-bottom: 1rem;
  }
  
  .btn-disabled {
    background: #6c757d !important;
    cursor: not-allowed !important;
    opacity: 0.6;
  }
  
  .btn-disabled:hover {
    transform: none !important;
    box-shadow: none !important;
  }
  
  .product-modal {
    animation: fadeIn 0.3s ease;
  }
  
  .product-modal .modal-content {
    animation: slideInUp 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .no-products {
    color: #666;
  }
  
  .no-products h3 {
    margin-bottom: 0.5rem;
  }
`;
document.head.appendChild(productStyles);