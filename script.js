const CART_KEY = 'hypehubCart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
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

function setupAddToCartButtons() {
  const buttons = document.querySelectorAll('.add-to-cart');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      if (!card) return;
      addToCartFromCard(card);
    });
  });
}

function formatMoney(value) {
  return '$' + value.toFixed(2);
}

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
        <button class="btn btn-primary summary-checkout">Checkout (Mock)</button>
        <p class="summary-note">This is a front‑end demo only. No real payments are processed.</p>
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
      alert('Checkout mockup only. Integrate with your payment provider here.');
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

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  setupAddToCartButtons();
  renderCartPage();
});
