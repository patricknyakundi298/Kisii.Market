// scripts.js - client-side demo logic using localStorage
(function(){
  function el(id){ return document.getElementById(id); }
  function qs(sel){ return document.querySelector(sel); }
  function show(node){ node && node.classList.remove('hidden'); }
  function hide(node){ node && node.classList.add('hidden'); }

  // localStorage wrapper
  const DB = {
    users: ()=> JSON.parse(localStorage.getItem('kmarket_users')||'[]'),
    saveUsers: u=> localStorage.setItem('kmarket_users', JSON.stringify(u)),
    products: ()=> JSON.parse(localStorage.getItem('kmarket_products')||'[]'),
    saveProducts: p=> localStorage.setItem('kmarket_products', JSON.stringify(p)),
    messages: ()=> JSON.parse(localStorage.getItem('kmarket_messages')||'[]'),
    saveMessages: m=> localStorage.setItem('kmarket_messages', JSON.stringify(m)),
    currentUser: ()=> JSON.parse(localStorage.getItem('kmarket_current')||'null'),
    setCurrent: u=> localStorage.setItem('kmarket_current', JSON.stringify(u)),
    clearCurrent: ()=> localStorage.removeItem('kmarket_current')
  };

  // Setup nav login links
  const navIDs = ['nav-login','nav-login-2','nav-login-3','nav-login-4'];
  navIDs.forEach(id=>{
    const a = el(id);
    if(a) a.addEventListener('click', e=>{ e.preventDefault(); openAuth(); });
  });

  // AUTH modal elements
  const modal = el('modal-auth'), closeAuth = el('close-auth');
  const tabLogin = el('tab-login'), tabRegister = el('tab-register');
  const loginForm = el('login-form'), registerForm = el('register-form');
  function openAuth(){ modal && modal.classList.remove('hidden'); modal && (modal.setAttribute('aria-hidden','false')); }
  function closeAuthModal(){ modal && modal.classList.add('hidden'); modal && (modal.setAttribute('aria-hidden','true')); }
  if(closeAuth) closeAuth.addEventListener('click', closeAuthModal);
  if(tabLogin) tabLogin.addEventListener('click', ()=>{ tabLogin.classList.add('active'); tabRegister.classList.remove('active'); hide(registerForm); show(loginForm); });
  if(tabRegister) tabRegister.addEventListener('click', ()=>{ tabRegister.classList.add('active'); tabLogin.classList.remove('active'); hide(loginForm); show(registerForm); });
  const gotoRegister = el('goto-register'); if(gotoRegister) gotoRegister.addEventListener('click', e=>{ e.preventDefault(); tabRegister.click(); });

  // Register action
  const btnRegister = el('btn-register');
  if(btnRegister) btnRegister.addEventListener('click', ()=>{
    const name = (el('reg-name')||{}).value || '';
    const email = (el('reg-email')||{}).value || '';
    const pw = (el('reg-password')||{}).value || '';
    if(!name||!email||pw.length<6){ alert('Fill all fields; password min 6 chars'); return; }
    const users = DB.users();
    if(users.find(u=>u.email === email)){ alert('Account exists with this email/phone'); return; }
    const user = { id: 'u'+Date.now(), name, email, password: pw, subscribed:false, shopName:'' };
    users.push(user); DB.saveUsers(users); DB.setCurrent(user);
    alert('Account created — welcome '+name);
    closeAuthModal(); window.location = 'dashboard.html';
  });

  // Login action
  const btnLogin = el('btn-login');
  if(btnLogin) btnLogin.addEventListener('click', ()=>{
    const email = (el('login-email')||{}).value || '';
    const pw = (el('login-password')||{}).value || '';
    const users = DB.users();
    const user = users.find(u=> u.email === email && u.password === pw);
    if(!user){ alert('Invalid credentials'); return; }
    DB.setCurrent(user); alert('Welcome back, '+user.name); closeAuthModal(); window.location = 'dashboard.html';
  });

  // HOME search & categories
  if(el('home-search-btn')) el('home-search-btn').addEventListener('click', ()=>{
    const q = (el('home-search')||{}).value || '';
    if(q) window.location = 'products.html?search='+encodeURIComponent(q);
    else window.location = 'products.html';
  });
  document.querySelectorAll('.cat-btn').forEach(b=> b.addEventListener('click', ()=>{ const c=b.dataset.cat; window.location='products.html?cat='+encodeURIComponent(c); }));

  // PRODUCTS page logic
  function renderProducts(filter){
    const grid = el('products-grid'); if(!grid) return;
    grid.innerHTML = '';
    const products = DB.products();
    const filtered = products.filter(p=>{
      if(filter.cat && filter.cat !== '' && p.cat !== filter.cat) return false;
      if(filter.q && filter.q !== '' ){
        const q = filter.q.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      }
      return true;
    });
    if(filtered.length === 0){ grid.innerHTML = '<p class="muted">No products found.</p>'; return; }
    filtered.forEach(p=>{
      const card = document.createElement('div'); card.className = 'product-card';
      card.innerHTML = `<h4>${p.title}</h4><div>${p.desc}</div><div class="muted">Category: ${p.cat}</div><div style="font-weight:700;margin-top:6px">Ksh ${p.price}</div><div style="margin-top:8px"><button class="btn btn-buy" data-id="${p.id}">Contact Seller</button></div>`;
      grid.appendChild(card);
    });
    document.querySelectorAll('.btn-buy').forEach(b=> b.addEventListener('click', e=>{
      const id = e.target.dataset.id; const p = DB.products().find(x=>x.id===id);
      if(!p) return alert('Product not found'); alert('Contact seller: '+(p.contact||'0710723242')+' (demo)');
    }));
  }

  if(window.location.pathname.endsWith('products.html')){
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search')||''; const cat = params.get('cat')||'';
    if(q) el('search-input').value = q;
    if(cat) el('filter-cat').value = cat;
    el('search-btn').addEventListener('click', ()=> {
      const q2 = el('search-input').value.trim(); const cat2 = el('filter-cat').value;
      renderProducts({q:q2, cat:cat2});
    });
    el('btn-add-demo').addEventListener('click', ()=> {
      const demo = { id:'p'+Date.now(), title:'Fresh Bananas', desc:'From Kisii farms', price:150, cat:'Produce', contact:'0710723242' };
      const products = DB.products(); products.unshift(demo); DB.saveProducts(products); renderProducts({q:'',cat:''});
    });
    // initial render (apply query)
    renderProducts({q:q, cat:cat});
  }

  // SELL page: subscription demo
  if(window.location.pathname.endsWith('sell.html')){
    el('btn-seller').addEventListener('click', ()=>{
      const name = (el('seller-name')||{}).value.trim();
      const phone = (el('seller-phone')||{}).value.trim();
      const shop = (el('seller-shop')||{}).value.trim();
      const cat = (el('seller-category')||{}).value;
      if(!name||!phone||!shop){ el('seller-message').textContent = 'Fill all fields'; return; }
      // simulate payment success
      const users = DB.users();
      const cur = DB.currentUser();
      if(cur){
        const u = users.find(x=>x.id===cur.id);
        if(u){ u.subscribed = true; u.shopName = shop; DB.saveUsers(users); DB.setCurrent(u); el('seller-message').textContent = 'Subscribed! Your shop: '+shop; }
      } else {
        // save seller info locally and show message
        el('seller-message').textContent = 'Thank you! We received your request. Sign in to manage your shop.';
      }
    });
  }

  // CONTACT page
  if(window.location.pathname.endsWith('contact.html')){
    el('btn-contact').addEventListener('click', ()=>{
      const n = (el('contact-name')||{}).value.trim();
      const p = (el('contact-phone')||{}).value.trim();
      const m = (el('contact-message')||{}).value.trim();
      if(!n||!p||!m){ el('contact-feedback').textContent = 'Fill all fields'; return; }
      const messages = DB.messages(); messages.push({ id:'m'+Date.now(), from:n, phone:p, body:m, when: Date.now() });
      DB.saveMessages(messages);
      el('contact-feedback').textContent = 'Message sent — we will contact you at '+p;
      el('contact-form').reset();
    });
  }

  // DASHBOARD protection & logic
  if(window.location.pathname.endsWith('dashboard.html')){
    const user = DB.currentUser();
    if(!user){ alert('You must sign in first'); window.location='index.html'; }
    else {
      el('user-name').textContent = user.name;
      // show inbox
      const inbox = el('inbox'); inbox.innerHTML = '';
      const messages = DB.messages().filter(m=> true); // demo: show all messages
      if(messages.length === 0) inbox.innerHTML = '<p class="muted">No messages</p>';
      messages.forEach(m=>{
        const d = document.createElement('div'); d.className='card';
        d.innerHTML = `<strong>${m.from}</strong><div class="muted">${m.body}</div>`;
        inbox.appendChild(d);
      });

      // subscription status
      if(user.subscribed){ el('sub-status').textContent = 'Subscribed — Ksh 100 / month (demo)'; el('btn-cancel-sub').classList.remove('hidden'); } else { el('sub-status').textContent = 'Not subscribed'; }
    }

    // Post product
    el('btn-post-product').addEventListener('click', ()=>{
      const title = (el('post-title')||{}).value.trim(); const price = (el('post-price')||{}).value.trim(); const cat = (el('post-cat')||{}).value; const desc = (el('post-desc')||{}).value.trim();
      if(!title||!price||!desc){ el('post-feedback').textContent = 'Fill all fields'; return; }
      const products = DB.products();
      const cur = DB.currentUser();
      const p = { id:'p'+Date.now(), title, desc, price, cat, contact: cur ? (cur.email || cur.name) : '0710723242' };
      products.unshift(p); DB.saveProducts(products);
      el('post-feedback').textContent = 'Product added to marketplace (demo)';
      // clear inputs
      el('post-title').value=''; el('post-price').value=''; el('post-desc').value='';
    });

    // send inbox message
    el('btn-send-msg').addEventListener('click', ()=>{
      const to = (el('msg-to')||{}).value.trim(); const sub = (el('msg-sub')||{}).value.trim(); const body = (el('msg-body')||{}).value.trim();
      if(!to||!body){ alert('Add recipient and message'); return; }
      const messages = DB.messages(); const cur = DB.currentUser();
      messages.push({ id:'m'+Date.now(), from: cur.name, to, subject: sub, body, when: Date.now() });
      DB.saveMessages(messages); alert('Message sent (demo)'); el('msg-to').value=''; el('msg-sub').value=''; el('msg-body').value='';
    });

    // cancel subscription (demo)
    el('btn-cancel-sub').addEventListener('click', ()=>{
      const cur = DB.currentUser(); if(!cur) return;
      const users = DB.users(); const u = users.find(x=>x.id===cur.id); if(u){ u.subscribed = false; DB.saveUsers(users); DB.setCurrent(u); el('sub-status').textContent='Not subscribed'; el('btn-cancel-sub').classList.add('hidden'); alert('Subscription cancelled (demo)'); }
    });

    // logout
    el('logout-link').addEventListener('click', e=>{ e.preventDefault(); DB.clearCurrent(); alert('Logged out'); window.location='index.html'; });
  }

  // helpers to ensure modal close when clicking outside content
  window.addEventListener('click', e=>{ if(e.target === modal) closeAuthModal(); });

})();
