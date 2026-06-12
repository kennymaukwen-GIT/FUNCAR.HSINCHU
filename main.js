// ============================================
// FUN CAR 貿鑫國際車業 - Main JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Slide-out menu panel
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.getElementById('menuPanel');
  const backdrop = document.getElementById('menuBackdrop');
  const closeBtn = document.querySelector('.menu-close');
  const openMenu = () => {
    panel && panel.classList.add('open');
    backdrop && backdrop.classList.add('open');
    panel && panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    panel && panel.classList.remove('open');
    backdrop && backdrop.classList.remove('open');
    panel && panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  toggle && toggle.addEventListener('click', openMenu);
  closeBtn && closeBtn.addEventListener('click', closeMenu);
  backdrop && backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // Hero video: aggressive autoplay (muted) - retry on every loading milestone
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.addEventListener('error', () => heroVideo.remove());
    // Force every possible muted/autoplay property
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.autoplay = true;
    heroVideo.loop = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('autoplay', '');
    heroVideo.setAttribute('loop', '');
    const attemptPlay = () => {
      const p = heroVideo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    // Try at every loading milestone
    attemptPlay();
    heroVideo.addEventListener('loadedmetadata', attemptPlay);
    heroVideo.addEventListener('loadeddata', attemptPlay);
    heroVideo.addEventListener('canplay', attemptPlay);
    heroVideo.addEventListener('canplaythrough', attemptPlay);
    // Force reload to trigger events
    heroVideo.load();
    // Last-resort fallback: first user gesture unlocks playback
    const unlock = () => {
      attemptPlay();
      ['pointerdown', 'touchstart', 'keydown'].forEach(evt =>
        document.removeEventListener(evt, unlock, true)
      );
    };
    ['pointerdown', 'touchstart', 'keydown'].forEach(evt =>
      document.addEventListener(evt, unlock, { capture: true, once: true })
    );
  }

  // Header scroll state
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    });
  }

  // Render car grids (if the page has one of these containers)
  renderCarGrid('[data-car-grid="in-stock"]', 'in-stock');
  renderCarGrid('[data-car-grid="sold"]', 'sold');
  renderCarGrid('[data-car-grid="coming"]', 'coming');
  renderCarGrid('[data-car-grid="featured"]', 'in-stock', 3);

  // Coming-soon feature items (homepage 即將到港)
  renderComingFeatures('[data-coming-features]');

  // Render car detail (if on detail page)
  renderCarDetail();

  // Filters
  initFilters();

  // Apply ?brand= from the homepage finder
  applyInventoryQueryFilter();

  // Homepage "find your dream model" selector
  initFinder();

  // Latest cars horizontal carousel arrows
  initLatestCarousel();

  // Slideshow (only after detail content is rendered)
  initSlideshows();
});

// Brand code -> display label
const BRAND_LABELS = { bmw: 'BMW', porsche: 'PORSCHE', benz: 'MERCEDES-BENZ', mini: 'MINI', other: 'OTHERS' };
// Fixed brand list / display order
const BRAND_ORDER = ['bmw', 'porsche', 'benz', 'mini', 'other'];

// ============================================
// Render car card grid
// ============================================
function renderCarGrid(selector, status, limit) {
  const container = document.querySelector(selector);
  if (!container || typeof CARS === 'undefined') return;

  let cars = carsByStatus(status);
  if (limit) cars = cars.slice(0, limit);

  const statusLabels = { 'in-stock': '在店車款', 'sold': '已售出', 'coming': '即將到港' };
  const statusClass = { 'in-stock': '', 'sold': 'sold', 'coming': 'coming' };

  container.innerHTML = cars.map(car => {
    const firstPhoto = photoUrl(car, 0);
    const linkable = true;
    const href = `car-detail.html?id=${car.id}`;
    const tag = 'a';
    const priceLabel = car.status === 'sold' ? 'STATUS' : (car.status === 'coming' ? 'ETA' : 'PRICE');
    const priceVal = car.status === 'sold'
      ? `<span class="car-card-price-value" style="font-size:16px; color:var(--text-muted);">已售出</span>`
      : `<span class="car-card-price-value" style="font-size:${car.status === 'coming' ? '16px' : '22px'};">${car.status === 'in-stock' && car.price !== '電洽' ? car.price : (car.status === 'coming' ? '接受預訂' : '$ ' + car.price)}</span>`;

    return `
      <${tag} ${linkable ? `href="${href}"` : ''} class="car-card" data-brand="${car.brand}">
        <div class="car-card-media">
          <img class="car-card-img" src="${firstPhoto}" alt="${car.title}">
          <div class="car-card-status ${statusClass[car.status]}">${statusLabels[car.status]}</div>
          <div class="car-card-badge">📷 ${car.photos.length}</div>
        </div>
        <div class="car-card-body">
          <div class="car-card-title">${car.title}</div>
          <div class="car-card-subtitle">${car.subtitle}</div>
          <div class="car-card-specs">
            <div class="car-card-spec">⚙️ ${car.specs.transmission}</div>
            <div class="car-card-spec">🏁 ${car.specs.mileage}</div>
            <div class="car-card-spec">⛽ ${car.specs.fuel}</div>
            <div class="car-card-spec">📍 ${car.specs.location}</div>
          </div>
          <div class="car-card-price">
            <span class="car-card-price-label">${priceLabel}</span>
            ${priceVal}
          </div>
        </div>
      </${tag}>
    `;
  }).join('');

  // Update count (if a count element exists)
  const count = document.querySelector('.filter-count');
  if (count) count.textContent = `共 ${cars.length} 輛`;
}

// ============================================
// Render car detail page from URL ?id=
// ============================================
function renderCarDetail() {
  const wrap = document.querySelector('[data-car-detail]');
  if (!wrap || typeof CARS === 'undefined') return;

  const id = new URLSearchParams(location.search).get('id');
  const car = id ? findCar(id) : CARS[0];

  if (!car) {
    wrap.innerHTML = '<div style="padding:80px 0;text-align:center;color:var(--text-secondary)">找不到該車輛。<br><br><a href="inventory.html" class="btn btn-outline">返回在店車款</a></div>';
    return;
  }

  // Update page title
  document.title = `${car.title} ${car.subtitle} | FUN CAR 貿鑫國際車業`;

  const statusTextMap = { 'in-stock': '在店車款', 'sold': '已售出', 'coming': '即將到港' };
  const backLinkMap = { 'in-stock': 'inventory.html', 'sold': 'sold.html', 'coming': 'incoming.html' };
  const backLabelMap = { 'in-stock': '在店車款', 'sold': '已售車款', 'coming': '即將到港' };
  const priceLabelMap = { 'in-stock': 'PRICE', 'sold': 'STATUS', 'coming': 'ETA' };
  const priceShowMap = {
    'in-stock': car.price === '電洽' ? '$ 電洽' : car.price,
    'sold': '已售出',
    'coming': '接受預訂',
  };

  const slidesHtml = car.photos.map((_, i) =>
    `<div class="slide${i === 0 ? ' active' : ''}"><img src="${photoUrl(car, i)}" alt="${car.title} 照片 ${i+1}"></div>`
  ).join('');

  const dotsHtml = car.photos.map((_, i) =>
    `<span class="dot${i === 0 ? ' active' : ''}"></span>`
  ).join('');

  const thumbsHtml = car.photos.map((_, i) =>
    `<div class="thumbnail${i === 0 ? ' active' : ''}"><img src="${photoUrl(car, i)}" alt=""></div>`
  ).join('');

  wrap.innerHTML = `
    <div class="detail-breadcrumb">
      <a href="index.html">首頁</a> / <a href="${backLinkMap[car.status]}">${backLabelMap[car.status]}</a> / ${car.title}
    </div>
    <h1 class="detail-title">${car.title} ${car.subtitle}</h1>
    <div class="detail-subtitle">${car.specs.year} · ${car.specs.transmission} · ${car.specs.mileage} · ${car.specs.fuel} · ${car.specs.location}</div>

    <div class="detail-layout">
      <div>
        <div class="slideshow">
          <div class="slideshow-slides">${slidesHtml}</div>
          <button class="slideshow-nav prev" aria-label="上一張">‹</button>
          <button class="slideshow-nav next" aria-label="下一張">›</button>
          <div class="slideshow-dots">${dotsHtml}</div>
        </div>
        <div class="thumbnails">${thumbsHtml}</div>
      </div>

      <aside class="detail-sidebar">
        <div class="detail-price-row">
          <span class="detail-price-label">${priceLabelMap[car.status]}</span>
          <span class="detail-price-value">${priceShowMap[car.status]}</span>
        </div>

        <div class="detail-meta-grid">
          <div class="detail-meta-item">
            <div class="detail-meta-value">${car.specs.year}</div>
            <div class="detail-meta-label">YEAR</div>
          </div>
          <div class="detail-meta-item">
            <div class="detail-meta-value">${car.specs.mileage}</div>
            <div class="detail-meta-label">KILOMETER</div>
          </div>
          <div class="detail-meta-item">
            <div class="detail-meta-value">${statusTextMap[car.status]}</div>
            <div class="detail-meta-label">STATUS</div>
          </div>
          <div class="detail-meta-item">
            <div class="detail-meta-value">${car.specs.location}</div>
            <div class="detail-meta-label">LOCATION</div>
          </div>
        </div>

        <div class="detail-actions">
          <a href="tel:0922782597" class="detail-action">撥打電話</a>
          <a href="https://line.me/" target="_blank" class="detail-action">LINE 詢問</a>
          <a href="contact.html" class="detail-action">預約賞車</a>
        </div>
      </aside>
    </div>

    <div class="detail-specs">
      <div class="section-eyebrow" style="margin-bottom: 12px;">SPECIFICATIONS</div>
      <h2 style="font-weight: 200; font-size: 36px;">車輛<strong style="font-weight:600;">規格</strong></h2>
      <div class="spec-list">
        <div class="spec-row"><span class="spec-key">車輛年份</span><span class="spec-val">${car.specs.year}</span></div>
        <div class="spec-row"><span class="spec-key">車輛型號</span><span class="spec-val">${car.title} ${car.subtitle}</span></div>
        <div class="spec-row"><span class="spec-key">變速系統</span><span class="spec-val">${car.specs.transmission}</span></div>
        <div class="spec-row"><span class="spec-key">燃料</span><span class="spec-val">${car.specs.fuel}</span></div>
        <div class="spec-row"><span class="spec-key">里程數</span><span class="spec-val">${car.specs.mileage}</span></div>
        <div class="spec-row"><span class="spec-key">外觀顏色</span><span class="spec-val">${car.specs.exteriorColor}</span></div>
        <div class="spec-row"><span class="spec-key">內裝顏色</span><span class="spec-val">${car.specs.interiorColor}</span></div>
        <div class="spec-row"><span class="spec-key">車源地</span><span class="spec-val">${car.specs.origin}</span></div>
        <div class="spec-row"><span class="spec-key">展示地點</span><span class="spec-val">${car.specs.location}</span></div>
        <div class="spec-row"><span class="spec-key">狀態</span><span class="spec-val">${statusTextMap[car.status]}</span></div>
      </div>
    </div>
  `;
}

// ============================================
// Slideshow - auto-advance every 3s on car photo gallery
// ============================================
function initSlideshows() {
  const slideshows = document.querySelectorAll('.slideshow');
  slideshows.forEach((show) => {
    const slides = show.querySelectorAll('.slide');
    const dots = show.querySelectorAll('.dot');
    const thumbs = document.querySelectorAll('.thumbnail');
    const prevBtn = show.querySelector('.slideshow-nav.prev');
    const nextBtn = show.querySelector('.slideshow-nav.next');

    if (!slides.length) return;

    let current = 0;
    let timer = null;

    const goTo = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
      thumbs.forEach((t, idx) => t.classList.toggle('active', idx === current));
      // Scroll active thumbnail into view
      const activeThumb = thumbs[current];
      if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    const start = () => { stop(); timer = setInterval(next, 3000); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

    dots.forEach((d, idx) => d.addEventListener('click', () => { goTo(idx); start(); }));
    thumbs.forEach((t, idx) => t.addEventListener('click', () => { goTo(idx); start(); }));
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); start(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); start(); });

    show.addEventListener('mouseenter', stop);
    show.addEventListener('mouseleave', start);

    start();
  });
}

// ============================================
// Inventory filter tabs
// ============================================
function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = tab.dataset.filter;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      const cards = document.querySelectorAll('.car-card');
      cards.forEach((card) => {
        if (target === 'all' || card.dataset.brand === target) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
      const visible = document.querySelectorAll('.car-card:not([style*="display: none"])').length;
      const count = document.querySelector('.filter-count');
      if (count) count.textContent = `共 ${visible} 輛`;
    });
  });
}

// ============================================
// Contact form handling
// ============================================
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.classList && form.classList.contains('contact-form')) {
    e.preventDefault();
    alert('感謝您的訊息！我們將盡快與您聯繫。\n\n如需立即服務，請撥打：0922-782-597');
    form.reset();
  }
});

// Make car card images fill their container nicely
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.car-card-img').forEach(el => {
    if (el.tagName === 'IMG') {
      el.style.objectFit = 'cover';
      el.style.width = '100%';
      el.style.height = '100%';
    }
  });
});

// ============================================
// Coming-soon feature items (即將到港)
// ============================================
function renderComingFeatures(selector) {
  const container = document.querySelector(selector);
  if (!container || typeof CARS === 'undefined') return;

  const cars = carsByStatus('coming');
  if (!cars.length) {
    container.innerHTML = '<p style="color:var(--text-secondary)">目前沒有即將到港的車款，歡迎聯絡我們客製代尋。</p>';
    return;
  }

  container.innerHTML = cars.map(car => `
    <a href="car-detail.html?id=${car.id}" class="coming-feature">
      <div class="coming-feature-media">
        <img src="${photoUrl(car, 0)}" alt="${car.title}">
      </div>
      <div class="coming-feature-body">
        <div class="coming-feature-meta">即將到港 · ${car.specs.year !== '—' ? car.specs.year : '接受預訂'}</div>
        <div class="coming-feature-title">${car.title}</div>
        <div class="coming-feature-sub">${car.subtitle || ''}</div>
        <span class="discover-link">了解更多 →</span>
      </div>
    </a>
  `).join('');
}

// ============================================
// Custom dropdown controller (replaces native select)
// ============================================
function initCustomSelect(el, onChange) {
  const trigger = el.querySelector('.cselect-trigger');
  const valueEl = el.querySelector('.cselect-value');
  const menu = el.querySelector('.cselect-menu');
  el._value = '';

  el.setOptions = (opts) => {
    menu.innerHTML = '';
    opts.forEach((o, i) => {
      const li = document.createElement('li');
      li.textContent = o.label;
      li.dataset.value = o.value;
      if (i === 0) li.classList.add('selected');
      li.addEventListener('click', () => {
        el._value = o.value;
        valueEl.textContent = o.label;
        menu.querySelectorAll('li').forEach(x => x.classList.toggle('selected', x === li));
        el.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        if (onChange) onChange(o.value);
      });
      menu.appendChild(li);
    });
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.cselect.open').forEach(x => { if (x !== el) x.classList.remove('open'); });
    const willOpen = !el.classList.contains('open');
    el.classList.toggle('open', willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
  });

  return el;
}
document.addEventListener('click', () => {
  document.querySelectorAll('.cselect.open').forEach(x => x.classList.remove('open'));
});

// ============================================
// Find your dream model — brand/model selector
// ============================================
function initFinder() {
  const brandEl = document.querySelector('[data-cselect="brand"]');
  const modelEl = document.querySelector('[data-cselect="model"]');
  const searchBtn = document.getElementById('finderSearch');
  if (!brandEl || !modelEl || typeof CARS === 'undefined') return;

  // Cars available to browse (in-stock + coming)
  const pool = CARS.filter(c => c.status === 'in-stock' || c.status === 'coming');

  initCustomSelect(brandEl, (val) => fillModels(val));
  initCustomSelect(modelEl);

  brandEl.setOptions([
    { value: '', label: '所有品牌' },
    ...BRAND_ORDER.map(b => ({ value: b, label: BRAND_LABELS[b] || b })),
  ]);

  function fillModels(brand) {
    const opts = [{ value: '', label: '所有型號' }];
    pool
      .filter(c => !brand || c.brand === brand)
      .forEach(c => opts.push({ value: c.id, label: `${c.title}${c.subtitle ? ' ' + c.subtitle : ''}` }));
    modelEl.setOptions(opts);
    modelEl._value = '';
    modelEl.querySelector('.cselect-value').textContent = '所有型號';
  }
  fillModels('');

  const go = () => {
    if (modelEl._value) {
      location.href = `car-detail.html?id=${encodeURIComponent(modelEl._value)}`;
    } else if (brandEl._value) {
      location.href = `inventory.html?brand=${encodeURIComponent(brandEl._value)}`;
    } else {
      location.href = 'inventory.html';
    }
  };
  searchBtn && searchBtn.addEventListener('click', go);
}

// ============================================
// Latest cars carousel arrows
// ============================================
function initLatestCarousel() {
  document.querySelectorAll('.carousel-track').forEach((track) => {
    const section = track.closest('section') || document;
    const prev = section.querySelector('[data-carousel-prev]');
    const next = section.querySelector('[data-carousel-next]');
    const step = () => {
      const card = track.querySelector('.car-card');
      return card ? card.getBoundingClientRect().width + 28 : 388;
    };
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  });
}

// ============================================
// Inventory: apply ?brand= filter from finder
// ============================================
function applyInventoryQueryFilter() {
  const brand = new URLSearchParams(location.search).get('brand');
  if (!brand) return;
  const tab = document.querySelector(`.filter-tab[data-filter="${brand}"]`);
  if (tab) tab.click();
}
