(() => {
  // ---------------------------
  // Test Data (カテゴリ/商品)
  // ---------------------------
  const products = [
    // Burgers
    { id:'bg001', name:'クラシックバーガー', price:690, category:'バーガー', emoji:'🍔', desc:'王道の味。ジューシーなパティと香ばしいバンズ。' },
    { id:'bg002', name:'チーズバーガー', price:760, category:'バーガー', emoji:'🧀', desc:'濃厚チェダーチーズをとろりとオン。' },
    { id:'bg003', name:'アボカドバーガー', price:860, category:'バーガー', emoji:'🥑', desc:'クリーミーなアボカドが贅沢なコク。' },
    { id:'bg004', name:'スパイシーバーガー', price:820, category:'バーガー', emoji:'🌶️', desc:'ピリッと刺激的。クセになる辛さ。' },

    // Sides
    { id:'sd001', name:'フレンチフライ', price:320, category:'サイド', emoji:'🍟', desc:'外はカリッと中はホクホク。' },
    { id:'sd002', name:'オニオンリング', price:360, category:'サイド', emoji:'🧅', desc:'サクサク衣に甘いオニオン。' },
    { id:'sd003', name:'チキンナゲット', price:420, category:'サイド', emoji:'🍗', desc:'ひとくちサイズで止まらない。' },

    // Drinks
    { id:'dr001', name:'アイスコーヒー', price:290, category:'ドリンク', emoji:'🥤', desc:'すっきりビター。' },
    { id:'dr002', name:'カフェラテ', price:370, category:'ドリンク', emoji:'☕', desc:'まろやかなコクと香り。' },
    { id:'dr003', name:'レモネード', price:340, category:'ドリンク', emoji:'🍋', desc:'爽やかな酸味でリフレッシュ。' },

    // Desserts
    { id:'ds001', name:'ソフトクリーム', price:280, category:'デザート', emoji:'🍦', desc:'なめらか食感の定番。' },
    { id:'ds002', name:'チョコサンデー', price:360, category:'デザート', emoji:'🍫', desc:'濃厚チョコで心も満たされる。' },

    // Specials
    { id:'sp001', name:'月見バーガー', price:880, category:'限定', emoji:'🌕', desc:'今だけの特別。とろ〜り卵が主役。' },
    { id:'sp002', name:'トリュフ香るフライ', price:520, category:'限定', emoji:'🍄', desc:'香り高い大人の贅沢サイド。' },
  ];
  const categories = ['すべて', ...Array.from(new Set(products.map(p => p.category)))];

  // ---------------------------
  // State
  // ---------------------------
  const state = {
    activeCategory: 'すべて',
    cart: loadCart(), // Map<id, { product, qty }>
  };

  // ---------------------------
  // Elements
  // ---------------------------
  const els = {
    categoryTabs: document.getElementById('categoryTabs'),
    productGrid: document.getElementById('productGrid'),
    cartButton: document.getElementById('cartButton'),
    cartCount: document.getElementById('cartCount'),
    cartTotal: document.getElementById('cartTotal'),
    cartDrawer: document.getElementById('cartDrawer'),
    cartItems: document.getElementById('cartItems'),
    subtotal: document.getElementById('subtotal'),
    tax: document.getElementById('tax'),
    total: document.getElementById('total'),
    overlay: document.getElementById('overlay'),
    closeCart: document.getElementById('closeCart'),
    clearCart: document.getElementById('clearCart'),
    checkout: document.getElementById('checkout'),
    toast: document.getElementById('toast'),
    orderModal: document.getElementById('orderModal'),
    closeModal: document.getElementById('closeModal'),
    modalBody: document.getElementById('modalBody'),
  };

  // ---------------------------
  // Init
  // ---------------------------
  renderCategoryTabs();
  renderProducts();
  updateCartHeader();
  bindGlobalEvents();
  revealOnScroll();

  // ---------------------------
  // Rendering
  // ---------------------------
  function renderCategoryTabs() {
    els.categoryTabs.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cat;
      btn.setAttribute('aria-pressed', state.activeCategory === cat ? 'true' : 'false');
      btn.addEventListener('click', (e) => {
        ripple(e);
        state.activeCategory = cat;
        [...els.categoryTabs.children].forEach(c => c.setAttribute('aria-pressed','false'));
        btn.setAttribute('aria-pressed','true');
        renderProducts();
      });
      els.categoryTabs.appendChild(btn);
    });
  }

  function renderProducts() {
    const list = state.activeCategory === 'すべて'
      ? products
      : products.filter(p => p.category === state.activeCategory);

    els.productGrid.innerHTML = '';
    list.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-media">
          <div class="emoji" aria-hidden="true">${p.emoji}</div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${p.name}</h3>
          <p class="card-desc">${p.desc}</p>
          <div class="card-foot">
            <span class="price">${formatJPY(p.price)}</span>
            <button class="btn primary" data-id="${p.id}">カートに追加</button>
          </div>
        </div>
      `;
      const btn = card.querySelector('button');
      btn.addEventListener('click', (e) => {
        ripple(e);
        addToCart(p.id, card.querySelector('.emoji'));
      });
      els.productGrid.appendChild(card);
      requestAnimationFrame(() => card.classList.add('reveal'));
    });
  }

  function renderCart() {
    els.cartItems.innerHTML = '';
    const items = [...state.cart.values()];
    if (items.length === 0) {
      els.cartItems.innerHTML = `<p style="color:var(--muted);text-align:center;margin:16px 0;">カートは空です。</p>`;
    } else {
      items.forEach(({product, qty}) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <div class="thumb" aria-hidden="true">${product.emoji}</div>
          <div>
            <div class="item-title">${product.name}</div>
            <div class="item-meta">${formatJPY(product.price)} / 個</div>
          </div>
          <div class="qty">
            <button data-id="${product.id}" data-act="dec" aria-label="数量を減らす">−</button>
            <span aria-live="polite" style="min-width:20px;text-align:center">${qty}</span>
            <button data-id="${product.id}" data-act="inc" aria-label="数量を増やす">＋</button>
          </div>
        `;
        const [decBtn, , incBtn] = row.querySelectorAll('button');
        decBtn.addEventListener('click', (e)=>{ ripple(e); changeQty(product.id, -1); });
        incBtn.addEventListener('click', (e)=>{ ripple(e); changeQty(product.id, +1); });
        els.cartItems.appendChild(row);
      });
    }
    updateTotals();
  }

  // ---------------------------
  // Cart logic
  // ---------------------------
  function addToCart(productId, fromEl) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const current = state.cart.get(productId);
    state.cart.set(productId, { product, qty: (current?.qty || 0) + 1 });
    persistCart();
    updateCartHeader();
    animateToCart(fromEl);
    showToast(`${product.name} を追加しました`);
  }

  function changeQty(productId, delta) {
    const entry = state.cart.get(productId);
    if (!entry) return;
    const next = entry.qty + delta;
    if (next <= 0) {
      state.cart.delete(productId);
    } else {
      entry.qty = next;
      state.cart.set(productId, entry);
    }
    persistCart();
    updateCartHeader();
    renderCart();
  }

  function clearCart() {
    state.cart.clear();
    persistCart();
    updateCartHeader();
    renderCart();
  }

  function updateTotals() {
    const sub = [...state.cart.values()].reduce((s, {product, qty}) => s + product.price * qty, 0);
    const tax = Math.round(sub * 0.10);
    const total = sub + tax;
    els.subtotal.textContent = formatJPY(sub);
    els.tax.textContent = formatJPY(tax);
    els.total.textContent = formatJPY(total);
  }

  function updateCartHeader() {
    const count = [...state.cart.values()].reduce((c, it) => c + it.qty, 0);
    const sum = [...state.cart.values()].reduce((s, it) => s + it.product.price * it.qty, 0);
    els.cartCount.textContent = String(count);
    els.cartTotal.textContent = formatJPY(sum);
  }

  // ---------------------------
  // UI plumbing
  // ---------------------------
  function openCart() {
    els.cartDrawer.classList.add('open');
    els.overlay.classList.add('show');
    els.cartDrawer.setAttribute('aria-hidden','false');
    renderCart();
  }
  function closeCart() {
    els.cartDrawer.classList.remove('open');
    els.overlay.classList.remove('show');
    els.cartDrawer.setAttribute('aria-hidden','true');
  }

  function bindGlobalEvents() {
    els.cartButton.addEventListener('click', openCart);
    els.closeCart.addEventListener('click', closeCart);
    els.overlay.addEventListener('click', () => {
      closeCart();
      hideModal();
    });
    els.clearCart.addEventListener('click', (e)=>{ ripple(e); clearCart(); showToast('カートを空にしました'); });
    els.checkout.addEventListener('click', (e)=>{ ripple(e); startCheckout(); });
    els.closeModal.addEventListener('click', hideModal);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeCart(); hideModal(); }});
  }

  // ---------------------------
  // Checkout mock
  // ---------------------------
  function startCheckout() {
    if (state.cart.size === 0) {
      showToast('カートが空です'); 
      return;
    }
    showModal(loadingView());
    const latency = 1200 + Math.random()*800;
    setTimeout(() => {
      const orderNo = 'MO-' + Date.now().toString().slice(-6);
      const eta = 5 + Math.floor(Math.random()*8);
      showModal(successView(orderNo, eta));
      clearCart();
    }, latency);
  }

  function loadingView() {
    return `
      <div class="loading">
        <div class="spinner"></div>
        <p>送信中...</p>
      </div>
    `;
  }

  function successView(orderNo, eta) {
    const items = [...state.cart.values()]
      .map(({product, qty}) => `<li>${product.emoji} ${product.name} × ${qty}</li>`).join('');
    return `
      <div>
        <p style="color:var(--success);font-weight:800;margin:0 0 4px;">✅ 注文が完了しました！</p>
        <p style="margin:0 0 8px;color:var(--muted)">注文番号: <strong>${orderNo}</strong></p>
        <p style="margin:0 0 8px;">お受け取りの目安: <strong>${eta} 分</strong></p>
        <ul style="padding-left:18px;line-height:1.7;margin:8px 0 14px;">${items || '<li>（カートは空になりました）</li>'}</ul>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn secondary" id="closeSuccess">閉じる</button>
          <button class="btn primary" id="backTop">トップへ戻る</button>
        </div>
      </div>
    `;
  }

  function showModal(html) {
    els.modalBody.innerHTML = html;
    els.orderModal.classList.add('show');
    els.orderModal.setAttribute('aria-hidden','false');
    requestAnimationFrame(() => {
      const close = document.getElementById('closeSuccess');
      const back = document.getElementById('backTop');
      if (close) close.addEventListener('click', hideModal);
      if (back) back.addEventListener('click', () => { hideModal(); window.scrollTo({top:0, behavior:'smooth'}); });
    });
  }

  function hideModal() {
    els.orderModal.classList.remove('show');
    els.orderModal.setAttribute('aria-hidden','true');
  }

  // ---------------------------
  // Effects
  // ---------------------------
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=> els.toast.classList.remove('show'), 1600);
  }

  function ripple(e) {
    const btn = e.currentTarget;
    const r = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.className = 'ripple';
    r.style.width = r.style.height = `${size}px`;
    r.style.left = `${e.clientX - rect.left - size/2}px`;
    r.style.top = `${e.clientY - rect.top - size/2}px`;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(r);
    setTimeout(()=> r.remove(), 600);
  }

  function animateToCart(fromEl) {
    if (!fromEl) return;
    const cartBtn = els.cartButton;
    const s = fromEl.getBoundingClientRect();
    const t = cartBtn.getBoundingClientRect();
    const ghost = fromEl.cloneNode(true);
    ghost.style.position = 'fixed';
    ghost.style.left = s.left + 'px';
    ghost.style.top = s.top + 'px';
    ghost.style.zIndex = 2000;
    ghost.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1), opacity .6s ease';
    document.body.appendChild(ghost);
    const dx = t.left + t.width/2 - (s.left + s.width/2);
    const dy = t.top + t.height/2 - (s.top + s.height/2);
    requestAnimationFrame(() => {
      ghost.style.transform = `translate(${dx}px, ${dy}px) scale(.3) rotate(15deg)`;
      ghost.style.opacity = '0';
    });
    setTimeout(()=> ghost.remove(), 620);
  }

  function revealOnScroll() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('reveal');
          io.unobserve(en.target);
        }
      });
    }, {threshold: .1});
    window._revealObserver = io;
  }

  // ---------------------------
  // Utils
  // ---------------------------
  function formatJPY(n){ return '¥' + n.toLocaleString('ja-JP'); }

  function persistCart() {
    const simple = [...state.cart.values()].map(({product, qty}) => ({ id: product.id, qty }));
    localStorage.setItem('mo_cart_v1', JSON.stringify(simple));
  }
  function loadCart() {
    try{
      const raw = localStorage.getItem('mo_cart_v1');
      if(!raw) return new Map();
      const items = JSON.parse(raw);
      const m = new Map();
      items.forEach(({id, qty}) => {
        const p = products.find(x => x.id === id);
        if (p) m.set(id, { product: p, qty });
      });
      return m;
    }catch{ return new Map(); }
  }
})();