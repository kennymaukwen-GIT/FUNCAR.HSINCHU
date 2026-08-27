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

  // 客戶評價跑馬燈:自動捲動 + 可手動左右滑動/拖曳
  initReviewsMarquee();

  // Latest cars horizontal carousel arrows
  initLatestCarousel();

  // Slideshow (only after detail content is rendered)
  initSlideshows();
});

// Brand code -> display label
const BRAND_LABELS = { bmw: 'BMW', porsche: 'PORSCHE', benz: 'MERCEDES-BENZ', mini: 'MINI', other: 'OTHERS' };
// Fixed brand list / display order
const BRAND_ORDER = ['bmw', 'porsche', 'benz', 'mini', 'other'];
// 中文品牌名(SEO 用:圖片 alt、詳情頁 meta)
const BRAND_ZH = { bmw: 'BMW', porsche: '保時捷', benz: '賓士', mini: 'MINI', other: '進口車' };

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
          <img class="car-card-img" src="${firstPhoto}" alt="${car.title} ${BRAND_ZH[car.brand] || ''} 新竹外匯車" loading="lazy">
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

  // Update page title + SEO meta (dynamic, per-car)
  const brandZh = BRAND_ZH[car.brand] || '進口車';
  const hasKw = /新竹|外匯|進口|代辦/.test(car.subtitle || '');
  const region = hasKw ? '' : ' · 新竹外匯車';
  document.title = `${car.title} ${car.subtitle}${region}｜FUN CAR 貿鑫國際車業`;

  const ORIGIN = 'https://www.funcar-hsinchu.com.tw/';
  const canonUrl = `${ORIGIN}car-detail.html?id=${encodeURIComponent(car.id)}`;
  const imgAbs = ORIGIN + photoUrl(car, 0);
  const spec = car.specs || {};
  const clean = v => (v && v !== '—' && String(v).trim()) ? String(v).trim() : null;
  const specStr = [clean(spec.year) && clean(spec.year) + '年式', clean(spec.mileage), clean(spec.transmission)].filter(Boolean).join('・');
  const metaDesc = `貿鑫國際車業 FUN CAR｜${car.title} ${car.subtitle}${specStr ? '，' + specStr : ''}。新竹在地進口外匯車，提供實車照片與車況資訊，歡迎預約新竹展間賞車或線上洽詢 0922-782-597。`;

  const setMeta = (sel, attr, val) => {
    let el = document.head.querySelector(sel);
    if (!el) { el = document.createElement('meta'); const [k, v] = attr; el.setAttribute(k, v); document.head.appendChild(el); }
    el.setAttribute('content', val);
  };
  setMeta('meta[name="description"]', ['name', 'description'], metaDesc);
  setMeta('meta[property="og:description"]', ['property', 'og:description'], metaDesc);
  setMeta('meta[name="twitter:description"]', ['name', 'twitter:description'], metaDesc);
  setMeta('meta[property="og:title"]', ['property', 'og:title'], document.title);
  setMeta('meta[name="twitter:title"]', ['name', 'twitter:title'], document.title);
  setMeta('meta[property="og:url"]', ['property', 'og:url'], canonUrl);
  setMeta('meta[property="og:image"]', ['property', 'og:image'], imgAbs);
  setMeta('meta[name="twitter:image"]', ['name', 'twitter:image'], imgAbs);
  let canon = document.head.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement('link'); canon.setAttribute('rel', 'canonical'); document.head.appendChild(canon); }
  canon.setAttribute('href', canonUrl);

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
    `<div class="slide${i === 0 ? ' active' : ''}"><img src="${photoUrl(car, i)}" alt="${car.title} ${car.subtitle} ${brandZh}新竹外匯車 實車照片 ${i+1}"></div>`
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
// 品牌 logo 的中文 SEO 替代文字(alt / aria-label 用;不影響畫面與 data-title 配色)
const BRAND_SEO_ALT = {
  'MINI': 'MINI 外匯車代辦',
  'PORSCHE': '保時捷 Porsche 客製化尋車',
  'MERCEDES-BENZ': '賓士 Mercedes-AMG 進口外匯車',
  'BMW': 'BMW 進口外匯車',
  'BENTLEY': 'Bentley 賓利進口車',
  'ROLLS-ROYCE': 'Rolls-Royce 勞斯萊斯進口車',
  'FERRARI': 'Ferrari 法拉利進口車',
  'LAMBORGHINI': 'Lamborghini 藍寶堅尼進口車',
  'MCLAREN': 'McLaren 麥拉倫進口車',
};

const SHOWCASE_BRANDS = [
  { label: 'MINI',          brand: 'mini',    logo: 'data:image/png;base64,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',        white: true },
  { label: 'PORSCHE',       brand: 'porsche', logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAAVCAMAAADLoSOWAAABWGlDQ1BJQ0MgUHJvZmlsZQAAeJx9kLFLw1AQxr9WpaB1EB0cHDKJQ5SSCro4tBVEcQhVweqUvqapkMZHkiIFN/+Bgv+BCs5uFoc6OjgIopPo5uSk4KLleS+JpCJ6j+N+fO+74zggOW5wbvcDqDu+W1zKK5ulLSX1jAS9IAzm8Zyur0r+rj/j/T703k7LWb///43Biukxqp+UGcZdH0ioxPqezyXvE4+5tBRxS7IV8onkcsjngWe9WCC+JlZYzagQvxCr5R7d6uG63WDRDnL7tOlsrMk5lBNYxA48cNgw0IQCHdk//LOBv4BdcjfhUp+FGnzqyZEiJ5jEy3DAMAOVWEOGUpN3ju53F91PjbWDJ2ChI4S4iLWVDnA2Rydrx9rUPDAyBFy1ueEagdRHmaxWgddTYLgEjN5Qz7ZXzWrh9uk8MPAoxNskkDoEui0hPo6E6B5T8wNw6XwBA6diE8HYWhMAAABgUExURf///wAAAP///////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACTZXvoAAAAgdFJOU/0ABFCqNG7OkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbmcw7AAAAj9JREFUeNrVmdGWwyAIRCMo8v9fvDGmxtgNjNnm9Ow89YGiXimOdomLr5gChVUUkhuuVGIpKJA3yytvYH8eugUjc1jWvPsMuI7wrnWaWyi1T8iEoahUCSQkIVGZQITybrTWL0BbVufAQKgWWLENYMFKn4eVCwBKUGxZFAqrzhUqwz0vgXswAyt9FlapVgoCA4BhcYmd2QT5OqzIJ0kvPRZVwSqP+i02enklt1ipDWwTXyodFRvZFt2BxZ7Ssk/ZkLa9yrUfGIpnWGZemYg9lhjrCtFIoWudYWU/Z4VlpSTZfwM7LLZi+QzAz3tUbCJPHSw/tG0BXeIcYLnj0w7LSFlTdbCsWB6rBYpVt2Krv+gqi/5eWemJyuL7sMDKqk07x7O0qbQyCnQH1pIvtQw9axz/XUDPknPPmqssqGdB9o0D3YGFeJe50zCLoeE0nIEVjbTt5ER9VncafhUW4LPoDiyQAJGixvg/wJJtVz8Pi9ulU0qPumoWeTC7OKzrRqRxgOW2LMVgae0Xn4YV6ZXLWTsNZnfiNPSSzp+Gdu3FbZYB8VkyBSsnqot2HU48X2JwnzVhSlGfpe7IocGSCQd/PVXO7YUCUR4rC3bw8HUH91n2uPv2v+6Gl/e3t7uhYR2od8PJFuvQs9T5wr27YfIEmFKaPF+6RRl5a3vbah99T8JfPh59deBASGHzMvmeZV6jcgOLwdLqMv4JLPCtuHspNWFp+8nSguYFd+wpWBGGVbZV8tQbvG8zBIWlhP8P8BSsH7aZHs4ZEyTrAAAAAElFTkSuQmCC',     white: false, wide: true },
  { label: 'MERCEDES-BENZ', brand: 'benz',    logo: 'data:image/png;base64,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',        white: false },
  { label: 'BMW',           brand: 'bmw',     logo: 'data:image/png;base64,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',         white: true },
  { label: 'BENTLEY',       brand: null,      logo: 'data:image/png;base64,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',     white: true },
  { label: 'ROLLS-ROYCE',   brand: null,      logo: 'data:image/png;base64,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', white: false },
  { label: 'FERRARI',       brand: null,      logo: 'data:image/png;base64,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',     white: true },
  { label: 'LAMBORGHINI',   brand: null,      logo: 'data:image/png;base64,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', white: true },
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
    const label = BRAND_SEO_ALT[b.label] || b.label;
    const inner = b.logo
      ? `<img class="${cls}" src="${b.logo}" alt="${label}">`
      : `<span class="brand-logo-text">${b.label}</span>`;
    return `
      <div class="showcase-slide" data-title="${b.label}">
        <a class="showcase-card brand-card" href="${href}" aria-label="${label}">
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
  sections.forEach(s => { if (!s.hasAttribute('data-no-reveal')) io.observe(s); });
}

function initReviewsMarquee() {
  document.querySelectorAll('.reviews-marquee-wrapper').forEach(wrap => {
    const track = wrap.querySelector('.reviews-marquee-track');
    if (!track) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const half = () => track.scrollWidth / 2;
    let paused = reduce;
    let idleTimer;
    let last = performance.now();

    // 自動推進(原生 scrollLeft),到一半時無縫跳回起點
    function tick(now) {
      const dt = Math.min(now - last, 50); last = now;
      if (!paused) {
        wrap.scrollLeft += dt * 0.045;               // 約 45px/秒
        if (wrap.scrollLeft >= half()) wrap.scrollLeft -= half();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // 手動捲動時也維持無縫循環
    wrap.addEventListener('scroll', () => {
      const h = half();
      if (wrap.scrollLeft >= h) wrap.scrollLeft -= h;
    }, { passive: true });

    const pause = () => { paused = true; clearTimeout(idleTimer); };
    const resumeLater = () => {
      if (reduce) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { paused = false; last = performance.now(); }, 1800);
    };

    wrap.addEventListener('mouseenter', pause);
    wrap.addEventListener('mouseleave', resumeLater);
    wrap.addEventListener('wheel', () => { pause(); resumeLater(); }, { passive: true });

    // 滑鼠拖曳(觸控裝置用原生捲動,不需這段)
    let dragging = false, startX = 0, startScroll = 0;
    wrap.addEventListener('pointerdown', (e) => {
      pause();
      if (e.pointerType === 'mouse') {
        dragging = true; startX = e.clientX; startScroll = wrap.scrollLeft;
        wrap.classList.add('is-dragging');
        try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
      }
    });
    wrap.addEventListener('pointermove', (e) => {
      if (dragging && e.pointerType === 'mouse') {
        wrap.scrollLeft = startScroll - (e.clientX - startX);
      }
    });
    const endDrag = () => { dragging = false; wrap.classList.remove('is-dragging'); resumeLater(); };
    wrap.addEventListener('pointerup', endDrag);
    wrap.addEventListener('pointercancel', endDrag);
    wrap.addEventListener('touchend', resumeLater, { passive: true });
  });
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
