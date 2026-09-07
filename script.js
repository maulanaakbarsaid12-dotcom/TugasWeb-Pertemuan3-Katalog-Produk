(function(){
  const CAFE_WA = "+62822-7499-9653";

  const MENU = [
    {id:1, cat:"kopi", name:"Kopi Susu Gula Aren", desc:"Espresso, susu segar, gula aren asli.", price:22000},
    {id:2, cat:"kopi", name:"Americano", desc:"Espresso ganda dengan air panas atau dingin.", price:20000},
    {id:3, cat:"kopi", name:"Cappuccino", desc:"Espresso, foam susu tebal, taburan kayu manis.", price:25000, tag:"Favorit"},
    {id:4, cat:"kopi", name:"Kopi Tubruk MASH", desc:"Kopi robusta diseduh cara tradisional.", price:18000},
    {id:5, cat:"kopi", name:"Es Kopi Kelapa", desc:"Kopi hitam, santan kelapa, gula aren.", price:27000, tag:"Baru"},
    {id:6, cat:"bowl", name:"Mash Bowl Rendang", desc:"Kentang tumbuk mentega, suwiran rendang, bawang goreng.", price:35000, tag:"Favorit"},
    {id:7, cat:"bowl", name:"Mash Bowl Ayam Sambal Matah", desc:"Ayam suwir, sambal matah segar, telur setengah matang.", price:32000},
    {id:8, cat:"bowl", name:"Mash Bowl Jamur Truffle", desc:"Jamur tumis truffle oil, keju parmesan.", price:38000, tag:"Baru"},
    {id:9, cat:"bowl", name:"Mash Bowl Vegan Kale", desc:"Kentang tumbuk minyak zaitun, jamur, kale panggang.", price:30000},
    {id:10, cat:"toast", name:"Toast Alpukat Telur", desc:"Roti panggang, alpukat, telur poach, chili flakes.", price:28000},
    {id:11, cat:"toast", name:"Sandwich Smoked Beef", desc:"Smoked beef, keju cheddar, selada, saus mustard madu.", price:33000},
    {id:12, cat:"toast", name:"Toast Selai Kacang Pisang", desc:"Selai kacang homemade, pisang, madu.", price:24000},
    {id:13, cat:"minuman", name:"Es Teh Serai", desc:"Teh hitam, serai segar, sedikit madu.", price:15000},
    {id:14, cat:"minuman", name:"Lemon Mint Soda", desc:"Perasan lemon segar, daun mint, soda dingin.", price:20000},
    {id:15, cat:"minuman", name:"Smoothie Mangga", desc:"Mangga segar, yogurt, es batu.", price:24000},
    {id:16, cat:"dessert", name:"Banana Bread Slice", desc:"Dipanggang setiap pagi, disajikan hangat.", price:18000},
    {id:17, cat:"dessert", name:"Choco Lava Mash Cup", desc:"Cokelat leleh di atas base kentang tumbuk manis.", price:26000, tag:"Baru"},
    {id:18, cat:"dessert", name:"Puding Kopi", desc:"Puding lembut rasa kopi, saus karamel.", price:20000}
  ];

  const CATS = [
    {id:"semua", label:"Semua"},
    {id:"kopi", label:"Kopi"},
    {id:"bowl", label:"Mash Bowl"},
    {id:"toast", label:"Toast & Sandwich"},
    {id:"minuman", label:"Minuman Segar"},
    {id:"dessert", label:"Dessert"}
  ];

  let activeCat = "semua";
  let cart = {}; // id -> qty

  const rupiah = n => "Rp" + n.toLocaleString("id-ID");

  const menuList = document.getElementById("menuList");
  const catTabs = document.getElementById("catTabs");

  function renderTabs(){
    catTabs.innerHTML = CATS.map(c =>
      `<button class="cat-tab ${c.id===activeCat?'active':''}" data-cat="${c.id}">${c.label}</button>`
    ).join("");
    catTabs.querySelectorAll(".cat-tab").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        activeCat = btn.dataset.cat;
        renderTabs();
        renderMenu();
      });
    });
  }

  function renderMenu(){
    const items = MENU.filter(m => activeCat==="semua" || m.cat===activeCat);
    menuList.innerHTML = items.map(m => {
      const qty = cart[m.id] || 0;
      const control = qty>0
        ? `<div class="stepper">
             <button data-act="dec" data-id="${m.id}" aria-label="Kurangi">−</button>
             <span class="qv">${qty}</span>
             <button data-act="inc" data-id="${m.id}" aria-label="Tambah">+</button>
           </div>`
        : `<button class="add-btn" data-act="inc" data-id="${m.id}">+ Tambah</button>`;
      return `
        <div class="menu-row">
          <div class="menu-info">
            <h3>${m.name} ${m.tag ? `<span class="tag ${m.tag==='Baru'?'new':''}">${m.tag}</span>` : ""}</h3>
            <p>${m.desc}</p>
          </div>
          <div class="menu-price">${rupiah(m.price)}</div>
          <div class="qty-zone">${control}</div>
        </div>`;
    }).join("");

    menuList.querySelectorAll("[data-act]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = Number(btn.dataset.id);
        if(btn.dataset.act==="inc") addQty(id,1); else addQty(id,-1);
      });
    });
  }

  function addQty(id, delta){
    const current = cart[id] || 0;
    const next = current + delta;
    if(next<=0) delete cart[id]; else cart[id]=next;
    renderMenu();
    renderCart();
  }

  // ---------- CART / DRAWER ----------
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("overlay");
  const drawerBody = document.getElementById("drawerBody");
  const cartBadge = document.getElementById("cartBadge");
  const stickyBar = document.getElementById("stickyBar");
  const stickyTotal = document.getElementById("stickyTotal");
  const checkoutOpenBtn = document.getElementById("checkoutOpenBtn");

  function cartCount(){ return Object.values(cart).reduce((a,b)=>a+b,0); }
  function cartLines(){
    return Object.entries(cart).map(([id,qty])=>{
      const item = MENU.find(m=>m.id===Number(id));
      return {...item, qty, lineTotal: item.price*qty};
    });
  }
  function subtotal(){ return cartLines().reduce((a,l)=>a+l.lineTotal,0); }
  function tax(){ return Math.round(subtotal()*0.05); }
  function total(){ return subtotal()+tax(); }

  function renderCart(){
    const lines = cartLines();
    cartBadge.textContent = cartCount();
    if(lines.length===0){
      drawerBody.innerHTML = `<div class="cart-empty">Keranjang masih kosong.<br>Yuk pilih menu favoritmu.</div>`;
    } else {
      drawerBody.innerHTML = lines.map(l => `
        <div class="cart-row">
          <div>
            <h4>${l.name}</h4>
            <div class="price-each">${l.qty} × ${rupiah(l.price)}</div>
          </div>
          <div class="cart-row-right">
            <div class="cart-line-total">${rupiah(l.lineTotal)}</div>
            <button class="remove-link" data-id="${l.id}">Hapus</button>
          </div>
        </div>`).join("");
      drawerBody.querySelectorAll(".remove-link").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          delete cart[Number(btn.dataset.id)];
          renderMenu(); renderCart();
        });
      });
    }
    document.getElementById("sumSubtotal").textContent = rupiah(subtotal());
    document.getElementById("sumTax").textContent = rupiah(tax());
    document.getElementById("sumTotal").textContent = rupiah(total());
    checkoutOpenBtn.disabled = lines.length===0;

    stickyTotal.textContent = rupiah(total());
    stickyBar.classList.toggle("show", lines.length>0 && !drawer.classList.contains("open"));
  }

  function openDrawer(){ drawer.classList.add("open"); overlay.classList.add("open"); stickyBar.classList.remove("show"); }
  function closeDrawer(){ drawer.classList.remove("open"); overlay.classList.remove("open"); renderCart(); }

  document.getElementById("cartOpenBtn").addEventListener("click", openDrawer);
  document.getElementById("stickyOpenBtn").addEventListener("click", openDrawer);
  document.getElementById("drawerCloseBtn").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", ()=>{ closeDrawer(); closeModal(checkoutModal); closeModal(successModal); });

  // ---------- MOBILE NAV ----------
  const mainNav = document.getElementById("mainNav");
  document.getElementById("menuToggleBtn").addEventListener("click", ()=>{
    mainNav.classList.toggle("mobile-open");
  });
  mainNav.querySelectorAll("a").forEach(a=>a.addEventListener("click", ()=> mainNav.classList.remove("mobile-open")));

  // ---------- CHECKOUT MODAL ----------
  const checkoutModal = document.getElementById("checkoutModal");
  const successModal = document.getElementById("successModal");
  function openModal(m){ m.classList.add("open"); overlay.classList.add("open"); }
  function closeModal(m){ m.classList.remove("open"); if(!checkoutModal.classList.contains("open") && !successModal.classList.contains("open") && !drawer.classList.contains("open")) overlay.classList.remove("open"); }

  checkoutOpenBtn.addEventListener("click", ()=>{
    closeDrawer();
    openModal(checkoutModal);
  });
  document.getElementById("checkoutCancelBtn").addEventListener("click", ()=> closeModal(checkoutModal));

  document.getElementById("checkoutForm").addEventListener("submit", function(e){
    e.preventDefault();
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const type = document.getElementById("orderType").value;
    const tableNo = document.getElementById("tableNo").value.trim();
    const note = document.getElementById("orderNote").value.trim();
    if(!name || !phone){ return; }

    const orderId = "MASH-" + Math.floor(1000 + Math.random()*9000);
    const lines = cartLines();

    document.getElementById("orderIdOut").textContent = orderId;
    document.getElementById("receiptOut").innerHTML =
      lines.map(l=>`<div class="receipt-row"><span>${l.qty}× ${l.name}</span><span>${rupiah(l.lineTotal)}</span></div>`).join("") +
      `<div class="receipt-row"><span>Pajak & layanan</span><span>${rupiah(tax())}</span></div>` +
      `<div class="receipt-row" style="font-weight:700;border-top:1px solid var(--border);margin-top:6px;padding-top:8px;"><span>Total</span><span>${rupiah(total())}</span></div>`;

    let waText = `Halo MASH, saya *${name}* mau pesan (${orderId}):%0A`;
    lines.forEach(l=>{ waText += `- ${l.qty}x ${l.name} (${rupiah(l.lineTotal)})%0A`; });
    waText += `Subtotal: ${rupiah(subtotal())}%0APajak & layanan: ${rupiah(tax())}%0ATotal: ${rupiah(total())}%0ATipe: ${type}${tableNo ? " - Meja "+tableNo : ""}%0A`;
    if(note) waText += `Catatan: ${note}%0A`;
    waText += `No. WA: ${phone}`;
    document.getElementById("waBtn").href = `https://wa.me/${CAFE_WA}?text=${waText}`;

    closeModal(checkoutModal);
    openModal(successModal);

    cart = {};
    renderMenu();
    renderCart();
    document.getElementById("checkoutForm").reset();
  });

  document.getElementById("successCloseBtn").addEventListener("click", ()=>{
    closeModal(successModal);
  });

  // init
  renderTabs();
  renderMenu();
  renderCart();
})();