(function(){
  // Nomor WhatsApp kasir MASH Cafe. WAJIB format internasional TANPA tanda +, spasi, atau strip.
  // Contoh: nomor 0822-7499-9653 ditulis jadi "6282274999653" (62 = kode negara Indonesia,
  // angka 0 di depan nomor asli dibuang).
  const CAFE_WA = "6282274999653";

  // Nomor QRIS statis MASH Cafe (ganti sesuai data merchant asli / NMID kamu)
  const QRIS_MERCHANT_ID = "MASHCAFE-MEDAN-0822";

  // Sumber gambar kode QRIS yang ditampilkan ke pelanggan.
  // - Kalau sudah punya gambar QRIS asli (screenshot dari bank/e-wallet), taruh filenya
  //   di folder yang sama dengan index.html lalu isi nama filenya di sini, contoh: "QRIS.png"
  // - Kalau masih mau pakai kode QR yang digenerate otomatis (bukan QRIS asli, cuma demo),
  //   biarkan nilainya "" (string kosong).
  const QRIS_STATIC_IMAGE = "";

  const MENU = [
    // ---- KOPI PANAS ----
    {id:1,  cat:"kopi-panas",  name:"Kopi Susu Gula Aren (Panas)", desc:"Espresso, susu segar, gula aren asli, disajikan hangat.", price:22000, img:"Kopi susu gula aren.jpg"},
    {id:2,  cat:"kopi-panas",  name:"Americano Panas", desc:"Espresso ganda dengan air panas.", price:20000, img:"Americano.jpg"},
    {id:3,  cat:"kopi-panas",  name:"Cappuccino", desc:"Espresso, foam susu tebal, taburan kayu manis.", price:25000, tag:"Favorit", img:"Cappuccino.jpg"},
    {id:4,  cat:"kopi-panas",  name:"Kopi Tubruk MASH", desc:"Kopi robusta diseduh cara tradisional.", price:18000, img:"Kopi tubruk.jpg"},
    // ---- KOPI DINGIN ----
    {id:19, cat:"kopi-dingin", name:"Es Kopi Susu Gula Aren", desc:"Espresso, susu segar, gula aren asli, disajikan dingin.", price:23000, img:"Kopi susu gula aren.jpg"},
    {id:20, cat:"kopi-dingin", name:"Es Americano", desc:"Espresso ganda dituang di atas es batu.", price:21000, img:"Americano.jpg"},
    {id:5,  cat:"kopi-dingin", name:"Es Kopi Kelapa", desc:"Kopi hitam, santan kelapa, gula aren.", price:27000, tag:"Baru", img:"Kopi kelapa.jpeg"},
    // ---- MASH BOWL ----
    {id:6,  cat:"bowl", name:"Mash Bowl Rendang", desc:"Kentang tumbuk mentega, suwiran rendang, bawang goreng.", price:35000, tag:"Favorit", img:"Bold rendang.jpeg"},
    {id:7,  cat:"bowl", name:"Mash Bowl Ayam Sambal Matah", desc:"Ayam suwir, sambal matah segar, telur setengah matang.", price:32000, img:"Bold ayam matah.jpg"},
    {id:8,  cat:"bowl", name:"Mash Bowl Jamur Truffle", desc:"Jamur tumis truffle oil, keju parmesan.", price:38000, tag:"Baru", img:"Bold jamur.jpeg "},
    {id:9,  cat:"bowl", name:"Mash Bowl Vegan Kale", desc:"Kentang tumbuk minyak zaitun, jamur, kale panggang.", price:30000, img:"Bold Page.png"},
    // ---- TOAST & SANDWICH ----
    {id:10, cat:"toast", name:"Toast Alpukat Telur", desc:"Roti panggang, alpukat, telur poach, chili flakes.", price:28000, img:"Toast Alpukat Telur.png"},
    {id:11, cat:"toast", name:"Sandwich Smoked Beef", desc:"Smoked beef, keju cheddar, selada, saus mustard madu.", price:33000, img:"Sandwich Smoked Beef.png"},
    {id:12, cat:"toast", name:"Toast Selai Kacang Pisang", desc:"Selai kacang homemade, pisang, madu.", price:24000, img:"Toast Selai Kacang Pisang.png"},
    // ---- MINUMAN SEGAR (DINGIN) ----
    {id:13, cat:"minuman", name:"Es Teh Serai", desc:"Teh hitam, serai segar, sedikit madu.", price:15000, img:"Es Teh Serai.png"},
    {id:14, cat:"minuman", name:"Lemon Mint Soda", desc:"Perasan lemon segar, daun mint, soda dingin.", price:20000, img:"Lemon Mint Soda.png"},
    {id:15, cat:"minuman", name:"Smoothie Mangga", desc:"Mangga segar, yogurt, es batu.", price:24000, img:"Smoothie Mangga.png"},
    // ---- DESSERT ----
    {id:16, cat:"dessert", name:"Banana Bread Slice", desc:"Dipanggang setiap pagi, disajikan hangat.", price:18000, img:"Banana Bread Slice.jpeg"},
    {id:17, cat:"dessert", name:"Choco Lava Mash Cup", desc:"Cokelat leleh di atas base kentang tumbuk manis.", price:26000, tag:"Baru", img:"Choco Lava Mash Cup.jpg"},
    {id:18, cat:"dessert", name:"Puding Kopi", desc:"Puding lembut rasa kopi, saus karamel.", price:20000, img:"Puding Kopi.jpeg"}
  ];

  // suhu ditentukan otomatis dari kategori kopi, dipakai untuk badge di kartu menu
  MENU.forEach(m=>{
    if(m.cat==="kopi-panas") m.suhu="panas";
    if(m.cat==="kopi-dingin") m.suhu="dingin";
  });

  // Placeholder otomatis (dipakai kalau file foto di folder /menu belum ada / gagal load)
  const PLACEHOLDER_BASE = "https://placehold.co/160x160/2e2720/d9a441?text=";

  const CATS = [
    {id:"semua", label:"Semua"},
    {id:"kopi-panas", label:"Kopi Panas"},
    {id:"kopi-dingin", label:"Kopi Dingin"},
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

  function suhuTag(m){
    if(!m.suhu) return "";
    const label = m.suhu === "panas" ? "🔥 Panas" : "❄️ Dingin";
    return `<span class="tag suhu-${m.suhu}">${label}</span>`;
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
      const fallback = PLACEHOLDER_BASE + encodeURIComponent(m.name);
      return `
        <div class="menu-row">
          <div class="menu-main">
            <div class="menu-thumb">
              <img src="${m.img}" alt="${m.name}" loading="lazy"
                   onerror="this.onerror=null; this.src='${fallback}';">
            </div>
            <div class="menu-info">
              <h3>${m.name} ${m.tag ? `<span class="tag ${m.tag==='Baru'?'new':''}">${m.tag}</span>` : ""} ${suhuTag(m)}</h3>
              <p>${m.desc}</p>
            </div>
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

  // ---------- PAYMENT METHOD PICKER ----------
  const payOpts = document.querySelectorAll("#payOptions .pay-opt");
  const qrisInline = document.getElementById("qrisInline");
  const qrisImg = document.getElementById("qrisImg");
  const checkoutSubmitBtn = document.getElementById("checkoutSubmitBtn");

  // ID pesanan dibuat begitu modal checkout dibuka, supaya QR yang tampil
  // dan pesanan yang difinalisasi nanti pakai nomor yang sama persis.
  let draftOrderId = null;
  function newOrderId(){ return "MASH-" + Math.floor(1000 + Math.random()*9000); }

  function getPayMethod(){
    const checked = document.querySelector('input[name="payMethod"]:checked');
    return checked ? checked.value : "cash";
  }

  // QR demo (bukan QRIS asli) yang dipakai kalau QRIS_STATIC_IMAGE kosong
  // atau gambar QRIS asli gagal dimuat.
  function fallbackQrisUrl(){
    const qrisPayload = `${QRIS_MERCHANT_ID}|${draftOrderId}|${total()}`;
    return "https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=" + encodeURIComponent(qrisPayload);
  }

  // Menampilkan / menyembunyikan kode QRIS secara langsung (real-time) begitu dipilih
  function updatePaymentView(){
    const method = getPayMethod();
    if(method === "qris"){
      qrisInline.hidden = false;
      document.getElementById("qrisOrderIdOut").textContent = draftOrderId;
      document.getElementById("qrisTotalOut").textContent = rupiah(total());
      if(QRIS_STATIC_IMAGE){
        // Pakai gambar QRIS asli yang sudah disiapkan (lihat QRIS_STATIC_IMAGE di atas)
        qrisImg.onerror = () => { qrisImg.onerror = null; qrisImg.src = fallbackQrisUrl(); };
        qrisImg.src = QRIS_STATIC_IMAGE;
      } else {
        // Belum ada gambar QRIS asli -> tampilkan kode QR demo yang digenerate otomatis
        qrisImg.onerror = null;
        qrisImg.src = fallbackQrisUrl();
      }
      checkoutSubmitBtn.textContent = "Saya Sudah Bayar & Kirim Pesanan";
    } else {
      qrisInline.hidden = true;
      checkoutSubmitBtn.textContent = "Konfirmasi Pesanan";
    }
  }

  payOpts.forEach(opt=>{
    opt.addEventListener("click", ()=>{
      payOpts.forEach(o=>o.classList.remove("active"));
      opt.classList.add("active");
      opt.querySelector("input").checked = true;
      updatePaymentView();
    });
  });

  // ---------- CHECKOUT / SUCCESS MODALS ----------
  const checkoutModal = document.getElementById("checkoutModal");
  const successModal = document.getElementById("successModal");
  function openModal(m){ m.classList.add("open"); overlay.classList.add("open"); }
  function closeModal(m){
    m.classList.remove("open");
    if(!checkoutModal.classList.contains("open") && !successModal.classList.contains("open") && !drawer.classList.contains("open")){
      overlay.classList.remove("open");
    }
  }

  checkoutOpenBtn.addEventListener("click", ()=>{
    closeDrawer();
    draftOrderId = newOrderId();
    updatePaymentView(); // langsung tampilkan QRIS kalau metode itu masih terpilih dari sebelumnya
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
    const payMethod = getPayMethod();
    if(!name || !phone){ return; }

    const orderId = draftOrderId || newOrderId();
    const lines = cartLines();
    const order = { orderId, lines, name, phone, type, tableNo, note, payMethod,
                     subtotal: subtotal(), tax: tax(), total: total() };

    closeModal(checkoutModal);
    const payStatusLabel = payMethod === "qris" ? "✓ Dibayar via QRIS" : "Belum dibayar (bayar tunai di kasir)";
    finalizeOrder(order, payStatusLabel);
  });

  // ---- FINALISASI PESANAN ----
  function finalizeOrder(order, payStatusLabel){
    const { orderId, lines, name, phone, type, tableNo, note, payMethod, subtotal:sub, tax:tx, total:tot } = order;

    document.getElementById("orderIdOut").textContent = orderId;
    document.getElementById("payStatusOut").textContent = payStatusLabel;
    document.getElementById("receiptOut").innerHTML =
      lines.map(l=>`<div class="receipt-row"><span>${l.qty}× ${l.name}</span><span>${rupiah(l.lineTotal)}</span></div>`).join("") +
      `<div class="receipt-row"><span>Pajak & layanan</span><span>${rupiah(tx)}</span></div>` +
      `<div class="receipt-row" style="font-weight:700;border-top:1px solid var(--border);margin-top:6px;padding-top:8px;"><span>Total</span><span>${rupiah(tot)}</span></div>`;

    const payLabel = payMethod === "qris" ? "QRIS (sudah dibayar)" : "Tunai / Bayar di Kasir";
    let waText = `Halo MASH, saya *${name}* mau pesan (${orderId}):%0A`;
    lines.forEach(l=>{ waText += `- ${l.qty}x ${l.name} (${rupiah(l.lineTotal)})%0A`; });
    waText += `Subtotal: ${rupiah(sub)}%0APajak & layanan: ${rupiah(tx)}%0ATotal: ${rupiah(tot)}%0ATipe: ${type}${tableNo ? " - Meja "+tableNo : ""}%0APembayaran: ${payLabel}%0A`;
    if(note) waText += `Catatan: ${note}%0A`;
    waText += `No. WA: ${phone}`;
    const waLink = `https://wa.me/${CAFE_WA}?text=${waText}`;
    document.getElementById("waBtn").href = waLink;

    openModal(successModal);
    // Langsung buka WhatsApp begitu pesanan selesai (tab baru).
    // Pelanggan tinggal tekan tombol Send di WhatsApp untuk benar-benar mengirim ke kasir.
    window.open(waLink, "_blank");

    cart = {};
    draftOrderId = null;
    renderMenu();
    renderCart();
    document.getElementById("checkoutForm").reset();
    payOpts.forEach(o=>o.classList.remove("active"));
    payOpts[0].classList.add("active");
    qrisInline.hidden = true;
    checkoutSubmitBtn.textContent = "Konfirmasi Pesanan";
  }

  document.getElementById("successCloseBtn").addEventListener("click", ()=>{
    closeModal(successModal);
  });

  // init
  renderTabs();
  renderMenu();
  renderCart();
})();