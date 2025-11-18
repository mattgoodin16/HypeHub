/* ========================================================
   PRODUCT DATA (used by product.html and items.html)
======================================================== */

const PRODUCTS = {
  "polo-quarter-zip": {
    name: "Polo Ralph Lauren Estate-Rib Quarter-Zip Pullover",
    price: 39.99,
    oldPrice: 129.99,
    folder: "polo",
    sizes: ["S","M","L","XL","XXL"],
    colors: [
      { label:"Barclay Heather", key:"barclay_heather" },
      { label:"Nutmeg Brown Heather", key:"nutmeg_brown_heather" },
      { label:"Polo Black", key:"polo_black" },
      { label:"Cruise Navy", key:"cruise_navy" },
      { label:"Sapphire Star", key:"sapphire_star" },
      { label:"Soft Royal Heather", key:"soft_royal_heather" },
      { label:"Cabana Purple", key:"cabana_purple" },
      { label:"Scotch Pine Heather", key:"scotch_pine_heather" },
      { label:"Spring Wine Heather", key:"spring_wine_heather" },
      { label:"RL 2000 Red", key:"rl_2000_red" },
    ]
  },

  "yeezy-slides": {
    name: "adidas Yeezy Slides",
    price: 19.99,
    oldPrice: 80.00,
    folder: "yeezy",
    sizes: ["8","9","9.5","10","10.5","11","11.5","12","12.5","13"],
    colors: [
      { label:"Onyx", key:"onyx" },
      { label:"Slate Marine", key:"slate_marine" },
      { label:"Bone", key:"bone" },
      { label:"Dark Onyx", key:"dark_onyx" }
    ]
  },

  "supreme-socks": {
    name: "Supreme Hanes Crew Socks (4 Pack)",
    price: 7.99,
    oldPrice: 34.99,
    folder: "supreme_socks",
    sizes: ["M","L"],
    colors: [
      { label:"White", key:"white" },
      { label:"Black", key:"black" }
    ]
  },

  "fog-hoodie": {
    name: "Fear of God Essentials Hoodie",
    price: 34.99,
    oldPrice: 109.99,
    folder: "fog",
    sizes: ["XS","S","M","L","XL","XXL"],
    colors: [
      { label:"Jet Black", key:"jet_black" },
      { label:"Cloud Dancer", key:"cloud_dancer" },
      { label:"Silver Cloud", key:"silver_cloud" },
      { label:"Light Heather Grey", key:"light_heather_grey" }
    ]
  },

  "supreme-beanie": {
    name: "Supreme New Era Box Logo Beanie",
    price: 7.99,
    oldPrice: 49.99,
    folder: "beanie",
    sizes: ["One Size"],
    colors: [
      { label:"Red", key:"red" },
      { label:"Black", key:"black" },
      { label:"Stone", key:"stone" },
      { label:"Heather Grey", key:"heather_grey" }
    ]
  },

  "asics-gel-1130": {
    name: "ASICS Gel-1130",
    price: 69.99,
    oldPrice: 169.99,
    folder: "asics",
    sizes: ["8","9","9.5","10","10.5","11","11.5","12","12.5","13"],
    colors: [
      { label:"Black Pure Silver", key:"black_pure_silver_1" },
      { label:"White Pure Silver", key:"white_pure_silver_1" }
    ]
  },

  "denimtears-sweatshirt": {
    name: "Denim Tears The Cotton Wreath Sweatshirt",
    price: 59.99,
    oldPrice: 249.99,
    folder: "denimtears",
    sizes: ["XS","S","M","L","XL"],
    colors: [
      { label:"Black", key:"black" },
      { label:"Black Monochrome", key:"black_monochrome" },
      { label:"Red", key:"red" },
      { label:"Grey", key:"grey" },
      { label:"Navy", key:"navy" }
    ]
  }
};

/* ========================================================
   CART STORAGE
======================================================== */

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

/* ========================================================
   ADD TO CART
======================================================== */

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
  showToast('Added to cart');
}

function showToast(text) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('visible'), 10);
  setTimeout(() => toast.classList.remove('visible'), 1600);
  setTimeout(() => toast.remove(), 1900);
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

/* ========================================================
   PRODUCT CARD CLICK HANDLER
======================================================== */

function initProductCardLinks() {
  document.querySelectorAll('.product-card').forEach((card) => {
    const id = card.dataset.id;
    if (!id) return;

    card.addEventListener('click', (e) => {
      const t = e.target;

      if (
        t.closest('.add-to-cart') ||
        t.closest('.color-bubble') ||
        t.closest('.product-options') ||
        t.tagName === 'SELECT' ||
        t.tagName === 'INPUT' ||
        t.tagName === 'OPTION'
      ) {
        return;
      }

      window.location.href = `product.html?id=${encodeURIComponent(id)}`;
    });
  });
}

/* ========================================================
   COLOR BUBBLES ON SHOP PAGE (IMAGE SWAP)
======================================================== */

function initColorBubblesOnCards() {
  const cards = document.querySelectorAll('.product-card');

  cards.forEach((card) => {
    const bubbles = card.querySelectorAll('.color-bubble');
    const select = card.querySelector('.color-select');
    const img = card.querySelector('.product-card-img');

    if (!bubbles.length || !img || !select) return;

    bubbles.forEach((bubble) => {
      bubble.addEventListener('click', (e) => {
        e.stopPropagation();

        const color = bubble.dataset.color;

        const optionMatch = Array.from(select.options).find(
          (o) =>
            o.text === color ||
            o.text.startsWith(color) ||
            color.startsWith(o.text)
        );

        if (optionMatch) select.value = optionMatch.text;

        bubbles.forEach((b) => b.classList.remove('active'));
        bubble.classList.add('active');

        const key = color.toLowerCase().replace(/ /g, '_');
        const folder = card.dataset.id.replace(/-.*/, '');

        img.src = `images/${folder}/${key}.jpg`;
      });
    });
  });
}

/* ========================================================
   CART PAGE RENDERING
======================================================== */

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
      <div class="cart-items">${rowsHtml}</div>

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
          <span>Buy 2, get 10 percent off</span>
          <span>${discountEligible ? '-' + formatMoney(discountAmount) : 'Add 2+ items'}</span>
        </div>

        <div class="summary-row summary-total">
          <span>Total</span>
          <span>${formatMoney(total)}</span>
        </div>

        <button class="btn btn-primary summary-checkout">Checkout</button>
        <p class="summary-note">Payments powered by Stripe.</p>
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
      if (!cart.length) {
        alert('Your cart is empty.');
        return;
      }
      startCheckout(cart);
    });
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

/* ========================================================
   STRIPE CHECKOUT
======================================================== */

async function startCheckout(cart) {
  const origin = window.location.origin;

  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart, origin })
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert('Error starting checkout.');
  }
}

/* ========================================================
   PRODUCT PAGE BUILDER
======================================================== */

function initProductPage() {
  if (!location.pathname.includes("product.html")) return;

  const root = document.getElementById("product-root");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = PRODUCTS[id];

  if (!product) {
    root.innerHTML = "<h2>Product not found.</h2>";
    return;
  }

  const defaultColor = product.colors[0];

  root.innerHTML = `
    <div class="product-page-grid">
      <div class="product-page-image-wrap">
        <img id="product-main-img" src="images/${product.folder}/${defaultColor.key}.jpg" class="product-page-img">
      </div>

      <div class="product-page-info">
        <h1>${product.name}</h1>

        <p class="product-price">
          <span class="old-price">$${product.oldPrice}</span>
          <span class="new-price">$${product.price}</span>
        </p>

        <label>Color</label>
        <div class="color-bubbles" id="product-color-bubbles">
          ${product.colors.map(c => `
            <button class="color-bubble" data-key="${c.key}" data-label="${c.label}"></button>
          `).join("")}
        </div>

        <label>Size</label>
        <select id="product-size-select" class="size-select">
          ${product.sizes.map(s => `<option>${s}</option>`).join("")}
        </select>

        <label>Qty</label>
        <input id="product-qty" type="number" min="1" value="1" class="qty-input">

        <button id="product-add-btn" class="btn btn-primary">Add to Cart</button>
      </div>
    </div>

    <h2 style="margin-top:40px;">Shop Best Sellers</h2>
    <div class="product-grid" id="best-sellers-grid"></div>
  `;

  const img = document.getElementById("product-main-img");
  const bubbles = document.querySelectorAll("#product-color-bubbles .color-bubble");

  bubbles[0].classList.add("active");

  bubbles.forEach(b => {
    b.addEventListener("click", () => {
      bubbles.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      img.src = `images/${product.folder}/${b.dataset.key}.jpg`;
    });
  });

  document.getElementById("product-add-btn").addEventListener("click", () => {
    const size = document.getElementById("product-size-select").value;
    const qty = parseInt(document.getElementById("product-qty").value);
    const selectedBubble = document.querySelector(".color-bubble.active");

    addToCart({
      id,
      name: product.name,
      price: product.price,
      color: selectedBubble.dataset.label,
      size,
      quantity: qty
    });

    showToast("Added to cart");
  });

  renderBestSellers(id);
}

function addToCart(item) {
  const cart = loadCart();
  const existing = cart.find(
    (x) => x.id === item.id && x.color === item.color && x.size === item.size
  );

  if (existing) existing.quantity += item.quantity;
  else cart.push(item);

  saveCart(cart);
  updateCartBadge();
}

function renderBestSellers(excludeId) {
  const wrap = document.getElementById("best-sellers-grid");

  const ids = Object.keys(PRODUCTS).filter(i => i !== excludeId).slice(0,4);

  wrap.innerHTML = ids.map(id => {
    const p = PRODUCTS[id];
    return `
      <article class="product-card" data-id="${id}">
        <img class="product-card-img" src="images/${p.folder}/${p.colors[0].key}.jpg">
        <h3>${p.name}</h3>
        <p class="product-price">
          <span class="old-price">$${p.oldPrice}</span>
          <span class="new-price">$${p.price}</span>
        </p>
      </article>
    `;
  }).join("");

  initProductCardLinks();
}
/* ========================================================
   INIT
======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  setupAddToCartButtons();
  renderCartPage();
  initColorBubblesOnCards();
  initProductCardLinks();
  initProductPage();
});
