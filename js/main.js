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

  // Header scroll state: solid background on scroll, hide on scroll-down / show on scroll-up
  const header = document.querySelector('.header');
  if (header) {
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');

      // Hide when scrolling down past the header, reveal when scrolling up
      if (y > lastScrollY && y > 120) {
        header.classList.add('header-hidden');
      } else if (y < lastScrollY) {
        header.classList.remove('header-hidden');
      }
      lastScrollY = y;
    }, { passive: true });
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

  // Homepage brand showcase
  renderLatestShowcase('[data-showcase="in-stock"]');
  initShowcase();

  // Finder section: black by default, fades to white when scrolled into view
  initFinderReveal();

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
// Homepage latest-cars showcase (big image cards, Porsche style)
// ============================================
// Brands shown in the homepage showcase.
// To use real logos: drop a file in images/brands/ and set `logo` to its path
// (white / transparent PNG or SVG works best on the black cards).
// `white: true` recolors a dark logo to white so it shows on the black card.
const SHOWCASE_BRANDS = [
  { label: 'MINI',          brand: 'mini',    logo: 'data:image/png;base64,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',        white: true },
  { label: 'PORSCHE',       brand: 'porsche', logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAAVCAMAAADLoSOWAAABWGlDQ1BJQ0MgUHJvZmlsZQAAeJx9kLFLw1AQxr9WpaB1EB0cHDKJQ5SSCro4tBVEcQhVweqUvqapkMZHkiIFN/+Bgv+BCs5uFoc6OjgIopPo5uSk4KLleS+JpCJ6j+N+fO+74zggOW5wbvcDqDu+W1zKK5ulLSX1jAS9IAzm8Zyur0r+rj/j/T703k7LWb///43Biukxqp+UGcZdH0ioxPqezyXvE4+5tBRxS7IV8onkcsjngWe9WCC+JlZYzagQvxCr5R7d6uG63WDRDnL7tOlsrMk5lBNYxA48cNgw0IQCHdk//LOBv4BdcjfhUp+FGnzqyZEiJ5jEy3DAMAOVWEOGUpN3ju53F91PjbWDJ2ChI4S4iLWVDnA2Rydrx9rUPDAyBFy1ueEagdRHmaxWgddTYLgEjN5Qz7ZXzWrh9uk8MPAoxNskkDoEui0hPo6E6B5T8wNw6XwBA6diE8HYWhMAAABgUExURf///wAAAP///////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACTZXvoAAAAgdFJOU/0ABFCqNG7OkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbmcw7AAAAj9JREFUeNrVmdGWwyAIRCMo8v9fvDGmxtgNjNnm9Ow89YGiXimOdomLr5gChVUUkhuuVGIpKJA3yytvYH8eugUjc1jWvPsMuI7wrnWaWyi1T8iEoahUCSQkIVGZQITybrTWL0BbVufAQKgWWLENYMFKn4eVCwBKUGxZFAqrzhUqwz0vgXswAyt9FlapVgoCA4BhcYmd2QT5OqzIJ0kvPRZVwSqP+i02enklt1ipDWwTXyodFRvZFt2BxZ7Ssk/ZkLa9yrUfGIpnWGZemYg9lhjrCtFIoWudYWU/Z4VlpSTZfwM7LLZi+QzAz3tUbCJPHSw/tG0BXeIcYLnj0w7LSFlTdbCsWB6rBYpVt2Krv+gqi/5eWemJyuL7sMDKqk07x7O0qbQyCnQH1pIvtQw9axz/XUDPknPPmqssqGdB9o0D3YGFeJe50zCLoeE0nIEVjbTt5ER9VncafhUW4LPoDiyQAJGixvg/wJJtVz8Pi9ulU0qPumoWeTC7OKzrRqRxgOW2LMVgae0Xn4YV6ZXLWTsNZnfiNPSSzp+Gdu3FbZYB8VkyBSsnqot2HU48X2JwnzVhSlGfpe7IocGSCQd/PVXO7YUCUR4rC3bw8HUH91n2uPv2v+6Gl/e3t7uhYR2od8PJFuvQs9T5wr27YfIEmFKaPF+6RRl5a3vbah99T8JfPh59deBASGHzMvmeZV6jcgOLwdLqMv4JLPCtuHspNWFp+8nSguYFd+wpWBGGVbZV8tQbvG8zBIWlhP8P8BSsH7aZHs4ZEyTrAAAAAElFTkSuQmCC',     white: false, wide: true },
  { label: 'MERCEDES-BENZ', brand: 'benz',    logo: 'data:image/png;base64,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',        white: false },
  { label: 'BMW',           brand: 'bmw',     logo: 'data:image/png;base64,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',         white: true },
  { label: 'BENTLEY',       brand: null,      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABeCAMAAACuPtk5AAAAYFBMVEUcHBwTExOdnZ3V1dULCwtcXFxFRUUAAAACAgILCwsWFhYZGRkSEhIlJSU2NjYpKSn///9XV1cSEhILCwtHR0cbGxs6Ojp7e3skJCRoaGhFRUUnJyeoqKiXl5cREREnJyfkFFTGAAAAIHRSTlNUKQsIkSZHAPvRj3KwTi41AxDOsxhSDQpoECgKCgvuk6+3ecoAABKvSURBVHja7V0Jd5u8EsVbQDtiB2Pn///LNyMJkEDYTr42TdNHz0kaGwtpNMudq5GcpN/mqgSjvMju8A8u/FVwykT1fXqYfItetIKBmIxwmDhImaZSHmoGwiPZveBMtN9HWI1OU/3HuqBYAUpEazW9kB/gyue3a1rc7wVTf24qQTrN79As02iqtV7+eCwpWoCgFIqmV2iGJHNmeM8IappCpcrdbS8+X7/+/A9rlkqSgxoOWjen2C15fjodx9ut7Xu4pWmu5moa3d6Op1P+0mPy0ziOp3x1c8tABKwy2oVmSNAMayVRs6SqaxQeei6jVY25ud30bTyOr3YCB9KaMTRX/KF137e324jDiDdx0vpyGNQhSaQRliyz+boTUpR4FXgRd93v92zvgvnHz/AzPbOO1QLlriRe6gB/MVpygtriLkLKEpy2rKBvkmYZKktVc3BXoEN9rLuob2CGvK5QDeET0Ou8khgMSuI1XBAOLSeiPsDjB/P8A/yVdCx5P+OtOJDdUdzv02DNyEsrBK/9LCtlmjTZ5y/y6n2uD/7gOM24gHEzkBStq5WPcD+mS6M8OQMJC56h119anqb1F3c5dlUJxxZA+zvGWJIk7++UnuHivCy56YXVsNiH+dvllObXQYEdw8fpmeKHOD+fYYq7RIgD2HZb+Rqen3qjFaY9LiW9Z/RFzw1qdadS8sx2GLSz980vz6tWwwOFgEdDX2AE2BvoFIwtSZQarnl6urzxndkkbrBmCCgBSt/fQSDwaRwbdpgneO/xsaXDCJu2GpQwsTyQG4Gw/qk42soOGyrq/PXP5HWBj+zkp4CEBngS9t24SKGGqm1A7vnDnhzxE0ZY+UcemvdSCRbYAmeyj3dwvxlGx4Fn/GMDhg8MI2UPJBJ9tZcs6C7opZL9x0ZthIWN0E8F0qMxqNL1glAh803H230YWmR12n3s0TTr0jojUYiaT44ulFcuBSWekGQ1fmqwFBtIlPUenwcfuYb+lJ8wSpYx6MMHjFiDaPFDHze8EmZS558fo/WUCqCDaY+K21aj9/XCvgOQa1YzyT01p+BTxRuApcsF0oPbsYnimDpT8gNjB0FJBeoYw0/N8aav6eUCEO0NPDyjnpvgclYmgId+/3fQ+tqCBDXDkghKW+oapZ0Y+k/LfzAyrxPsaDTglKB3oQYX9JSdX3/COTvRIpxx0J0yGqpxwpLajOzyaZvppeimwdDWpTuShzGCdjXAOdCLtOrHMdVjno+QQNxGQPG6OaTN5TIg6FNviYBfAsEfQ0sU03OEi8fzNTfPPEgF6P1jmlUx4mU2jPih339U0I8SpAZdhO6K5A17LYfLpUkPjQb4Pt4gOTLjS8exr1LQTbi7NqrpTYL1U8nS6AOI7npxfwbblGfjPLC8/KgnV8uWkdxo9oH8WGX0tsiBTWFFH4MH5dzzwepZj18bXhJQNNfPIXiT6VBKAQcmHeo8q5PaeVXSRvJYTHFcBGzrez1k5Rp+ASyBxhDlQnhfuZYyG8TdITPTUCQuNb19emm6gjd1kPMk0ElefgDph9c1EFZlg0ZpYK+5bB7hZYgIcU0O+M7ASqW6XNtb6OBG00iB6eUZO5XEorSYrKTKap2Rah80buNrRTJdZ1XQzOoaETiSMyZ2hWkhjFv5rb1elBR1x95hKLwkwQDdiJ0IjDBsohOSf+VTJP/0GjvMNifiolgrjSctPv2PO9UBCubBlBOqXKstnyTE47IyIynmCA2j6sb/NCiD3MsVU2qcFn8xFCJFE75ycw7J9yhkaK/x0Rhh5XSCAQ8lNctrghs0t8KKzsW1RSTEgjgDbu32rP+7AdGEPrGmlWkcnLatRR7NDt0DtJOf+hBsoFIuToGRNTEwjE5rIJm0KOZFN0KE0REJk2AaeY8xfxY0Au+l0HIk8VMcIMr0aY8x1G6oMTBKtxy8RVuWtHyMPirwwoD7eBBcSUkNjsfE3eQVFwBeO5mDMGPGrh07EgkbIZuzvNGhn2iNlMVOopRl8mLILqRMDHafEzIHjKBzHcSO6imizJUTSWzBoluSPA0opKqq5prqy4Asap1YWMz5ehTEplztYswTOQVhm9fiGDHDI8oK3wi0Cp25HObJHzH1XLl8ggZxQ2kdI2bYCqS9nL1W9WJArRFfpOfcJhtJjWzocNHp1Qz7kGo1p5QsvrpT0Q+ABnwMTFCYcbGl8cbKnm5yvx6mCoLvEGJh3snoTOeSBWNERzFgeKLZhujQtv9dtenMnMUiX7IV24Mr6H+4YFGxR83gAgKYPkx/f4oSIXTWWtW9dwcFjXXw+toKNbhN5lCllYDoH5mDCNIn80me67Ud9sY2iDrAo9XsV6iKZeqnfpBbmL4dMKserht2W1VFFUIjb3eNPK8m8tME2jMt3s2iDFrCuexWMJyBtZK0miXAn68wBebKq5SAfbEsjEZdeUYfgFan3gt6LpdICiu1+30/or4ZwW0k1z1ZZLWUfNkJgJ1DmEjMt8C1qD5ghtmxQCpuUsQJE/AgB3JGSHJw0UA3+G7o6dUHygXkA2lzEtI7NrPhHhIq2ZwGYzgUHkMZjCGQ3ACQVXRW0s2zFWnhPfIxWxT4X/DObnUGnmOnXHbQv0sNStB007BG1AlQrGRWk60BIq2JY+s37NuSq7lmJvxUdQ38KSAO0s49fIKSsDoU9BKj1yuUbCxDSCK5PY4BW2zirM84bFjlmSS9TsLS4u2tcRNOZkx9M1iSZ8ViU2MU2sysyKr/01XgfPLl0wUu2xgxNW9vmCBZYV1nunTNK6shjuxNQmv1mL1S62DT+e1KAlKigZRW7qBZNBOgUtdMM2wmSXaJTvsSjfIYEk/5vs8kap14eNcR56EE9UuYdKSJVSrdOZQmUn9ZOnSsVmZdjEDNaxKXVXT53rpTAqsQyEE6/7dZ1vF9wOQAWjlZC7W9BMHTxA4F+DCQFViODAddP4gvgddYvQdYC3pU3tKLnQ7kM5kVztyJibZYHFTv+1gPKCIKQj63dVAl6kqjkUjTuaFIPAUxefG40ZOgFLOWUjLqZhVMivXo1M1MycKuJK24Mx8ByA3h6VtI+JawKy6FshAEn8NcvgZPoG5ZABae2lVHcYBqLbLVeKn+QMnRQHfFlEdWnpBemcBlZRM4dYWp5ganEDDXhRGvVsJ63/Pim1BahsJawAc2byhUeImKRtm0s+qmPsWXUfJdkdHho/VZw8o37UWRQUzxGRIlPados9LknIjcQK74CrovrG3PPc+Rn/cW4msArsQ6PyfueRKnWYJ5rvajOvVNaPhEMdvoeitUddpfVp5VBvQ9d/FwBufo02RhOBWaFUKzGEz2hNVuhUX34uEkTA0elhrGp5CLrbK5K5AvzViL7i9mnyrIhOxt42cq/2xUXPvwaZoXhUJBqXa5qZ3TE4ZupLZexFR1PBFW/lhYsczE1JZYD1mjg5zmo7RLe03oTq2KDfkKZAcPYJ8qk8wn0ua4TW68VTk2oUftWHazxi0NlzQRcd1d2M4w9khYEd0RD7w/tkbsVHQT4Wg4NROTiWPonWfoBeM+MlwnQDcXyGn+yZpStrStJJAXzRC6RL6uqeqNUtn802Uo9IhshnCLpBtsEAprsxhDxkfen6W4SHs17FaVHumSE1hGYJ2g+wKz4Wq42lHNs88+X4Crd0kbLAY5RskyLsYAGKHvpFYzFHJRj4S1EYh6IEgD2lQ2MQzOR0/J72idwYbMbCXj5CVC5uPVyn3NI6E1Qj5Z8/NXpzyqQJroymKmtKKH6Z4R6tjgZOrIB5lFEnNrWGS7YJZ7gSl7kSh6sQD3JutFe8toCJasWD/uZLi3CenoPDHuhT0Tli9if0WgLWLCYsYRJrmeERW+uExkb6EWJCNppOzej1C1PP6yOnjpeq+jXGaxnUEcM2K7aeyFRePlU2HBCoYxExJUBMq45ZQ2KBSLUg10lao4jS9YjInVLm2Xv3TTgDUCotNVxXQ/ob5Qh9WyhJ54es549lxYNoLdtrxRtFLTbzJZSgdUQM3zCTP36xr0isyA8BfusHDd9f1lP6OXlZor0J9S2Q6xpyz3+4vs0gsXszKYn++5CTLHb71ZvslE+ou3o9QeRlHKYztWDjQX5eJtTDTHOlvyUWE1+mHKuM3mBm5xyqxdpcgjAcjlbspDC7GSr/+6dye69kNWodngm3lWjadhMerlY5r1ZCElmzGpXeSdtJuwYQVtYq3Q6rdsdDqu1vH4ymla57AoGrOl9oAaMT6ohhUvCiuHkn8Ztn1kuwswB+Ohr45kZQHlysP6Uy9RnKzk+Dt3hR2ry8C90pKpaOBmiwkXUXldrxy85C8Ja4oZhAeGFA+I3IXqZp6eBXC4pblZHlevYIgPl11+4NduoVOreNu6CSNs9jT5pFaOTHiDrqpXzFD5Mil8N12ReP3cNX2DR/feDM0y1tZ8FwZwRkHq6/YbupwTqg/rxdVTTxEEWSyiKlxU5y8Iq9vns5xOxLhUwCeFtw7tAa1c0MWt11DPSTdkxu8WVh5Jantv0aL0zAHNx+XRWUGeCEs8Yv+272LBWufemXy7Ua7SW6yI0Gg0/9KdrBs0kK5Un3mqIqaRtvSxsGK7rpoHgIu2fussIOIWl5CuI7j88m2/ELKgtiaRsh9srtGMx2bOt/xplhNLLX12OSasWMijD1SrNh5omFzRrMwz1VYdx8ZmXEMvJWzwq+WQ/9k90nSq/A1ohikcyan/KsodvD/hQkm6Tz3ouWEnISrXPOE9+w9O6rdsKN9YVyfnPTNlYCX8Ia0cA2Ik35Umn7RRLIs/WF4mu0fq+cd330+5Kmj+TWzITqthKk7hPdWsfJekX1oEGD6uPgwdmVhdLtLvdVRBD3ttHcyjS+nk8tNyFpEw+v4kCaT7ZohBTTsZ2WLIpSSSukUb6Jb+1uc6MKwqN3QqC5b5bHn8A2HJOBu6Sy0TU4VFPJxhSFC4WPq9D8HwJ3DekCuRGwfBaf2AV3kUDln6lH7QGoExIbNc89NrG0S/3YkhhKaUe7VEnD1YoN+Kg4aVcIEYS4985vAYkv7tx6vUWe5WYNIKNiD2a7DEH1VErmpZ6Goxo4fthdrZp8pf56W+rbBuMAbCd8dMNtWKx5nJ8UH4xkZDMMAJzEr79x/cA9ZxCKsz83K3lm2uCEpqVcWXfGOfa7ID2vvfL6xqq1pjsWtpu1eYVhbhgkaJilX9hCOhQLXUyo0fi2Bx83m2loc7fIrjil9TX6FYXyEsDaq1jlQ3HnLDj3kAvaLg+W0TcetM/4zDxljW6k3FBV1z6TulU4Ay+ZNEj2W6zVj6M4SVw8yLDZErIjvmmXeQR95GdjrFVvkkvEJJ/lOOsUOfQjf7ZCv+6EikvU01fO3HT6BpKlM/58w/msHukfLxlpwXd2huGinJdtPT331AImCHJjKikX1MVmyMzEODkPQnCQsPu1AxJ9yzl7VrDeidc1d4OMbPOnpTmZ1JsZB1Ey/VffDNYTlWViISO/76c0pRBep4gAeXQ54VfsRhFNZCqy9BDV98qCszizss7tDSge0dxwclzkMad0soq+HrZPWVJ+DSu4xumrdZHcuOcMRB5u2ngh1IGS5mGWlUkSIqLIKWd5r+yOOCqVnnI/0aJzGHlhCoAhhNMvn2pu4JwEwjIZqdjDBXsLMnRlXpTz1bGc0GTkhZc6O5US+ZHrQB4onZykkSA/31wSB0PHSPriIGFLzXX2iDX34QtVEEGgzb2VdJXEZ8gOUOfb22BYP/2vybuKXHan3sCP395OifPLVbZaWGqiJviyrnE+llf15TZjSrxK0T1p05qopzry4JWtA8Uz/7iHONW8Fh9XDayyAsiYoeCfeE46u0dCsQCCpgNzpYILN0qJj3fVDc40n0jz8PnmGZLJSssePiidwva3V2MehMnV3Obs39goJJUCso7WXpP3B4PggKbK424mJ2d5+y+mVFU54XkVnxNdbeMG6iqPDT4Wbzn/xNA0Y3YF9dNnnospwWgiYDTBm3EeG2vI/xIbt3Rtws/We+lgGoLNwEUbt6Im290aRfRhC1r1PCZTtGJ2H7Bq/+qe+wgDp1EFdRp+kCOJktHyxMn2p7cIZVIefi8UUQVan+uS/8AHEVsNy36JLDBrmJgOnBEsW8dKUm5tcBjwpR/+S3oyg61YM2nvocbWmzumtP6ZrpTqrSf/WrZAzzMrgz1qX1TxUIS+PJqe4oG+lOGB/Qt/H03/3eHV3C2ahZaRE6teKR1javd2VPm6VWgtzcqf/pLymqKa3TgtulMWk3hxufZXJGs+sHDZAX9s70/9/opOH7SIqsK0pbNurqao2HL4sugzeL6v9ffzVf4gxfbCOBaGdwmBR48SvLOqh1BHoeXk7OIv3/d4VtT0YoCjripow7RMYb/qW/U//+B62+l+0rhqxcAAAAAElFTkSuQmCC',     white: true },
  { label: 'ROLLS-ROYCE',   brand: null,      logo: 'data:image/png;base64,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', white: false },
  { label: 'FERRARI',       brand: null,      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANMAAAEsCAMAAABuanaTAAAAYFBMVEUeHh5dXV0VFRXT09OoqKgPDw9MTEwQEBAAAAAAAAALCwsWFhYTExMmJiYbGxs2Njb///9WVlYqKipISEgNDQ0iIiISEhIaGhpFRUVnZ2d6enqampo6Ojo1NTW5ubmLi4v5UlEhAAAAIHRSTlMgKZAHC1lO4wD+0Y+uTnEuAxI0GbNpyVQmEQsKEkcIDX+Y0W0AABR5SURBVHja3V2HtqS4DqTDfQuO5NTp///ykQw2GDDGpOGcPRO3pwvJclkqyZa90ePj5icRtHd+rI0+NwBOjSVnP7k+Js9xnKj8CSx+gtx/AZNLCiiOb9u0/NFBz38AUw3FoTaqfxK718eU1FBCG9Q/2dX9jGP6ZmlQ/IArMICBK0BdFJOHISqxABileRkcnMAOGSh4TUy50z0AQmwVn47a3yHWn+V77tV8j0ZJzOEK7wg4vQcg4l0Hk0sjSMgAhOSB9BKY3gSqoGn98AqYcOlWcayMC2X2u44r3mkxPQnEbh36JnEh0gRC8LjUnkvhFCb2h+iWUsuyPh+cJH8Jdc/OIzLoLH0A9E6NyaXLMTlOanvnxeQjDUQgOrHveTM2Qv8bBhFA6IljxDdabiFCTx33aM8G9HnA9msWExmwoNlNOLJPzfcwcHSCA4qyk2JyiRaiGhY+JSbanDFg1EBbhhD5p8PE4jcMmihBXDdf5IrgdipMr4Y1APIuU5XdOR0vsVTsnQGTi+Edwjvj2UmBjnAJlff7N2ISuf3AGfieYAbsZgT118dd+uU9PLr3/o7GxL/uOOy/fIRvVGoQXOxiKPnfSKzAh2JKNeN26bUuDrvXIfJD4h6ICelhCm37IdCNOHsJqFB6GCasu8Gmg82ZFHsBELzzGEyZPmuQrKLA/vJ5jOgYTKW7kCpZBA2AAlWYDDApNoe6HnIAJlq/zeIH6DrGQLUfHR6A6YXqAOYvJnaToKzqP7zW+/QwRTX/ecXm1hTIbb54RXfHVBVpaTRrIrQoGQZJlGBaVK8ocj6HYFI5Fo3/vYk/Kk9T6f6+NyByN1n1wsvams3wi09y9M8BMYIoWAm35oT2b+nqgu5xmAAJXOkrR982bY6kvhqJSbO4WZwAIBSurGnrYXqjelXj0YR/2BJ1IM9i3kE/f5TdblneFhFWSCp0eQSGZabxkSCFeFZbay5IwlTME6JDzu5YPVQDqhArYdB99oPAIzD53LeJqB9FZPRrF4eiPo/Htzlb7Y/Jsz/tN25zjkFEkORM/rJ/g0jJ+eIHmi1fr/I9iNAd4l5u5IcJJPiTRKjVRVjTKWZivzlUiJ5V6zbLNviTYbF0Mo5ogcF7Ool+b2ZnBsL2hMoY7lOcQBPqpMPsNJLc8yr7IeKeFNMSVh530oIvDU67nlwwrc/p/fr8elhx/5LwQffT+x16BUxQgTHxv/M9P6bn0kQFPD+muaTmEDI9PabpSI4qBXr5/AHThtoM02u69h63PAKkbcz/nRwT7g57cK7sSVp458YEW4fywrnoQNvSb3r2fo3qyQU1M5f253NJsDXV+8SYcJc9kgbACPePiPWqioPzYgo7fo0UBbLYVPDbCFParQ9vJDIMVhlOQVMbPScm2O048lPUR+KSyQsYqBJuhcnvVvxLTpGkmxYOYhNKsU0wPcCcmcbIxQ8ayLNYW+5NXtvcJSESUjlIVadxTogJc/xtLOj5Nsvv8U0RVRqC0vP5XuB0q2nsXAg+baqsyDyk7S+ic/IItpgqM6mcocijygrWDhs9z4ipZazBxBkK8HEPCX2VhZb0bDkWzJ2G8lEzPQWyTvqVuiQ/E6aUj2HjrCge1BTL5xPzOczTYIo5My2QJLFQd7sVSXiIH2fyvc6jgmViOJPteNZGkKIu/slCXYrk0uU8PxsmyIUyF00lLOlIpf50doI8yQmd5Q85G6YXZ5hYr83BUDbMGKZ0jT4MAZOgTGG6LVFLvaLBSmK9bfQ8mKxFVuL/ck1fSdlXXta3gXsaTKG22+G6xwgzyfppcizBirUEi30JF60e7+bMj/NNMHmFHADT71bC7BsejCrAT653b4MzIYvDQJ2vLNPPA2mzRrOQSCE10zsQFNKSEUwUiZ32tiE5n1rpXXsplF/7IcfkkoH2yVZS/JrVY9sagsLuq1pzhbBZEpYtbdzoKf5gIZRn3k5w8tEo6+ZI6AmzZPELhKEyCaOL+YP4DhDNXMHjweIQUWY60XcsRhCGghf3TyoecS+CQfL3R5ZaDhRtT5313ho9CXA07jUqDdQT4o2/OT6g8Mqn90RpUE5vCwF2QGIA/lss4cMDmmgpqTTk8h9+SkTdYOYGXpY/p+NGOMXJXVcnp9Ob3GWplcolXcEeHyLjwmYE1d2PoLBYYC+n6fCpq6D2xvfcSYFQH1UvzxUv0cSP7MPLo0MNifvfaB8TnZtawTExF63fkCLf+ks+/q14vPrbxanG+DjCj14Lepjm6UC3rkx0chWplh7JXEiLfqCugttdK2pq5zwmF6jv9cQxxB2IXy6G94oECBHM1rNTNVYuvSsk4lLkGHyArgK7DtOZgDETMaEqoM47FTKKSD8L5sZDM1XHZEtQaYDcBc4RD9GuNuSCUaAY95LKTMFeKHpaguXFtC/oJZpwXR/iMVXdqYy/bW+t+EaF2vuHn4/kKx/asIQjWcJy8psTK3U/qKE864yBJ2g7+nyffsd3maXSSElK1aTjPQHiu4ep9IXg1VGvOlgkdI3J0hnhfBVEmZKvSIH4uBz7psQnMOue58I6tCWYGiARl2QgP31QYTdVddRYtByugZZPJkB8bHEhq7YKmCpFGuZD67fphutROYgWxWiiVHnyu+xyuiT75vNELelzWP59WhNHj3gRhwCxaiB3PZoU3bm/Zdk3n4OEBrw8FOUko6TOt81tuWEzzEWjyzNh6XWv/ZpBH5PXG8UxRr7RZP1PyR9DnhW9qmMv+ml2nnLtO3hwfsLSKtBQDECmWxZU4obLn4GLcTta08Ab22TtN0fDMyGUa9fToeutPGWUIx4zsaGrnGGF9Xp20vYVBwNMPM2LevPixaaK3Aizy5OiOw+0tV+MLL1CSub1v7RPGSY62pYtpiShjQ2y1WZfgvrFoTbb2X7pPwdbA1mM+P++2X7GFuLaAy7iu/OaegNeoS3pL5d7uxUxY8Q0LVK99/sfifyWSnXti8BdP6lEzB1XwkqN+bdA/qIqN6oxfZhu4QF7daHA5c2IV7vesLqEtbwPyB26pBfQ4iIE8CSEtRgUAJMP4xB01c70RLLjX4BKda+/pleR8r9NLW5zCuaSYa/3qv02GJuJQ5Z3r4oErammVV4GXKvbnLA7O5Z2ndcFtUNI6nTFZKN0RbNizBvPr2J57XqoxI7uznYPZnkcA0/WP9NwZyir3Zxwub5u4YaY4DAXbEa9gDp6V44UstrlVO5D8d+maZVm4gIy3doXdjQON9yoenmh62z+0KYZFBtuwQzbMwRgfK+CnODtMUH2enPDCypjQQMzTBXCFG2Pqfi3fWPyr1Dcn1A3kN9ix8HfHglYzDZLana2M6Ifjk9YzR+CHZZTtZF44lHaNtpOTxtM9e4EHrtklDGr9JJNxh78GkxNbLB3Sf6DH/O+bING7WbvtRjcJ1zQp7Qq9KWG7k7yx+S0FhN9UiLkubOoJXk4NLtHdcoS20wDT/88a1nsCOL3zm1dM8mDGozz4MW8Dxt3vua8YrFxG+FTsKHLXcBQyAg8aAwUahPDqWnnS3uYHG4TY28Qt30uvotM1gSj1mRrni8YwdSy1oBIyqsUbhAOP8z71sYJNOJ7LSbiSfNVLwI2ABUYaWYg8lK3xV1MNzJwQ/M+hmlQ2ETbCZbnDjtMdUGtmmcTDibKx8ZBQQOWoiP7U4eJlnEkxBKh1Qa2wmwxrJnGmcvzoRwmUk4HvVsjb88lZkEljMCs6R0Ew3nvIqZqQd3zpi9z+HhmT1joT1sAO7rr1v5lcfmtcodqbugkSpNuD5XmyAJfc9bgBMOVSrvJTsg+4bMZXY/WBT4gvpxq+dxRHTVKP/SC8YzBdud7uCrwfcWWsKpxCTXZHK/itoDbkleMT124urR4UjPzuGWjYc/3ypIqKCNFOLlvBNE2sPQiRW0gnwqJ8w4TbeLID845g2fVDz1+UTGxhxAkrJDnFVUtCIvFxI3bacTrG/SCOWnPFNWp0Ir5u5UrGntXzFa5J9BbkiY0QD5IWM09R1k/EYg3vDZkwlSeTjBHrbKoYkfNoqCDjRlud72LMVN5Tb4mbI+8Tb4c8TEn4YsQi3ixMea+gNR6TVtw3EpeG41vALsZ0Lw70UXcBFRl2Z39r8PkcQNT+n1qVFafV/G+8gXBvbcqhinsqhy+pJ8QDBVvk9JAwKd14e6Lyu8Nx2xraiPsXYmDtaBwmXpHe/M/3Mf0KYxnTeTMlN6WB1qrvw1e9qJ4UqwX9H3aTtniga0MFHgXH5aDDe6vmeUR0H47nOzVmqyA5Eua3YFVfJo5Dqh0YSHje5OYxH3UW5S+qRqJVA+OYPbUDCzVGhTtXiWVYYLLMXWfiNUZkz//F4v7Mj2l6aav7rOkmEivnr10wK1iq3hRTbZUgKuFvc4S0qZ5KraRBYuk0XUQjtSqG1RJoqQQIhIuCrykgwCA1oAozNM1rFLcyEK1ovbEU8/KLChM4Ih8by5hq5j+pYAbmjxvgkSR1MP5dYw5zwhHZmIM5iOrgQr4jNTsZKC3v54m1bQldjnfQmOzS76hFv3qdKeFhnxuAsMDLug3mlxNlHcLPDqPJQ+lOVtbfTgGNsf9Ru8JwJJBoK/xuTmBJk/u9LQwM8bS4dRiKgUXtLdKLKVxJHDJxI22sE22PHk0NNMX6Jw3Od8IaRDK3p4NXVNJmHQ0aUVkORRLLSfkL5tgw/ifbwZTPEhRPLoiNx4se0tNJLJI/e23qMj/tknRsqgqDj+Gc7O1oD6mbuyTWu+dmvhFcmTDYi9aMIeJhb4P0MDEodqgd5xF1yLK32JJKLHmFnutoFo+TsmNTKLiLn9vL5Ev+BUFsthsqWVZdQopOXQ2SM9yDhBCUeitgCkQTjtapUlgupDoI4V2HUtJd6UrDMqMmQrgiNzvSGlftpTO5NTe/cr0ZY+vPifxBlbJwYPUuKpCJRltqTgP1b68FUSPKdqHLAOaCxC5C+dZUkL0IDWMrOCydGzjBf1WWa3JO/l+d1p5Xchy4dhOutYx4+i15z1dnbKzqD2TER3VygCf7X3vXchHWmn88xNDvb6H3OUXSdsrUrBJnWpDTHi2qfymOXh1JlexISbaIzfDQJGrWEK2FENGXsmx930Og1z4ncfkSe8dAe000eex97L6/WwU/KlwV9bkTbHMlcnOmPrzc/s5FxwohQHAvnwo0QijnTEN7CIuKfBVIbjElY4VAq4/2vC2JabBShCT5GqzKOCnVXwl4nkJHYKpH7IIFTbMYGHfFBZDDjkEEx3U0vVHhtDex6EaYrg3pkEbI19H8+nC1t5a5wAcYZYF3BvTwBJ8YnbZHQJlCqUK/ew9xXVnA9kd07DxhXT3li7OsaSVy0GGqULn745p4HyEHRD9x9KEw7uiwe0kx7jer9LdMQ3JGnoUGnUAFo+z+haYMC9ZQTVPudn53pgy6dTcr71UwwPrcUylvV7CjAN7fzvJzBF5y6W0AcNEuba9pBsVuCsmKj/JVfEPJsuysH+VqisQahpHYJIZBNXLG6i3iaUMU9i+JVpnB9L915M0EducfnzlsQGQjTfjWF9WBw18hJ0kIxFgM09LOU54ragpYKEUNJ8Nj8AkGaZKqsihXpcnwihvyJmOSGXw22N6Avkx763qem3h06swAW4Ewa8dq7UvpuGK8n+V8yxWHLnlGHksVFoCeojvDVeUV49CQ4sTk2HhhvF8QWwHTANDVXmJu7u4klt8EPYVtIp7YOpbpAoOd6oxgjC1VSZg7oKp9/XrxnqkM1WRqmjEd8HUM9QCsoelH4TtE2ASsynqJ9z+KfatVDHfB5O4vSqfnaCc5QfnwPTi47kqd73LdwVinwOTEM8DrFkxo2pC/r0w8XFBLQsmGZUN1XSs+pg87XhOck0VbKgmqdnNTpzEVmXMJBkhWSoqVi1MmU/Lx/u6et43v0HhMeJIN7nD1OvmLfwHiidEiqKQLofkEb3GT6CmdLfWH/HqO/zwXwKLe+tQlM3HviTQ61AL1ZTuloGcSX91p3M7L5o8DsLvxEuBW2DCnW1G4SEcTBfZcqzVcJxtZCdmqHBam4eIn41nMJNRQ02ThHewzT3HbKOBsyLecqY7DVyJ4wLmhkhNbWNvfXezSmvdHwm7oe4husO/KPrjpJ/01RgbTA+h3+0+aqSiqkvTCIHRa1khq8Ymg8rZMZjU5KAAfm6PZ4ojKGD71EKPt1djoibGHBnhRqoXXQFIoiR13dtAE9UYKsjMDNkywfdei0pisq6NwKvDnE4/3FYctj9fNV54E3AjasmA6ai3ipf77cUqcXEVWm/6tkJG6F3vCFMH290xFUT5lvpWdZ90/Uuf3nyKISluI0UxUDNUfDJM04CDAt6EP4ZuYGi6m1lM+exvfAtgYKyLH8rnWp/XToLuHknzDZ5ErHIVTOJJsqVB1oAFJ5fCVCZjSTzwM6TXsH0aTOKYRSy9r82I9+2LyW77UdCIeAdeEFMxEfgvKnawbEzoQi+Iqf88YuPedzgm7RkIZ8bUr7+jfwFTfwaC+y9gggM17/UxAWfNvIBTYuoIEo7+EUycHgmauSDFOttq+hcw4aFi8eqYgkGG+XN1TG7JjCJXvO/94phgRcX5oUj21THhLiNbKc9d+/KYqNC4G1PbvjymcqQPbCmsISMdi+lZQbJM7UpnwFTOl+ggYftfwITKo5K/AaTjMMEyHZaaouKnwATLwx/dBNJRmMpDxdc3WZg+HFO5JXl4i7V0FCY34okrsK+PKehdpIcvj+mF+nPA7KtjevdqvuYI0XGYwtH+ksti8sVTLbKvj6nSvDfyqSpPlF8fU9VPww1PpNe3U7SFWO9YTNhxNhDrHYjprTu//sx28p2dPG8/TLex5ujrYvL+22sx7dd7B9QmHF4JU4+4Qm/Tf806Ij4A+/KYBs3hwL08pubSCLxDGN8NU3Mpqm9aT3kgplezhND2DGI3TPWh6UsMqgUOxzRotIPPy2PqZ1XI1v+gtbdMxX/a/wAmXqCHPtv/e/v6HqK2/W9gYm0mMbb3ef4Pz+pgze7QaDgAAAAASUVORK5CYII=',     white: true },
  { label: 'LAMBORGHINI',   brand: null,      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQoAAAEsCAMAAAAM4A3QAAABWGlDQ1BJQ0MgUHJvZmlsZQAAeJx9kLFLw1AQxr9WpaB1EB0cHDKJQ5SSCro4tBVEcQhVweqUvqapkMZHkiIFN/+Bgv+BCs5uFoc6OjgIopPo5uSk4KLleS+JpCJ6j+N+fO+74zggOW5wbvcDqDu+W1zKK5ulLSX1jAS9IAzm8Zyur0r+rj/j/T703k7LWb///43Biukxqp+UGcZdH0ioxPqezyXvE4+5tBRxS7IV8onkcsjngWe9WCC+JlZYzagQvxCr5R7d6uG63WDRDnL7tOlsrMk5lBNYxA48cNgw0IQCHdk//LOBv4BdcjfhUp+FGnzqyZEiJ5jEy3DAMAOVWEOGUpN3ju53F91PjbWDJ2ChI4S4iLWVDnA2Rydrx9rUPDAyBFy1ueEagdRHmaxWgddTYLgEjN5Qz7ZXzWrh9uk8MPAoxNskkDoEui0hPo6E6B5T8wNw6XwBA6diE8HYWhMAAABgUExURdXV1eLi4urq6szMzLCwsH19fbS0tLu7u8C+voB/f3///x8fHwD//2BfX7/AwEA/Pz9AQAAAAAYGBv7+/hYWFicnJzc3N7e3t6inp0dHR8bGxldXV5eXl3d3d2dnZ4eHh3hOyGUAAAAgdFJOU59eJNEDAtSw9P4C/wH9///9AP4G/v79+v398v3+/v3++H6zvQAAN0NJREFUeNrdfQubqkiybZKAe8953Hup5CkI//9f3lgRkUmCqKho9YznOz3dVZbCIjLescIUh79c7pzLsrwocvyDf0QvaxN9mV0vvNPSC3+Lz8jzPMsym2Uuo284/rILU3z4JRjQraXp+W8TXu29l7zljFeaKiju0xd6FBT05HJ9VLm/d3r9+fPndNL7HobpgtdIr/7xa6S3TtM0DIrOiT7LSwvJSh5JoPtHQIELyRfX4mxi0vO54XufcOd933U1XhW9yideeH+FP+zoxdAQMJAWEpUkvor8EETMWzphAQCdAZZ8PP4AwHz3P6++Ai7AhMWFIBlwjFKWknB23oTjIRTuhjBk4dtxIAzkYJgg+d18+/tuMn7twgWoECgjQdJCRpJZtxYspO4jUGR2Sy2oJFjShSwJkIMZhO1nKrLOwt6JNth88a/4TatDdQWJSAkDQqqE9asXkPwVNB5BYe1aNahZ4ANxBggMwdYTFQT47vnGL5NIdmwh5hehSjrmHEwMVA10zXzSqi25wZfUdS8SkgKN+RrdoVBE8LpYL0InkCjgKqvo+kQCajnVPZuAyELqHXuvYfmCD2Ejt8Pjon9+rYEWcIgaYQHBF9gXxMLsNBRZFqQBOAyEwgIDuSSWgV5PMd36fM/We0tuh3IL7wvwCESskAY2S3gE14exqjrCv20hHgnDkZNDthOWPVDoJwEFEQY8GrqQJQIKAav2Rp59cvMq2A3Jly+xy7cdSQd3BafInx9IyUosRYP0PZtdehL20APirEgDWYmmpaMLafhZCWcvukseRuQsQ+/iBanK+PafkAp5s/4x/U/0K5YVCImYra6r1uLB19SeRTgcxPrht5odAuESPAn+zno+pILBOAYUzNURPc4T1E+7EhL2ZaBIWEJmUVUDM16GBpdm35IKDakY/qadltJQKg4D+36GDfvs+vkHekfx5BJcze9x+uxViLakJPxbvjhHKrHq19QLBUJXCeFoUtZWRXZXbzyQCpvyN0TSoCCoMTdmjpS2vF/+79XTfOzBFXvewpiEyBcSklK807Zi3YPsVnxWWHPY+9+4BQWbC4mpzu2lr+MzUYnUnc9eRYsk5G5DpsTq8O+z+SGqk+59ZlUBlm2NGhwbfo6L0RjfrTG9CgBYicDADVBpkXiwcAyNeB3Ff2XbesPceAKW/ScxmbEqYsM9+3X5Ay3ICi52dehfk3MrMepAas0VOdChnw3yggEiX3rGonDqatj1kSniM+kit4fkA/Z+lg59hnxU9koFEiPiREE/dFWsIkdcezobyLXh84fdFSJTPkvBgaQVb90Rxs008ommRzU1FGLS59m07cUlZ78Uqt8HOXQt4mfhoYZIQy42XIh1emLm0ChhVxjKIwg1ZKMV2bD5tWRsHBBnIGJ9UMeqHNrTLA35HYeBrzRR48/uEKxa6oqMT4dpx7oMH9y3Zzx/ex7qODjvLo3Bz+mOzg1UFfzXcTibcKBuCiPBkXs3iKSjbUWXhieKk0Kn292XCpdbPITTQh7WWqdYan0XRcgsBfwtLqXP4ACtriREaOnPcZZN21cqsQCk6ukXgGKqQuiGf6kv54Q0DEE6+GspCaBWYgwcX8RfQV9f6eZwvCx84ylyjUs5KHiqxVIyzOKPRSCCfij9AcMfWvaWbjqDLAnkArbALGnGrprjybKsRzzmDL+ocTk9qYq+Bhb0i0KhKOEn4oDjX6eUIR36YMIJvq49W0iXOQ+kahoTjJdbuDKCDa42F+3fiJiX3hHoerrOZGVPjP8cx6pyFgivHkSH3XJE2VzreU3pAVK2qaF7SOZnX/E5o8fcwGtNp67EfyDP0F7o33863LNAURHs5C5dOmDR0/udyFDJ4T0eazW2BveZ0imr++GcsCOJXIGRs+M2Q3THnnIkG6ynWpbg+b14JLgbaPa0uczHyssD3yy5Q6SalpbAcXwEGXCiBJoegtANAYqq4wzliAdLP6enQEJBH0+wsOVsLhXuju6ZdAW9v4YWpR9P+OOabjpRYQFEjBCkCw/TDH0ph4h1bkMBsOqRDc8mQyTAbhg+pA5qg87bOVlKBaDIoNmHHrIpbwMOS+1CHzc7grj1M9yZCZcA48+aj/64BhQWUNB1D5x6mPCYqynBU+7wwFsj6rnF3XVtQnfDULQ4FMAL7x8MocvIjYg0SX12jCgdkSId6HMqhYIA6+puYoFPUjZX6usoLt7SWJYN9jjkaUMykmAHDd8k3VnaeM3OeDVqLfIb6gFPDMeaLoFl1Gu+n671UNDJTtljai41oDC4Y9wCXXUO/C1+UdZ0zx6Ks81sbpupViha3H0PnUCP9cw/JrFwLnwOQ0HSxe/iuyDPBD/ezDJoFHHpgi7sI6sEKDIEXAP0mTpm8ETWTq96iYk/D0nDCq2GfAMKeZYLKPpGPoUUBEPhrNwNyw1B4U4TQ5FaPSB44qw4PBQQtOqSijqib2SxMIWHgn6RMxTQOYCCwO27nj7fif+KL1mjkojLJAeFHiUBnQUo2K53par6AcGLk6go1g6cyz0HxJOGP6yCfEOwjHzCz6wrAAXXsuhX+vD5JmsYVoIiIyUKKKazFZECFC5IBX2umUhQ8YeOfSJDuoVNC0OBf7NyQEgqBAp8b8mPwMGKLjS+hOoUYUJvQO/KESAXJrUs+EbMIB9nuq+R/Y/rdJ4Td3m84Jnj3NCDFymqJ8MnhG6LP7teQMF+ElAqZ6mAQhSpSIclFC0/fysHqk2cQEGYkNKGJSaXlOwGvYmhCFIhULQMhZwoC9V3Yd8uceFOopNOoqEOC9y5BAaaoKBrVZlgaYGGyNRhm518yA0MBNtEhsIJFD8lO0P0+0sEhW1HhsJwlYAFBmpTRb9V34ilAkc+ggKeGs4+oLAGUgOxy9hNsGR/5WHMuiKCgoARdd2f4Fq1BGPFBnd+rOI2aHBxFp+FHybuFxcrpq9kQ73O7QahaHqRmyZRKE6dQNHDR8pgSlkzd6e1rnBAKZIKhoL/D1IRQ0HWLaVIamJ/o7GOoYBUuPmYI6CKdAUfkH9VsY4iKNjBhy9HjkjKvgNpw5V/hBCQPRvYf1gO41Flv8/6MseV0UgGsbP1wEJPUDQChSgH8rTrnxomaKE2OUtr2v+tWN3NUFgPhd6ReptkwinjP3bshf4pigAFa2bkhyRH5OhA89O0EDrxPjaggJSKhRPTf9a4xqeRrfnLWJD3D8GDOm7lv3EIQzhoi6U/ZcRUsiEQKOAi/IjDJO5iySnG6JK6QWIyBKJ09mwR6Yo1FIw0Z4sJULZypigiXZGg9MR1dcCiahP/ns0HZAsKPtHs9fQs9HExgxRxg2OtCpigYCsovoumMilXYdwqvriIhalENaiuKOEu9q1l216OI6A4RS7WNHFemP7MhxoMRZIpFKIrAhSCrWgtXHaAgjIyrZaPz6kVDKE2yT/KsptQ8CfREwdcdM/w2jUnKrLFypXdYo6QDEwBHsPlbABZzlHVNDV24VPA7yu5EIN7ClBU7AzTmYG6qS6AmCD1lyShg0Sg+LNgQRK3hoJdLI5Y+BRSPA65VGNKUCTpRaqMiHEdFDF/JvvDm1BYM1s4Kx4svFzOl1CcnVo+JmLdWA6gK1gLVLBFOaINuusLfWO79NjYHkJ22cXxFoQ0Lf24pHuh31f1MAkUXpNrWCfKlX+shuIWFBSz+LOayKkMUJxH7y1DLBmKspcgiTIg5U0oCLBz4qEYRDPWmg7JCnVV5RgZEX0+8BzRASdKMQxLKOA11EgY0jvTYEzJP4G3ThdH3g+h2S6hkIohVylKVkXkPFULXbGEAgEr0GShdgIFC12Rk9siqQOYc4XiB9VBip1Fz96CQiwcH2COfQxAETWj8XTNMSF9KIc8sCf+MKQX/f4sggL6pKNccoW/ml2sDvEifVmajlU9ptCkdQQFZSU4pmRbTYBZ9RiCBVlBQa4BvgiuBDtyMxQOGQp2ECs8QNa3UCxc7uAgcltXwKQhC6BQJICiV2dIfWgYDfjMzlBKoJRgUW/dXFQqs8iA4E19gziFrpNjeoGCzAMwapoOJweuRhdFpoM0gzSIQX5GD8VtqSAUo5hzYUwtij8XeK2QSo5qoLTL8kcTRNdQAPW68lmAWSroVn5GD0VenAA+xMRIMmU8r6GY1aYDdPSzMQ0hI34Gv4LOBMkQaTmSMnKo/nSLS+oacWoY7Z9+hiKxt6BwcqVQcNkCCggzPieCokRiOBTVt6AgXVZLpiSJoBhjKLIiZUm9pBRiscMvj0F0hRyQAAUnR+hKyynhR1bCzpGlbvm+G/oRhS50/ui4na6gQNwl386xtodCZS29jkwtXxkZen0qAgUpOKr+JOzAI1DlAI+MYyvV7Lq8AUV3AXhsrRdSUV5S1YUZDhvLQmIkT8KRjfgfG1Cwaq2GRD5mbBQK+FNN2yPB0ZWICJZQVB3HIOQ//w1QRDEI/arZCNIhgOyoFrNUoIINN2sJBcVxhlscpv4GFKSrEcziaMZQQFek1kMRZJZ9jKBRiw0oJDnLrg6ZNFZqBodXdMWZUOL0Nd1RcqrX+QrkDSKp0EwEcrVIfDWie+CRDyFIl2fDcAW1aeUyQvrCqJsK5wsxaHUDipEzaPQNsQUJUMBKBSgoV8UPuh5CLmcLCmSTWK3D0P8gkuOnx1CkE9s43JH+KArSKRHgsjxAoZ42e56FJnEZsAAFwmTAJSo+RPdcZ8g9FCEylZzOLW+zgtgjRK4vJ4HitDwgSMdkqjwYCk5BD3NlTv0a74UjZMclcZypF/OHkwdy34mkNKvx5K6h0EyZfNkZyUrx7bjGZjiuFwWfzlksNsmluMJs6EYfZyfyIFJ2vFkH0Em1bhuKRKDAGaz600IqRDWEA7KEgtPRRYBiLRV/YCbInmeaGjmhUoD7xjmXPD+SS9dQJNwTcmZti2/nE0a/IDfxhByjz5DHUBh+TwdZSMTLoIJHgjhS/8vMUFgpG2kWy8r3xlKRUhgGdUMGfak2ZyiSAEV7BcVabVJqAlLGtyiaha2hQHGWnBPH4DMUakFa6bqjTDrd/784+uMkERm58cJJJDIDZ47TwgGxCat0SJlm0ZFnStGmxieHQwI9IGaZ0NuCIuXDOREkVy7Wbihmx9slYizO7CxVqvdUKs5yWawJEvbF2zj5P3FsyvdDZxCxnmRLylrd6J6TeB4KTrMY+WNoUxTT8LdcCJH4BH73OnWzyG1G3iZBYRD2lJdGpOJZKHwM5GsI4s53FM9REYFvYPybqK6gi58/e4Yi8VUt30WHbKqVOvqlm5t3CCzOlVrOZ3WSONXcpoTpWmaDey2f0/ogXSxIvpCKha6gD7lwoFhSIDZMSwuyF4pIKlyo4vWhB4k/M0BBTlEpT0igGOJCYSi9ag4go7LMJG2/XI9tJJviUGQN5XMuA0qNBwlIkR98Vsl5DLdO/p81+e+h6BQKChTp8mBD6Jsu70CRBa+C0zZzLy2rrkTVJl0KAc4JyCsoQuuA5h/YmyVXZuBJCPTBJFp+jBNuyJjQwZLKjkPkEYqXnLXNFwckm6FwERQQZYECKkb84eehuKygEGujrWhcSqkvXkdK7EV1OsT4AsV05rpXpx29/SgtCcgK+Sq1di9L55zTjKFJvW/D1V701cnZaU4Td/H2vZTpAxR8P3ehGOGONR2HK+VDKJoHalOiIOnvoizsMKovEEHRjD30PVchNDGIoon05UvTTahYW5SinDZ3zn1rblWMC/2dqOBIg2YrPR5Wew3m8nGkNq9cLBxbZH1KZJ32QuFuSIX6fDW3YZ3SsyTA6GDOEXkzXfC/XKYbpZ6cULfcKfUzPW6+SeeW+eO5cCXCcdVE53wzFpo8XEi10hm7NMs0b2RBCj2t7EnhANOD/HkXCie5nArdP6gWSWmUAw6GgtN07dAYybBTVjpxy1ZL6XhYtzUvfu1C91085nKN1/zvCZrhU8EYdWVyhoPlYigKyStA9XLgWJY7oWDH+382slhaJyZnUm9RIyp6Iqe+FMtJCJxh1rhia5LlY99sZOZm6dsjBkhGu80JFLeYSkpCo9uFpgzOwcVSXVGpVFgtbD8BhVtDwf3VUtnnk8gdCxwiIKI6kcVj88fdeGupl37umy2MbqPJM+MGXwxQWi4uXzdXRSXcZZHmjAY+JEfgklX9AgrUQet9UPTbUHjHm70fpKi4CU2aayrkWskmDo1kKf2tOberPffx6MnDX3N/SNC11veXO3SxdZcFFLlmxt6AgjK5eNrsYFGkwFVlyjOgxaRH644Vy/DeK/d95Mn1uC0al7O4BfBWw3Okc9BkBMUl1TGGIvOlvReh6AbL9p90JUqA1cXMEQnpxhOHitZZ63Y8z9uN2/xP7hmT+Sh5yUjJOW7f1dY5e7vdWyq93DDJURr81/qiThgnEnZAwblpzWI5LxUTBTLwDVIquFCJA5FxqCS/LwxqP3PuM21aGbaptcmTh+PYMZNuegRC96G4Pknsvk9To7GrhERdnMXayldo7tstoRgn7u2j0JyC0Wpsgpuhno87ZNqDXEk0VNZXo7hVpQM3S+HYOdnlZgVSzAGeFPZEccRQzAk95BeraSkVKDxxFFQRFH03aufoM6MLj7UERyPjesBnOT7pO2+fQf2qXRGIc2NSG0Fhb0KR2iih9+MjQcgUooWlt3DQ5A+alusHU7bSld2eXxiSxqxI7kcsKNjttfJ8Cwr0kdY+yFtCwVE0eZXGHKEbrhVdglZVDfFWs4k6oFnJq+ZeU/uOmUaw2w7cmCU55xgKTqwh+X/WPInlyNEfELRByzCJs5IjP/ZFBXtJ8qJFNG6v99H4Ra0Jz5aOwKLI3wGeNYdxHoo4zRtKQlKsC8YFRrhfN/sXh0tFZtFxhfo6wZ1Kj/0MhmTw/KCuj0nzA8bwnCSD6indAQXBNnFShSPKzBWHTgXO/iHncnueaoCLlaItplxAwePKOrL7NpMHs6xImAsnofG5EYKCi8aomUolNkAhUy0PR87evC4fWKNnbG6knOcU0CgvIzXGHaifwlc1vtmKoWBZoCxoGooU2Ty/aXlUNv8UqYqqba77hIFrdOZP0dAG9+aTj2SjgduDGGeS2VcJUFBTgVEozFI1fpRahqH48YFjSE5gsleGiXWIDFlg5z5wPS6qd3E5H9VIoxfFzWbBY/swx06QCpb/jBvBacSi8OPeoi/PZxmPyqwfxM2OGWfO8xlZ6a9gd1uggLP1toZ+Uleg/nlpr0aQePpNhvsT+8wI7vPBoFzK6aJdhib4nbeoXD4ARY4W7JF7sNvGE2D5FlsXveyCtSHR3HB24EVl2oA0cFuah+J7UoHEN+obtZ/pboTXSF5G/oepTmYOLSVC0Rkg958DBey7xGI6rhfRnwQaE2V44SIIx+3CELKafntXQE/coXgiKCRzQfna4rtIIGuNTMXIxR61Gsr1E72q6CX9vByruqMEg6DouVkxtLDOfZvfwwIZciaLmelJ1nmLaqZPCrQ/JQ/wLhPr77xQxODer1+DAg8EWU2eW1dqsSHK6vEE/xS/LtI6L0Oif81BWLgZCi6E/woUy5lhzzko+tKrzRVRlAxUlNyjcBAW3CfCXVDkWUyl9A8VvwBGHkazeC5WLefShEb/CQIFaZM+Cgup/S6gQO3gN8B42u5QszdXs3XG9m3lbYYZimT4Z0DhpJwg/hMXVRfeFn5LKdwcI7EytK7Dje/6ejwDwkMQMhXG/fy/LhWOC4SFYEC4LGMhq1V4mWb+8cONbyZOdPxCoGgrlZBfhkJrHaw+Q/zhllDoxNeo1BfvPj4/g4dZVz8wVa3Hgn4DiozH1ryfnSoeuVuSVNDlp5PMh6bvZvl8n0qNHJKHAoOt+e8ioaOfYJYJydWoWSPWnYOOuyXvSwU3mnHHqNFOjK41v6oshLWllVKZpPx7LRYyHNlC7fM46Jy2fgsK5oVA1xCg6H8dCsfdaqEwwvOYvjqGRCvXJrP5pDAUP1ept1dySE2YwTOhCfkXoQAQTPBTM0PRIFSeqKQya6TIhp0bTpy02B8DRT9D4Za19F9Bgj2njgthzHcnEy9KHRQInKyXDcsDupyQdUdkFmcoeHhqOv+eNeV5QUICnBG+7MBJzkH4Ab0aVc5qyxbkGF0hBaFepo9lmK18Xx2/qCVyryWEMwJlKIf6jTC+NpNvbPbkGjQaID21h1gQTv1L6n0BRfYrkanQgFW1iESeL/wtI6Wi0heKUDUTLprFlNfLUPyZdJ6Qx/PnopD7tk/F+X5MVnD5J2WRiNtGuOWNeSYCUQ/BIaxh0mzq3oxB/uhopTAVhAmlX/Cx0EdGKYigJdyqj8hJvypVipSoimf4hT7lkFgBUOh4mjRf6Oh2/mWRAGuiiIS0Qy/7MZ0URdBZYZkWa9mfwwPW70FBf/9nLH3/lYfih7tzvndCnHRiTVwAoMqQscV1iVZ7U60ojXYBBlMwuHehsH6gEhoUEcnIPC1f9LEw08FJGOq9rYU88vq7hZGyH1txvSlAOY1zEwaLcWbf9WekxZ1jUTQmS3bzfXl7KpGGljSEG/3Q3KxrkEqluhFxcoIui4dqhLRK53PevWDPZ6BhufE8Nsxg8RUo0MRtxCqg/4iJ2TaxoDZN8PCA90Z5gJnASwXj/Qv2M2s03B6gGDzD4Zekgszj6IFg5lHntsqzNNmfYLi56mVcOefJSz+KVXmWi3egkLE4yYfBixequr75hmOBsRnhcBQuv2j44xqKTOd+kG9TubHp4CcS3/Y2szlx46FIWq87vhJ5YU6cyzrUKW5zl98vDgjv08AjpVZ4FBWLtxO9WRj0iaDQmeKPKwsep55gN6RDeIc7KOwII5sLZtKjQW2vLcYmcYckbpZQ/HwBCk/rWYFNFCNxj9p7Al1T50tWyPK2nkm1fi/JwgSFZRj1NexnjELc8mm96ZCshps9MaGn2+kFjbUUNZ0fke+P0RbKkyJzP55ZkWPT6fzpTK8TJiY4TXZnh0QY0fIeIKmP06U+xPnOeeicgnL5aBO47D6eseAxTNBrNc/UZ50oB9YWTm9g6Hyvq1J6vgyFxKVG+TaLEJt+OGPBfG9VxXXf/e1U8INAGBAEwOcjlejx9VPN/eyVsAZ7KHhWWZx690kkYAxqrmllOwd+PGlEzPTLnxNaoLkL9mVXz88FeShyDdMxRJN/1Hq0TCQGXqfCZU/8obAQqgD4IXSNRCbzRqN5FJcqFAwzo/NRlwLWY3zep3Wen0YEIIulwtNGvRiBBN8y8zTFEpvS/N1n21Zbyk0I96t78mRxxy1piyJfHZBZWF5pKOBZ3LKPoUBsWipR4KdeOb4E4bBlhoYnphrgrIv9b3nLhGeR0CMCgqTs1WCsVsqYYEG0HstEgZ/rl0lHGFLdN5E+YQTZzRJOt4QavpVFYs5bvFYjy5RrU5hkZkpz73rbzylNTL8zNx7G6S/DExWo/wKFWOenI4vIrxAjcrL2xRMbgrF8hkI3DqSfcr2VLJzvRdYVDDtcW6dklIWOlfP5svY01fGgWde+pC1ciED0zz0UM+nQh3o08RU6Cs1s9J7Jf1dC2EFxCsUvpqJnIh0hkX7psuciYZIHzv9cLXf1uQoZoOgr9p7F8f/hMuWjnnhmb8gL5q4TLup+aIco2RvIGNxLehwackyjpRieZ70cmw9KRQunG7VJ9nZ9ZHy3SY0Y2YVl3QZ6Kc88tDgh0wuxutB9cjBW5Asowg6TD0mFswO8ChzL0ygrVc4Prj/htizli/I7NwLV90JxNi8k4LLkNGoEEkNhZRC1Hj4FBbNnob/egReYXSM/5Xv7oWEg1HftWqUm2Xy90CcjJu1n9jUDFIky1P5x2ads6aVk1kmsaJC0y4MMO6kH3T1hnNiQm1BUw9PNIbqmwHPKzsu2qDAh/uafzwRkEubUwpYo2wO0+HA3kEX1TLgXfXBwA4rn9b2Xs+BreihUQxON0mccCw5+ZZeYuHg/P/89S+ad3Hgvi6coDVqoDdnkMxjbZ6EAHW7oNlpAMRcAPpPqZbLQXlm8ymjdzH0yA2FTBl1u7pLY3V5BoW7oS4n/0AcboOCVCNEvDlYVcLCkzcc/3OrywLeVOl6pZJ7Oi9MWFPXTOU5f/fl/s6tqwlaYS31Ie9MNKOBhSm/LxTfQIC2VP8hqyt3rCpLbNoS5i91z1l1CUJDmFsUCChu2en3AnDpwEFVIWudJyEs+crLEnJY+henE+N2BoniylM+qYpy1o1G15pYZnaNT3al4FRKf+qTLdL4PhT1dfPEHViSJ0xTrA/KsQ+RC5m6xja4IsR9/Zv4h+0FS7mIpfzBtgGs6jcpcAHoHiRluqM3nnmDkYM0YmvnB8ZDFxRysKjLe+kckGcICGem+sEPtjmfRaqMiTyYkbbcNRdW3T0MxN+OtoJB8m7QWHOtaWCFnFPth/ekPPUTuf+4cEsd7ybk3EQo9ikPWqqJ5Fgp7HYubKHqvlVT0UCgybIeaOBTD+l4+/Z7viOOQ4m4N2YEQvZK2Oe+oXr3qZx3vOVkV/eEMBadSwVx+MPVTzjtr6lFJtMuZyVlmntwdH4vHZXRUjIybX4pzBUX7ZPotC90DZhMK+eVwPhYK0RTCXqxmqqp1x72uOL6fvlH8YFDNadvhfPr5KcMgDGZ+tfs4/5BnIWRHlSzbMtxv09HEB1Yh6bSo2x4jw1yhLMfTTZCkEM43lEU9nZ/VFTxduyx3mOiSW43fjwzUeQ6HqRnZjwYoYPlNudWOlxkvRRtUrBg3FR6PjGksdcMCNbG1/eYJefb5sb38kSLT5kbs5COVU07vyqgw7Ed/4eWYifmLbkVSIY87Dp1kXnk5zTb3YPmkMXWbVeIZipw9i7K+HNjKmuWIqCqkHCx3mgytH5/mcZj+0qZXu6UNr6d1vLpZWH99F0F5z9vMnwqUQwJzEwpJRVfH5npRyWJDYYXCHU15GW85xXJ60LnGxLJIURBzQwtudx6aErYy0FPHJBYbCYuzfTZQvjpXZmFgukM9C1lvUssGwHwHczMnrsBtIhR6vBoADeAwqGBP41UBzPpRrbgYn7poui5ZXr4soJjF+tbQupcf1VyChX1Tqhx4NAg18545l60mrUXFCo8Jkb6AexL+CFOFp+fUcxinIELBksDyRc/CaTtavezwj6Vi0eZ7TEMelhDFOZAlmblb7rlXErWfmTkOja5cOqLTMkPBpB4g9A1kOAJFvps0wzAlQb+sGcS6QnLAR3kWyKOzHW3nOPg+TWNWLNLatPR24P2+sD1non6h6VMwJbEuUenQtTS04uwJKLRth3f0uE1jWoQFUOYgKCgix/GwS87L+91acz9NN+lQOj6J+uOFHol5oYgU6s/JU8AQT86F9488EaBz3XhaDgOZZa5krDRQd0e02UAoHhuksBcDbl4IuEosNbXMjeYTS+HglJ4kNlHqF2P2t0OE5sylKV1BoQXVvjkiDJHNbZV0HO1h/+FFOq2ffamEwEWG6azxu8dn+l7Mqw8nvJjR+amo9OKHS29AsRxLfhsMqVzUzfIyN06I7uB22ozX6VZ7LC2bhyM0Pl16E5jchnjwAL/bXwERU7ruJjFbnfCHDGXbnJuvItXkFt6FU2lRsvtUWpKMRlyk0/xOCQxOYRq1vsVujSmC5Blvh7c9o8coL25A4Tk+Klmo/f4BuVQLOiGnLKMQgxyOtc2FJR6z1UwtzZUfJvVB/tWzjtLAXZpuSMUsHXBd9gqyk+WYWLOznGE0G2Nlx+S9bULZBbQ+5AsqWGmZWNI7IWvX8VZCdm462dzkCetTcjtBu1/dYT7vpr00Wd6U0kMqbkOBFydHquntQF0q1WvDjMXjrSp+J5RghpmrSx4Qs5LB+xfvhDyJUUE/Hihf7tPAcxIoz/eHYj/XvSRmJdTcXEBNOUlxOBRs0C/iFSh/piyp7WSQjDf0EUTGr8gtnBBX1eXPAz78H111nu1uk94gv1hB4UKj1AHZqysoSNZ7LL5iDuKL0AMKJ57IBCixrJMjIh06OVeTfna8eKP4zAGT37AoiEpHz8yQ35UKMaePu4N2NmpeScVY8Q7rypP66yL4sRX6doLCV6dGXZydrBryFqLQBx70UjbGOreebb9qVYBeXodiW1CoDaGhU3cUFFaHezLPTryVvU+DzeKukopT3Bgv48rpjcUZ5Sg72P1Unbbg5lmw1DemSyBDV8/abNbxq+5dxjDd0tVxMXPeadaMW1CgiDsH776LkDQhl+qStI3XI5Rz7gbLOdvwiViRrbzfFjH9Vo9vpttluWr5CAqdtCTGkPxt8t0ABSuBhGdtNx7wys6E3T/K7sFxqSdEonPVzYdixIKTSz3XVXRJPdlf3gXnrsuWkUNd3IMi5Lpk97B7mwXA3yT2DJ6xnbXaztKa2Hir7i5LT2IAngvYGo7RdS+6PxNUHJn8D4QsiVMZ2JW5YVCIijfEH+4+FL6ZvHw3DmFdoRYEO7AasZrbCevF1JroCu3M4al1ZH2tZDrpBfVQRtVSg3Hm8MHYJYx4nid6N3ggJP4ot2hyzHW7Lwfz71I46uJibpLizXlX6cgIissSiqiRggtIQt8NR/Us6yJin7vHkWiGyJQwV9Jpa9WNuNMSf7hHB2SOQ96kWpSuRKEe4eN8zz2KpcLX+6MAY+SlmfRCTnNdCqkwtQoOCEp2hoU7zXbh0I+dzQO896HwwL3HcpJz4oZrNcm22YihiFKImDFbDjnIviHm+q6vJYv91MRyek+UCbjz7eZGj1wrKtT+uJGCN9s9+tp68B5hCHmWdJO8Y/O+0xznk7Jiw6fyvN7bfmbH63B4NS5eN7dAcW6qu9kFZjbeL0q2f8eG6Ioc4Glu9cpEHhZC+Zg4uPx55iWbdTNO7SHCu9WyoRvfb5lHsyVFfPFvcsnAlSmRlTuND2MInKNweBPtUCx34FHKgUECdWGNb6bgpalh2iyamNsBPRhf8nfmazmWSe907C8dbxfS0WIVu8dYaAzibbYsYHUP+FxupWPMNrd19R6XjHZr0CFLz5cdTxcHiW/Bb7vGj6abO/vmP0M5fm+zYubESt+qeZmt5J+0wlWv0/XpKAtV5c3Q7RF0KE4b9YthffX58kjd0hlu+TRVO6BwfvFcdyPsNrcLzW9Qe0qJEH5aM+7JNoRWhly70Cm0OpnmvlyQLJyEe3qvVHBLbHlras3cagUQArXXlEUuug+kHTutQampm0IlEsEqzHB/B0h0bejQ2w4oZqV5q83e3LqT8h0SLj8XSo5Rtc8gouDAyUxuH9U6SIrerTtCQdUmGfXZ0c0rS8R/PEvcTih4CLx6fTzEBd239IrumUcua2fRMBBWsZt7UGjPuLbPPISClebdRgFzexRyudvzyQbRjVpWXf/f6t7BNy4uICM/l07bOhfrZIR6FJmAfcV/65XmzZB7GwoXZS1egqK91pb1eLkXi8hkhjxlMQ+XW72J5HJgqAzrJx0PVeyZHcuIWrPSKZTtl7nnIf1wN597Zdp7naMhG9E2wz3NId3JeARlpX4TkS9WG6WwEdkZMi7IyzNh5kO6aVZC6mneDCfM3U6HZ4n13DwJU67DjAZrZO8YR/SsO54mqqW5iByo85VXIoytYJ+seazCpn05O6u3B5nVn79X+DN3tqmUnrzu+c6KFRSl0POYezGqqPaWQvFLy0YU6uO00jkldyQhDU7SgIYegoJbtR+o91yEQogJ3TNQhLm6l9iLr6HQ2tfdmJNllw4Isfwb8SHL8c+SqgJIcLYTnC9giKIcDalNGN5HbbCSJLzL538LCk2gUO+LeW1UrFxH0fRK72YuuMWFFnCnfvCDit3nYdHgTikrKZk7MY0kQORi8QDYQ94ndnTIvbr5YM2DhqVXcpxrKKRJL7dJerkbYEFxOrTvqi0GFIvhUjoRqdUCO/ckUS8jAfKwYypQMdwdujd3R99e25axhkLnmXTw/Z4nTUqaK+wKxeXPmtYmtdr4yWM2WAeAsfVHLFZ+vnad19gHhTT3CkXpsx0Gayikiwfne3zQGcD5VAsymFrizUVgG7sPIdu1o6XQ5epe3Z8mMvcovSSx9zSpxQoKFSwE7v2j/EPKaQsd96OnbaKML27ZRh2gPgf6oDMGkY09q3t1T8LNw6E7xM/vQFFqwngLilXyNlwrKzmo7CgbCCapqCd89u7ZgbR33Su9k/sr98xdkjLvqtp3oOil/pJfz8zy4o+4xIMpXBLnHOPaPBa0/Jw4fRLFfA8iEE9K8Ei+zb0TloQT5rKXofC0CHlUAAxhBrnQVEiNGPFavNfm0FP0vfEI4arOGWzcYygkj8QX4l6CIoS1/90/2fS9dLE6f0BzpoFaBKNn1P9C6IbizyQZJvAyU2J0wRB3xRKrUSxPmboH5JY/j6c7zL1clCZG6rjNbhehP5Ok+4fpe7yzVR+qsvV4fHBaiDkLjx7r45tpWCZG16lWlFouAsXf5G6fzazzitd0BePJbEXlcyPJLpQyxEB6kVpXQ+GCkt/ls7llf5l6ZvJ3RlaYSgmlXFjaNX/OQ6nIir2W0OwgFBNt4Z6pgQTHyNMh++Jht6REdPN7a6qYTxiFoXjhhGblxJ4il4xXmS/vWA/IfV3htCkW1an792AeJcG0NWu/tsgXOaxo1Nm7v9FTtjoQLUnbxLKypPTuiB4Sm6QLr2LJPu/JBh6k84SsU5KTD+yg2cWYVO9mvCt0nHTpXi2cthBZJTMhnHLAIjtPHVhgS6JIC4Me1R0oFFgmud184OyucRhT1v86PRJrs2etio6p7SebDkqzinq8XVwj52CVkAipTLD65UgqUC2IUr1o75yaiO2C2UDdVgJVHpS7yZIw1vv2A5nHnHtdqYRMbm+2e9YUoZQSJ/b18hPhm4ziCy46oElxQBoLzUWnrrwhFdE5rMZbMhtE9LGmeAiFj+nYZcz2baqNTgE0mvSUWl7JGjDiTGG87UN3PYATh+DjhqJ6AUW9IspbQHErdcPM+prHe/ggzQ5a41q1mtuzVA2uXXVdIXe+uVo7ZSjxQFuVLvMOGNEptmVW57OhXqOBetBmo7zuiZgd79tQhFGbXVkXs2OofPSkkA8NKkxCOlVLoeatWZjxCpoC48hWu5yDT5oI8Se4WjklTIPHTaiDXDeS8VYJ+XV1a8Ir1+h1X+ul2bM+uyvDduRHc2Cxe0UP4+zCbFgaqhraPdXG7awMBY+fj5guvfwLo8Zzc2M3rWuWkcN2y6Xm2mBVhjm0d6XCt30zvX7uHpBOL/jGhX9Wuq7pzr0Kkd1QMWQChahXHf/Q6WOdH5QeZ3etEb2Lstmk6ULptjU7XESza5qB9+v26DFwu5jY56FAJ/G5Pc9teky8UaSLrCWPfzBbksXWX56SwPh5LyPqQ5Osn0GurQ+3aX/CO7pp1xyD2WMe/3KYwMmEx1CEWWrdWIHZczIVAQmJwtyyl1OgkFnTlDqgJx6f4Rl9ejUbkzp5NB2x6W/6gtjuFRdm/4LgHV2troigmPeY+DmG0jd0B30WQ6E+aW6Fw8Iwe0UidBZXz8DF+nmzqUASwXqy90RQZtc0ogwt1dwf+QAKf4B9UhYOXxoVS2Vanx1u0gFlNAbxVF6dEgF/JRhbhr/xO2QvFxOn7MkxmJ0sLepnPa4my5Cz0o9zijVt4t6ASmbEkNGgQnC9MQbhMHpdYJQGrzwH+427NQ3H7YrbrSba2Y58ae4Og8IH6+w83qcL1WhSYct4F2FUVtcIEQ2uWITeaUl4uEtuuWW3dLCjApf1BnFc5mToDE2aOyvgu6DI83Ds7leTPQuZHCZ6psXCj5KTgOW1KIVPUiXmlq30+W0D0jBNvfDEP3bN7+6n4JAt3ZlqMbs7trtK99XcxiIvfEO3+sLuivZOmk1RzqXiqLgQPa9szF+YN6G1liNRWPT9tYvlI9InepLNM5Rn0iaxoibZzF9xXs5iJqRaN/nrQJCjOXPaVkpZvOacvLSjFRxKU0u5v+GqlpmDeq8uf8pnaGV318klxKu64SYxZAb3aKzD3tU8u6p8lGHyn///jNHbs0leWq+LBacpMyWdr06t30LFlCp7P9vsJzPifNO9lU7zDIzULHxqdDUX6z+QO/XBzEA24iWp8PrUrY0lr9Gqn+0DMM/QMkpu7++tlKYJM1yyzg0rzpZ9Fv18cleToK+1h/p/LJaKc/AhrdlP7Uc2+9lUleGwazfzQdliQ4GMObt0vN7kkS+4iLJ9Nv82mZFmSZzbyDc9t8/ZPLMH1TMcbmki5sUsl1BYcdgrT1ddf24jZAyFb++pnyNnNU+NQAnWFFvY66UXcan3hxOvmazexsjXVfq7+OAqKx9Ko0T5hG0yT80ItiH8XygqtzweHoocB4SmI/1a2vor65X9rLWwIBefgEJmmepyY/FC2MA6l3rx+EFQSHmHdvKVwOEL+8dh66boKl3xCSh8aV23SM5451zgjybopb4JUUHGQV3x7vMLU/VSvPV4jm3BPPc1aTBSVPm1kXO3yMRoE7CwStJofSUTwS96lS8tVhPr8dTLPM1YL7qZXahcOY3ckoxBOYlFWplidKTYqzGJ+8oO9ssdO3cYFH4mjI+IzWTVO4ca8bxwuQzaLOfxz8Z+AQdZD1wqvYD7KBTej4uYDOjBJ+tumhAUQGSUVxYn6gvHQ/I18qg+eED8xF+57DNYzQtXt5oHrfv4Gna/te6VZXLmhbFJyeJcFHdfFi796DwIqWOKKvASfRwFT54q5au+eYHYy7xwGjUWUc5EhQJsRJLU3goHv4EEPAo9HsMrXFbmaVff+cqh7xzNsF6NFASXjUkyuAEhvzc786mXZg9xPPKs+LxUWD+lWI1K6wVd1Y8nBojKet0dUi334TXs+oxeivqeliQcexmbYe+C/pPLgKFZSKm6vv5imgjZR9WalyL/F6CQXlRZXgDOWPi6qcF4rPLMpEnhvo+Ekxpe+fQuhJeh4O0nuhIIfVOWc3Pch1+DBZSytnJqvvvKNMXNSvs1/8W8Sv8l3zvqfEOBCB7E0i2Xen9BKJLg77x6PM3rm2BKGXAw7DXAkunegu8Doc0WpWaHXkwRmhedmeCAz+sOnfs+BqtGvHJnK8VxUDgXakS8BCUPxI7ul/DQFDQ73PabUPi+pNXh/BUUOIekqquaVdcXocCkgmQz67FJfu1oaF5VK7USLrviy1CEsv5cl/wtPKycVXZzCtbb7rtQ8GITeRgUmFn3SwckCypTmq+Z0vbbUOCIqOpsU/trMqFjRuCw4X3RL2fLzDsOHjdflg/bLj6bwdMu7rp/d62JeXkJI+dkgtf5S1hkGiYvg7CvHhBx851vu5Bt5tb9hm/lz6hZLhf46gFZJI5Qqv26vggZvJ+ufb8wbd52cORiyo3WsG9k8OTLq9UunN+AgvRFInNEMvGt7TNfSWXasFcHIpm9vbrCHCGksq+Vmy+t+1JkBnfbm9FjlLY5QEq1YKqENqpW8y/IhOQV1zTgvwaFtCaNioUfzc2/0Tsgw+xkPM6HKGxzyPNRsruKZ2G+oTthxv8PfydYLo6pQJojDi03bFZzlPydpC6PvUh7+CG7aM1Rno6nyRSCxI/LhLr8UqM7Ri+Zg3pdrMx8+IUln5YJ8FtoPvEwb8Yc5wHPNt59WC6cz9Uw++hR32WOs/KaQKk/LBesJ/SrLpjss/8sKEIlQjtHPxeaoe9PZILjHpfbfx4UIZMjD+tTXbuznuBo+Mg1zUf6f+EIf0wuaIos8TLB0zcHfok5tv8nemCfaOOOZYKXIh/p3puPtAoGO3JgWIZyZDbbjuPzZodCgdHzhb44vLVfI7/Q5vKPhQLXayK5ODI8RQky1hPHK+ajobDWH2b2Ow9s1ZRmkkgmsmNCj0/pCohxkIsRS33s4RFY6fWEs/9kKLQiEPzOw6Ye8tB/V4IOSFhF3D8bCgkb/ZFujT1EjGmuepaJs/T1uH+0rghycdbVL8i1HXM6Uhk4kSrDR1Kn5lOjCDqQDVqbA3Q9qChrv9j3Q9GN+VQ2Wms1Uul/yysEB+qZMgBze6T794FC9UUneaapeeuQsE0S5vuqmz4mEx87IKwv2nC6zetPMp8lTEikPpYWMh9MNaUymI19GOmrY2NcoZ6YCwS1hc/JxAehcExcIHIBnjj3UvY3D6Eoz2ba/IOpQvPJOUercvFT/+/wyuZ1XvZL1GLS/XZYlv/7UHjmEZWL89PZXymwyFga9b6l5rOzRuazPehWDzphMT2b5WMzNPTeb02TD7eymE/XeBOheeT91ol7QsIds7R0PuxIj4vsfgMKebJKEAajmtpnT1f1o67J5+d1zccr3swFxPPqdd/u9cIxeuTpYpaO1edOiflKj6k6GKQwdmWpHUcxba95msgr+WQ7vfn0+RBRF25Gofl/6BzwxPLZHyvO0wTWZ/vvLBUsF5r9lXTOY4VBc+w+guG6T/aN2QrznfZKic7Ckqh7DgLJDLns4o5I31/xnf5x8622whCdqRZ0j70Jib+yb3XRm68NsPjoTIT+Rnu+WI4hDl3yoviPgoJVoQ8xSxlE3CQWRuZOvQkO7nNX/KdBUUiaT543cp7YKre2JDabI3sY3u+20Juv9qYnnluO909uCEbIfTFY9qOR6K9KBWhkqcCl4t+mZi5m8NlI0ugIpbb48ojNtydZEn+3pQoGrKesSCAjs1CsmfsPhoJpq86DPySXmRaJGrZTENSWrwX0/4ZQcIHZx1nkYtCWNVBuykqpXp1zHA6XfX3O5utQ2EI67MSSEDEvdl807XAhogMvK2lS/MLr+6wblP91IemJbWNg9+9qpZ1jX9T9ypzmrxCQoNzVTEq6RytJPSMnTkx7Tn5nOPFXoOCsA/tS1YrEmLLaxha/NNb9K1BoxaghBeFPBh+Uqf0VHpBfhoLJ98hsMBr0ImYYWrKVuOIXp5h/TSrA/E/OxIletAvkdEqx++J7ceg/CoooXRlSlu73kCj+P59I84TSfCPDAAAAAElFTkSuQmCC', white: true },
  { label: 'MCLAREN',       brand: null,      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASAAAAAsCAMAAADy6JV9AAAAYFBMVEXl4Nny7OHymV/mcyrb19NmZma3t7f+z6X1to7Ozs7/3rrsgzzafUV9gYN+gnqAfn2BgX59foCAfoH//v4AAAD6ZgQWFhZVVVWDg4MlJSVJSUk2NjbExMSpqamYmJh5eXmgEqRdAAAAIHRSTlNjHP//l///9v/NrP//////////AP///////////P///1WqHukAAATCSURBVHja7ZoLc+MoDICN41ce3d07XJ42/v//8vArRliAk+3e7IyrdjpJZGz4kISkNKPfggixMr/KvmE4WIq6zq1crNzzvLmRb0AunGZE87nJ5WERfQMa4dx8NiuivD47IEKJtRwMzkIoO7vtWNP5jMg9O7lnPT7jcjkvoKyO284sp3WxoknhuZw4BpE6v38ekcvjdkZAdfjU8gE150sUs+N4bAQiZwNEDkXmpwHVJys1XsNjHexctZhNCmfnmkvRVSJZNDlVNV80D0vGEmnqW5Yt/Qz71wYl3K4mPucBVOePmQ3BCvk8mCKeBFDWNE1BSFB/y0Mp9DkAZUVqnUUeKDG++0GLmzWgVdY8uSQBZdduketOtShI+vmdK38lodvdP7+OAOoGLVm7CAfE+1KyRSXSJq7bTdhfSSjL3QKDHgKUDcxZV6sclXFXfAAQuBEA1IvB/oy/vphqm9zVDIus2lVXVEYMzujpZd8tavPPx4f49XP48ePHL/HzXyE+7Pvx1juz3wDda3oMUOdCAIAKDhS/BQjeCork/UKR7XTVZMdGsdhQImP3Boxul2cbmhwDZPxH6xC5BRCpBFcak+pNQOOujJGvQCiMgCodG8ptpSljF+jKzZMueBM6BCgr93NdVJU/XTH7Y3gyhrwNqJWWkGlRQJWMDy0piRJs2UaI5FOLzDm+4oA65M4qYFkToOhm9nAnXwI0PlaggBKrt1KQBEK9cbgj7hUGZGQbAjTsFRZQF53JbwFqe+yZFpBIjjQpQK1ZpzGmQZf8hrgSljSVoa2kBFuPwD8+6GIMEc9TAIrlkoqq/YfeUEFTgPiz1LgE+s/IZ50K2voVVQlaJfYpEqTJtYBiy4JigM8d3LCxXAZOqNKOWcS8ZEF6jUC2zq/xYHzMveaJdrjXCwpMTiqlOFer2FddxMWmarqq+k3s6wEuwrEgVjxzDQc638YPwIGkO61xTt4K5Bxzbo/g1xfZMfeaAJlAziGAtZfIk2KAukGyxC67gJ53v7JUCLIpu2tlmH/IbE4SA+azBwSHMw2df7uvhID0bk8iiSIsNUxynW8D4tANsWNhBtQ0GTkGCM5W9iaQm1QqGAtLtFYOxqA+eRS9DUgXwHJLbOAEKPovLq6OwONUdRQHpK8UAnIzkpK+ZEH6TwGSw3glunPctyB6DJB3RJUET2FbZcd4gJx5aPJKLdbBcpgvoiGgIQVIlxxIKfrpOtTF3CPlFUA9iCtsSqEMXuL4gIAdoEE6BKjfR8zdcwOAwClWBNpgKKDhHUCeey11HAKonCzEA8RhnWwP+W037UHfZXtDGf+UBIYgvWiUhOkF6mKgxyQV38nwlYC85HDdkT2gYVZ4gMxLiaKz2gMxGmbSG6BkkaK/EBB0r5UCAmht/XiA4m0FW4uFAHUHAFV4opg8AI8AYocAee4lDQ0AYk+NByhhQmELoqpNZzMBC0qZ0JcBKlSwjQTXzXoaAkQFew9QlcpmxjMzsCKi/hcX89yLu0MMTA9pGBCtOHsdkPWXjscQaUG8LXfPKyLkn7cgIbdOgf0ZvMx6E5cPaFKsTZWr4VpizQvWZxr9fN6/qymVRAZqPixtY+EP2abf27EMFzXa2PZ2W5lzO538yuo/lL+yO+68xcYAAAAASUVORK5CYII=',     white: true },
];

function renderLatestShowcase(selector) {
  const track = document.querySelector(selector);
  if (!track) return;

  const section = track.closest('.showcase');
  const dotsEl = section ? section.querySelector('[data-showcase-dots]') : null;

  track.innerHTML = SHOWCASE_BRANDS.map(b => {
    const href = b.brand ? `inventory.html?brand=${b.brand}` : 'inventory.html';
    const cls = 'brand-logo' + (b.white ? ' brand-logo--white' : '') + (b.gray ? ' brand-logo--gray' : '') + (b.wide ? ' brand-logo--wide' : '');
    const inner = b.logo
      ? `<img class="${cls}" src="${b.logo}" alt="${b.label}">`
      : `<span class="brand-logo-text">${b.label}</span>`;
    return `
      <div class="showcase-slide" data-title="${b.label}">
        <a class="showcase-card brand-card" href="${href}" aria-label="${b.label}">
          ${inner}
        </a>
      </div>`;
  }).join('');

  if (dotsEl) {
    dotsEl.innerHTML = SHOWCASE_BRANDS.map((b, i) =>
      `<button class="showcase-dot${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="${b.label}"></button>`
    ).join('');
  }
}

function initFinderReveal() {
  const sections = document.querySelectorAll('.finder, .showcase');
  if (!sections.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      e.target.classList.toggle('is-active', e.isIntersecting && e.intersectionRatio >= 0.3);
    });
  }, { threshold: [0, 0.3, 0.6] });
  sections.forEach(s => io.observe(s));
}

function initShowcase() {
  document.querySelectorAll('.showcase').forEach(section => {
    const track = section.querySelector('.showcase-track');
    if (!track) return;
    const slides = [...track.querySelectorAll('.showcase-slide')];
    const dots = [...section.querySelectorAll('.showcase-dot')];
    if (!slides.length) return;

    const setActive = (idx) => {
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          const idx = slides.indexOf(e.target);
          if (idx >= 0) setActive(idx);
        }
      });
    }, { root: track, threshold: [0.6] });
    slides.forEach(s => io.observe(s));

    dots.forEach((d, i) => d.addEventListener('click', () => {
      const s = slides[i];
      const left = s.offsetLeft - (track.clientWidth - s.clientWidth) / 2;
      track.scrollTo({ left, behavior: 'smooth' });
    }));
  });
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
