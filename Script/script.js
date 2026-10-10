// BASE DE DATOS LOCAL DE PRODUCTOS
const PRODUCTS = [
  { id: 1, title: 'Manzana Gala Premium', price: 1.20, unit: '500g (~3 unid)', category: 'frutas', icon: '🍎' },
  { id: 2, title: 'Banano Criollo', price: 0.80, unit: '1 kg (Ramo)', category: 'frutas', icon: '🍌' },
  { id: 3, title: 'Leche Entera Alquería', price: 1.10, unit: '1 Litro', category: 'lacteos', icon: '🥛' },
  { id: 4, title: 'Queso Mozzarella', price: 3.50, unit: '400g Bloque', category: 'lacteos', icon: '🧀' },
  { id: 5, title: 'Pan Integral Artesanal', price: 2.30, unit: '500g Tajado', category: 'panaderia', icon: '🍞' },
  { id: 6, title: 'Aguacate Hass Extra', price: 1.80, unit: 'Malla x2 unid', category: 'frutas', icon: '🥑' },
  { id: 7, title: 'Pechuga de Pollo', price: 4.50, unit: '800g Bandeja', category: 'carnes', icon: '🍗' },
  { id: 8, title: 'Jugo de Naranja 100%', price: 2.10, unit: '1 Litro Botella', category: 'bebidas', icon: '🧃' }
];

const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: 'fa-border-all' },
  { id: 'frutas', label: 'Frutas y Verduras', icon: 'fa-apple-whole' },
  { id: 'lacteos', label: 'Lácteos y Huevos', icon: 'fa-cheese' },
  { id: 'panaderia', label: 'Panadería', icon: 'fa-bread-slice' },
  { id: 'carnes', label: 'Carnes', icon: 'fa-drumstick-bite' },
  { id: 'bebidas', label: 'Bebidas', icon: 'fa-bottle-water' }
];

// ESTADO DE LA APLICACIÓN
let activeCategory = 'todos';
let searchQuery = '';
let cart = [];

// ELEMENTOS DOM
const categoriesContainer = document.getElementById('categoriesContainer');
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const sectionTitle = document.getElementById('sectionTitle');
const productCount = document.getElementById('productCount');

const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsContainer = document.getElementById('cartItemsContainer');

const openCartBtn = document.getElementById('openCartBtn');
const openCartNav = document.getElementById('openCartNav');
const closeCartBtn = document.getElementById('closeCartBtn');

const cartBadgeHeader = document.getElementById('cartBadgeHeader');
const cartBadgeNav = document.getElementById('cartBadgeNav');
const subtotalAmount = document.getElementById('subtotalAmount');
const shippingAmount = document.getElementById('shippingAmount');
const totalAmount = document.getElementById('totalAmount');
const checkoutBtn = document.getElementById('checkoutBtn');

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts();
  setupEventListeners();
});

// FUNCIONES DE RENDERIZADO
function renderCategories() {
  categoriesContainer.innerHTML = CATEGORIES.map(cat => `
    <button class="cat-chip ${cat.id === activeCategory ? 'active' : ''}" onclick="selectCategory('${cat.id}')">
      <i class="fa-solid ${cat.icon}"></i>
      <span>${cat.label}</span>
    </button>
  `).join('');
}

function renderProducts() {
  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCat = activeCategory === 'todos' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  productCount.textContent = `${filteredProducts.length} ítems`;

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted);">
        <i class="fa-solid fa-face-frown" style="font-size: 2rem; margin-bottom: 8px;"></i>
        <p>No encontramos productos que coincidan.</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = filteredProducts.map(prod => `
    <div class="product-card">
      <div class="product-img-wrapper">
        <span>${prod.icon}</span>
      </div>
      <div class="product-title">${prod.title}</div>
      <div class="product-unit">${prod.unit}</div>
      <div class="product-bottom">
        <span class="product-price">$${prod.price.toFixed(2)}</span>
        <button class="add-btn" onclick="addToCart(${prod.id})" aria-label="Añadir producto">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function renderCart() {
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartBadgeHeader.textContent = totalCount;
  cartBadgeNav.textContent = totalCount;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fa-solid fa-basket-shopping"></i>
        <p>Tu carrito está vacío</p>
      </div>
    `;
    subtotalAmount.textContent = '$0.00';
    shippingAmount.textContent = '$0.00';
    totalAmount.textContent = '$0.00';
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon">${item.icon}</div>
      <div class="cart-item-details">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
      <div class="quantity-controls">
        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
        <span class="qty-number">${item.quantity}</span>
        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 1.50 : 0.00;
  const total = subtotal + shipping;

  subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
  shippingAmount.textContent = `$${shipping.toFixed(2)}`;
  totalAmount.textContent = `$${total.toFixed(2)}`;
}

// LOGICA INTERACTIVA Y EVENTOS
window.selectCategory = function(catId) {
  activeCategory = catId;
  renderCategories();
  renderProducts();
};

window.addToCart = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const existingIndex = cart.findIndex(item => item.id === productId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
};

window.updateQuantity = function(productId, delta) {
  const existingIndex = cart.findIndex(item => item.id === productId);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += delta;
    if (cart[existingIndex].quantity <= 0) {
      cart.splice(existingIndex, 1);
    }
  }
  renderCart();
};

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  const toggleCart = () => {
    cartOverlay.classList.toggle('active');
    cartDrawer.classList.toggle('active');
  };

  openCartBtn.addEventListener('click', toggleCart);
  openCartNav.addEventListener('click', (e) => {
    e.preventDefault();
    toggleCart();
  });

  closeCartBtn.addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', toggleCart);

  // REDIRECCIÓN A WHATSAPP CON EL PEDIDO FORMATEADO
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    // Cambia este número por el tuyo con código de país (Ej: 573000000000)
    const tuNumeroWhatsApp = "573242574501"; 

    let mensaje = "¡Hola! 🛒 Me gustaría hacer el siguiente pedido:\n\n";

    cart.forEach(item => {
      mensaje += `▪️ ${item.quantity}x ${item.title} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 1.50;
    const total = subtotal + shipping;

    mensaje += `\n📦 Subtotal: $${subtotal.toFixed(2)}`;
    mensaje += `\n🚚 Envío: $${shipping.toFixed(2)}`;
    mensaje += `\n💰 *Total a pagar: $${total.toFixed(2)}*`;
    mensaje += `\n\nQuedo atento a la confirmación, gracias.`;

    // Codificar el texto para la URL de WhatsApp
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${tuNumeroWhatsApp}?text=${mensajeCodificado}`;

    // Abrir WhatsApp en una nueva pestaña
    window.open(urlWhatsApp, '_blank');
  });
}