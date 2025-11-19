const CART_KEY = 'hypehubCart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function startCheckout(cart) {
  const origin = window.location.origin;

  const res = await fetch('/api/checkout/route.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart, origin })
  });

  if (!res.ok) {
    alert('Error starting checkout');
    return;
  }

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert('No checkout URL returned.');
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const cart = loadCart();
  badge.textContent = getCartCount(cart);
}

/* Shared add-to-cart helper */

function addItemToCart({ id, name, price, color, size, quantity }) {
  const cart = loadCart();
  const existing = cart.find(
    (item) => item.id === id && item.color === color && item.size === size
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id, name, price, color, size, quantity });
  }

  saveCart(cart);
  updateCartBadge();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = 'Added to cart';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 200);
  }, 1600);
}

/* Cards on shop page */

function addToCartFromCard(card) {
  const id = card.dataset.id;
  const name = card.dataset.name;
  const price = parseFloat(card.dataset.price);
  const colorSelect = card.querySelector('.color-select');
  const sizeSelect = card.querySelector('.size-select');
  const qtyInput = card.querySelector('.qty-input');

  const color = colorSelect ? colorSelect.value : 'Default';
  const size = sizeSelect ? sizeSelect.value : 'One Size';
  const quantity = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

  addItemToCart({ id, name, price, color, size, quantity });
}

function setupAddToCartButtons() {
  const buttons = document.querySelectorAll('.add-to-cart');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      if (!card) return;
      addToCartFromCard(card);
    });
  });
}

/* Money formatting */

function formatMoney(value) {
  return '$' + value.toFixed(2);
}

/* Cart page rendering */

function renderCartPage() {
  const root = document.getElementById('cart-root');
  if (!root) return;

  const cart = loadCart();

  if (!cart.length) {
    root.innerHTML = `
      <div class="empty-cart">
        <p>Your bag is currently empty.</p>
        <a href="items.html" class="btn btn-primary">Browse items</a>
      </div>
    `;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = getCartCount(cart);
  const discountEligible = totalItems >= 2;
  const discountAmount = discountEligible ? subtotal * 0.1 : 0;
  const total = subtotal - discountAmount;

  const rowsHtml = cart
    .map(
      (item, index) => `
      <div class="cart-row" data-index="${index}">
        <div class="cart-item-main">
          <h2>${item.name}</h2>
          <p class="cart-item-meta">
            <span>${item.color}</span>
            <span>Size ${item.size}</span>
          </p>
          <button class="link-btn remove-item">Remove</button>
        </div>
        <div class="cart-item-controls">
          <p class="cart-price">${formatMoney(item.price)}</p>
          <div class="qty-stepper">
            <button class="qty-btn minus">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn plus">+</button>
          </div>
          <p class="cart-line-total">${formatMoney(item.price * item.quantity)}</p>
        </div>
      </div>
    `
    )
    .join('');

  root.innerHTML = `
    <div class="cart-container">
      <div class="cart-items">
        ${rowsHtml}
      </div>
      <aside class="cart-summary">
        <h2>Order summary</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatMoney(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Items</span>
          <span>${totalItems}</span>
        </div>
        <div class="summary-row">
          <span>Buy 2, get 10% off</span>
          <span>${discountEligible ? '-' + formatMoney(discountAmount) : 'Add 2+ items'}</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total</span>
          <span>${formatMoney(total)}</span>
        </div>
        <button class="btn btn-primary summary-checkout">Checkout</button>
      </aside>
    </div>
  `;

  root.querySelectorAll('.qty-btn.plus').forEach((btn) => {
    btn.addEventListener('click', () => adjustQuantity(btn, 1));
  });

  root.querySelectorAll('.qty-btn.minus').forEach((btn) => {
    btn.addEventListener('click', () => adjustQuantity(btn, -1));
  });

  root.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', () => removeItem(btn));
  });

  const checkoutBtn = root.querySelector('.summary-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
     const cart = loadCart();
startCheckout(cart);
    });
  }
}

function adjustQuantity(button, delta) {
  const row = button.closest('.cart-row');
  const index = parseInt(row.dataset.index, 10);
  const cart = loadCart();
  const item = cart[index];
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  updateCartBadge();
  renderCartPage();
}

function removeItem(button) {
  const row = button.closest('.cart-row');
  const index = parseInt(row.dataset.index, 10);
  const cart = loadCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartBadge();
  renderCartPage();
}

function initColorBubblesOnCards() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card) => {
    const colorSelect = card.querySelector('.color-select');
    const bubbles = card.querySelectorAll('.color-bubble');
    const img = card.querySelector('.product-card-img');
    const id = card.dataset.id;
    const product = PRODUCTS[id];

    if (!colorSelect || !bubbles.length) return;

    // Helper to update the card image based on a color label
    function updateCardImageFromColor(label) {
      if (!product || !img) return;
      const match =
        product.colors.find(
          (c) =>
            c.label === label ||
            label.startsWith(c.label) ||
            c.label.startsWith(label)
        ) || product.colors[0];

      if (!match) return;
      img.src = `images/${product.folder}/${match.key}.jpg`;
    }

    // Initial active bubble based on current select value
    const current = colorSelect.value;
    let activeBubble =
      Array.from(bubbles).find(
        (b) =>
          b.dataset.color === current ||
          current.startsWith(b.dataset.color) ||
          b.dataset.color.startsWith(current)
      ) || bubbles[0];

    bubbles.forEach((b) => b.classList.remove('active'));
    if (activeBubble) {
      activeBubble.classList.add('active');
      updateCardImageFromColor(activeBubble.dataset.color);
    }

    bubbles.forEach((bubble) => {
      bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        const label = bubble.dataset.color;

        // Sync the select value
        Array.from(colorSelect.options).forEach((opt) => {
          if (opt.text === label || opt.text.startsWith(label) || label.startsWith(opt.text)) {
            opt.selected = true;
          }
        });

        // Active state
        bubbles.forEach((b) => b.classList.remove('active'));
        bubble.classList.add('active');

        // Swap card image
        updateCardImageFromColor(label);
      });
    });
  });
}
/* Make "View details" buttons go to product page */

function initProductCardLinks() {
  document.querySelectorAll('.product-card').forEach((card) => {
    const id = card.dataset.id;
    if (!id) return;

    card.addEventListener('click', (e) => {
      const target = e.target;

      // Do NOT navigate when clicking these
      if (
        target.closest('.add-to-cart') ||
        target.closest('.color-bubble') ||
        target.closest('.product-options') ||
        target.closest('select') ||
        target.closest('input')
      ) {
        return;
      }

      window.location.href = `product.html?id=${encodeURIComponent(id)}`;
    });
  });
}

/* Product data for product.html */

const PRODUCTS = {
  'polo-quarter-zip': {
    id: 'polo-quarter-zip',
    name: 'Polo Ralph Lauren Estate-Rib Quarter-Zip Pullover',
    brand: 'Ralph Lauren',
    price: 39.99,
    compareAt: 129.99,
    folder: 'polo',
    colors: [
      { label: 'Barclay Heather', key: 'barclay_heather', swatch: '#b8a99a' },
      { label: 'Nutmeg Brown Heather', key: 'nutmeg_brown_heather', swatch: '#8b5e3c' },
      { label: 'Polo Black', key: 'polo_black', swatch: '#111111' },
      { label: 'Cruise Navy', key: 'cruise_navy', swatch: '#0b1f51' },
      { label: 'Sapphire Star', key: 'sapphire_star', swatch: '#335fff' },
      { label: 'Soft Royal Heather', key: 'soft_royal_heather', swatch: '#6b7ed2' },
      { label: 'Cabana Purple', key: 'cabana_purple', swatch: '#7327c8' },
      { label: 'Scotch Pine Heather', key: 'scotch_pine_heather', swatch: '#1c4f39' },
      { label: 'Spring Wine Heather', key: 'spring_wine_heather', swatch: '#7a304a' },
      { label: 'RL 2000 Red', key: 'rl_2000_red', swatch: '#c4001d' }
    ],
    sizes: ['XS(Sold Out)', 'S', 'M', 'L', 'XL', 'XXL'],
    description:
      'Estate-rib quarter-zip pullover with classic Polo detailing and a clean, easy-to-layer fit.'
  },
  'yeezy-slides': {
    id: 'yeezy-slides',
    name: 'adidas Yeezy Slides',
    brand: 'adidas',
    price: 19.99,
    compareAt: 80,
    folder: 'yeezy',
    colors: [
      { label: 'Onyx', key: 'onyx', swatch: '#111111' },
      { label: 'Slate Marine', key: 'slate_marine', swatch: '#495b74' },
      { label: 'Bone', key: 'bone', swatch: '#d4cbb8' },
      { label: 'Dark Onyx', key: 'dark_onyx', swatch: '#050608' }
    ],
    sizes: [
      '8',
      '9',
      '9.5',
      '10',
      '10.5',
      '11 (Low on stock)',
      '11.5',
      '12',
      '12.5',
      '13 (Low on stock)'
    ],
    description: 'Minimal, comfy slides with the signature Yeezy look and cushioned step.'
  },
  'supreme-socks': {
    id: 'supreme-socks',
    name: 'Supreme Hanes Crew Socks (4 Pack)',
    brand: 'Supreme',
    price: 7.99,
    compareAt: 34.99,
    folder: 'supreme_socks',
    colors: [
      { label: 'White', key: 'white', swatch: '#e5e5e5' },
      { label: 'Black', key: 'black', swatch: '#111111' }
    ],
    sizes: ['M', 'L'],
    description:
      'Four-pack of crew socks with subtle Supreme branding, built on a Hanes base for everyday comfort.'
  },
  'fog-hoodie': {
    id: 'fog-hoodie',
    name: 'Fear of God Essentials Hoodie',
    brand: 'Fear of God Essentials',
    price: 34.99,
    compareAt: 109.99,
    folder: 'fog',
    colors: [
      { label: 'Jet Black', key: 'jet_black', swatch: '#111111' },
      { label: 'Cloud Dancer', key: 'cloud_dancer', swatch: '#f5f5f5' },
      { label: 'Silver Cloud', key: 'silver_cloud', swatch: '#c4c4c4' },
      { label: 'Light Heather Grey', key: 'light_heather_grey', swatch: '#d4d4d8' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL (Low on stock)', 'XXL (Low on stock)'],
    description:
      'Relaxed fit Essentials hoodie with clean branding and heavyweight fleece for everyday wear.'
  },
  'supreme-beanie': {
    id: 'supreme-beanie',
    name: 'Supreme New Era Box Logo Beanie',
    brand: 'Supreme x New Era',
    price: 7.99,
    compareAt: 49.99,
    folder: 'beanie',
    colors: [
      { label: 'Red', key: 'red', swatch: '#c4001d' },
      { label: 'Black', key: 'black', swatch: '#111111' },
      { label: 'Stone', key: 'stone', swatch: '#c9c4b9' },
      { label: 'Heather Grey', key: 'heather_grey', swatch: '#d4d4d8' }
    ],
    sizes: ['One Size Fits All'],
    description: 'Classic box logo beanie collab with New Era, perfect for cold-weather fits.'
  },
  'asics-gel-1130': {
    id: 'asics-gel-1130',
    name: 'ASICS Gel-1130',
    brand: 'ASICS',
    price: 69.99,
    compareAt: 169.99,
    folder: 'asics',
    colors: [
      { label: 'Black Pure Silver', key: 'black_pure_silver_1', swatch: '#111111' },
      { label: 'White Pure Silver', key: 'white_pure_silver_1', swatch: '#e5e5e5' }
    ],
    sizes: ['8', '9', '9.5', '10 (Low on stock)', '10.5', '11', '11.5', '12', '12.5', '13'],
    description:
      'Retro runner from ASICS with Gel cushioning, breathable mesh, and a Y2K-friendly silhouette.'
  },
  'denimtears-sweatshirt': {
    id: 'denimtears-sweatshirt',
    name: 'Denim Tears The Cotton Wreath Sweatshirt',
    brand: 'Denim Tears',
    price: 59.99,
    compareAt: 249.99,
    folder: 'denimtears',
    colors: [
      { label: 'Black', key: 'black', swatch: '#111111' },
      { label: 'Black Monochrome', key: 'black_monochrome', swatch: '#444444' },
      { label: 'Red', key: 'red', swatch: '#c4001d' },
      { label: 'Grey', key: 'grey', swatch: '#9ca3af' },
      { label: 'Navy', key: 'navy', swatch: '#111827' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL(Sold Out)'],
    description:
      'Statement crewneck featuring the Cotton Wreath motif, a staple piece in Denim Tears collections.'
  }
};

/* Product page logic: image left, details right, best sellers */

function initProductPage() {
  const root = document.querySelector('[data-product-page]');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = id ? PRODUCTS[id] : null;

  const imageEl = document.getElementById('product-main-image');
  const brandEl = document.getElementById('product-brand');
  const titleEl = document.getElementById('product-title');
  const priceEl = document.getElementById('product-price');
  const compareEl = document.getElementById('product-compare');
  const colorContainer = document.getElementById('product-color-bubbles');
  const sizeSelect = document.getElementById('product-size-select');
  const qtyInput = document.getElementById('product-qty');
  const addBtn = document.getElementById('product-add-to-cart');
  const descEl = document.getElementById('product-description');
  const bestGrid = document.getElementById('best-seller-grid');

  if (!product || !imageEl || !brandEl || !titleEl) {
    if (root) {
      root.innerHTML = `
        <div class="empty-cart">
          <p>Product not found.</p>
          <a href="items.html" class="btn btn-primary">Back to shop</a>
        </div>
      `;
    }
    return;
  }

  // Base info
  brandEl.textContent = product.brand;
  titleEl.textContent = product.name;
  priceEl.textContent = formatMoney(product.price);
  compareEl.textContent = formatMoney(product.compareAt);
  descEl.textContent = product.description || '';

  // Default color = first
  const defaultColor = product.colors[0];
  imageEl.src = `images/${product.folder}/${defaultColor.key}.jpg`;
  imageEl.alt = product.name;

  // Build color bubbles
  colorContainer.innerHTML = product.colors
    .map(
      (c, index) => `
      <button type="button"
        class="color-bubble ${index === 0 ? 'active' : ''}"
        data-color="${c.label}"
        data-img="images/${product.folder}/${c.key}.jpg"
        style="background-color:${c.swatch};"
        title="${c.label}">
      </button>
    `
    )
    .join('');

  // Build size options
  sizeSelect.innerHTML = product.sizes
    .map((s) => `<option>${s}</option>`)
    .join('');

  // Color bubble click = swap image
  colorContainer.querySelectorAll('.color-bubble').forEach((bubble) => {
    bubble.addEventListener('click', () => {
      colorContainer.querySelectorAll('.color-bubble').forEach((b) => b.classList.remove('active'));
      bubble.classList.add('active');
      const src = bubble.dataset.img;
      if (src) {
        imageEl.src = src;
      }
    });
  });

  // Add to cart from product page
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const activeBubble = colorContainer.querySelector('.color-bubble.active');
      const color = activeBubble ? activeBubble.dataset.color : defaultColor.label;
      const size = sizeSelect.value || 'One Size';
      const quantity = Math.max(1, parseInt(qtyInput.value, 10) || 1);

      addItemToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        color,
        size,
        quantity
      });
    });
  }

  // Best sellers: 4 random other products
  if (bestGrid) {
    const otherIds = Object.keys(PRODUCTS).filter((key) => key !== product.id);
    const shuffled = otherIds.sort(() => 0.5 - Math.random()).slice(0, 4);

    bestGrid.innerHTML = shuffled
      .map((pid) => {
        const p = PRODUCTS[pid];
        const thumbColor = p.colors[0];
        const imgSrc = `images/${p.folder}/${thumbColor.key}.jpg`;
        return `
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="best-seller-card">
          <img src="${imgSrc}" alt="${p.name}">
          <p class="best-seller-name">${p.name}</p>
          <p class="best-seller-price">${formatMoney(p.price)}</p>
        </a>
      `;
      })
      .join('');
  }
}

/* DOM READY */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  setupAddToCartButtons();
  renderCartPage();
  initColorBubblesOnCards();
  initProductCardLinks();
  initProductPage();
});
