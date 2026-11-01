// SSG 預渲染:把 JS 動態內容烤進 HTML(供第一波抓取與不執行 JS 的 AI 爬蟲)。
// 改完 js/cars.js 後執行一次:node build-seo.js
// 產出:各列表頁車卡、cars/<id>.html 車輛靜態頁、關於我們的公司資料表、
//       sitemap.xml、llms.txt、inventory.json。可重複執行(idempotent)。
const fs = require('fs');

function loadArray(src, name){
  const m = src.match(new RegExp('const\\s+'+name+'\\s*=\\s*(\\[[\\s\\S]*?\\n\\];)'));
  if(!m) throw new Error('找不到 '+name);
  return eval(m[1]);
}
const CARS = loadArray(fs.readFileSync('js/cars.js','utf8'), 'CARS');
const SHOWCASE_BRANDS = loadArray(fs.readFileSync('js/main.js','utf8'), 'SHOWCASE_BRANDS');

const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const photoUrl = (car,i) => 'images/'+encodeURIComponent(car.folder).replace(/%2F/g,'/')+'/'+encodeURIComponent(car.photos[i]);
const byStatus = s => CARS.filter(c => c.status === s);
const carUrl = car => 'cars/' + car.id + '.html';

const BRAND_ZH = { bmw: 'BMW', porsche: '保時捷', benz: '賓士', mini: 'MINI', other: '進口車' };
function carCard(car){
  const href = carUrl(car);
  const alt = `${car.title} ${BRAND_ZH[car.brand]||''} 新竹外匯車`;
  const mi = car.specs && car.specs.mileage;
  const miText = (mi && mi !== '—') ? mi : '洽詢';
  const priceText = car.status==='sold' ? '<strong>成交</strong>'
    : car.status==='coming' ? '價格：<strong>接受預訂</strong>'
    : `價格：<strong>${car.price && car.price!=='電洽' ? esc(car.price) : '電洽'}</strong>`;
  const titleFull = car.title + (car.subtitle ? ' ' + car.subtitle : '');
  const link = true;   // 每台車（含已售）都有靜態內頁
  const open = link ? `<a href="${href}" class="car-card"` : `<div class="car-card"`;
  const close = link ? '</a>' : '</div>';
  return `
      ${open} data-brand="${esc(car.brand)}">
        <img class="car-card-img" src="${photoUrl(car,0)}" alt="${esc(alt)}" loading="lazy">
        <div class="car-card-overlay">
          <div class="car-card-title">${esc(titleFull)}</div>
          <div class="car-card-info">
            <span>里程：<strong>${esc(miText)}</strong></span>
            <span>${priceText}</span>
          </div>
        </div>
      ${close}`;
}
const grid = status => byStatus(status).map(carCard).join('') + '\n    ';

// ============================================================
// 車款購買指南：每個車系一頁，在店車、成交紀錄自動帶入
// 新增指南時在這裡加一筆，test 決定哪些車屬於這個車系
// ============================================================
const nameOf = c => (c.title + ' ' + (c.subtitle || '')).toUpperCase();
const GUIDES = [
  { file: 'mini-clubman-jcw-guide.html', label: 'MINI Clubman JCW 購買指南', blurb: '第二代 Clubman（F54）歷年改款、JCW 與 Cooper S、末代 Untold Edition、看車重點', test: c => c.brand === 'mini' && /CLUBMAN/.test(nameOf(c)) },
  { file: 'mini-jcw-guide.html', label: 'MINI JCW 車系購買指南', blurb: 'JCW Hatch、Cabrio、Countryman 新舊世代差異、JCW 與 Cooper S、看車重點', test: c => c.brand === 'mini' && !/CLUBMAN/.test(nameOf(c)) },
  { file: 'mercedes-glc-guide.html', label: '賓士 GLC／AMG GLC 43 購買指南', blurb: 'GLC 300 與 AMG GLC 43、SUV 與 Coupe、新舊世代差異、看車重點', test: c => c.brand === 'benz' && /GLC/.test(nameOf(c)) },
  { file: 'mercedes-gle-guide.html', label: '賓士 GLE 450／AMG GLE 53 購買指南', blurb: 'GLE 450 與 AMG GLE 53、SUV 與 Coupe、小改款差異、看車重點', test: c => c.brand === 'benz' && /GLE/.test(nameOf(c)) },
  { file: 'mercedes-glb-guide.html', label: '賓士 GLB 250／AMG GLB 35 購買指南', blurb: 'GLB 250 與 AMG GLB 35、七人座、小改款差異、看車重點', test: c => c.brand === 'benz' && /GLB/.test(nameOf(c)) },
  { file: 'mercedes-amg-gt-4door-guide.html', label: 'Mercedes-AMG GT 四門跑車購買指南', blurb: 'AMG GT 43 與 GT 53 四門跑車、小改款差異、看車重點', test: c => c.brand === 'benz' && /\bGT\s?\d{2}\b/.test(nameOf(c)) },
  { file: 'mercedes-e-class-guide.html', label: '賓士 E-Class E200／AMG E53 購買指南', blurb: 'W213 與 W214 世代差異、E 200 與 AMG E 53、看車重點', test: c => c.brand === 'benz' && /\bE\s?(200|220|250|300|350|450|43|53|63)\b/.test(nameOf(c)) },
  { file: 'mercedes-c-coupe-guide.html', label: '賓士 C-Class Coupe 購買指南', blurb: 'C 180／C 200／C 300 Coupe、AMG Line 與 AMG 車型差異、小改款、看車重點', test: c => c.brand === 'benz' && /\bC\s?\d{2,3}\b/.test(nameOf(c)) && /COUPE/.test(nameOf(c)) },
  { file: 'mercedes-amg-cla45-guide.html', label: 'Mercedes-AMG CLA 45 S 購買指南', blurb: 'CLA 45 與 CLA 45 S、M139 引擎、小改款差異、看車重點', test: c => c.brand === 'benz' && /CLA/.test(nameOf(c)) },
  { file: 'porsche-macan-guide.html', label: '保時捷 Macan 購買指南', blurb: 'Macan、Macan S、GTS 三個階段的差異、選配與看車重點', test: c => c.brand === 'porsche' && /MACAN/.test(nameOf(c)) },
  { file: 'porsche-718-guide.html', label: '保時捷 718 Boxster／Cayman 購買指南', blurb: '718 Boxster 與 Cayman、S 與 GTS 4.0、手排與 PDK、看車重點', test: c => c.brand === 'porsche' && /718/.test(nameOf(c)) },
];
const guideOf = c => GUIDES.find(g => g.test(c));
const guideCars = (g, statuses) => CARS.filter(c => statuses.includes(c.status) && g.test(c));
const guideGrid = (g, statuses) => guideCars(g, statuses).map(carCard).join('') + '\n    ';
// 沒有車的區塊加上 hidden，有車時拿掉
function toggleSection(file, id, hide) {
  if (!fs.existsSync(file)) return;
  let s = fs.readFileSync(file, 'utf8');
  const re = new RegExp('<section class="guide-section" id="' + id + '"( hidden)?>');
  if (!re.test(s)) return;
  s = s.replace(re, `<section class="guide-section" id="${id}"${hide ? ' hidden' : ''}>`);
  fs.writeFileSync(file, s);
}
function bakeGuides() {
  for (const g of GUIDES) {
    if (!fs.existsSync(g.file)) { console.log('  SKIP (檔案不存在):', g.file); continue; }
    const live = guideCars(g, ['in-stock', 'coming']), sold = guideCars(g, ['sold']);
    inject(g.file, 'data-ssg="guide-in-stock"', live.length ? guideGrid(g, ['in-stock', 'coming'])
      : `\n      <p class="calc-empty" style="grid-column:1/-1;">目前在店沒有這個車系的現車。可以委託我們代尋，或先看看<a href="inventory.html">其他在店車款</a>。</p>\n    `);
    inject(g.file, 'data-ssg="guide-sold"', guideGrid(g, ['sold']));
    toggleSection(g.file, 'sold', !sold.length);
  }
}
const guideList = () => GUIDES.filter(g => fs.existsSync(g.file)).map(g => {
  const live = guideCars(g, ['in-stock', 'coming']).length, sold = guideCars(g, ['sold']).length;
  const counts = [live ? `在店與即將到港 ${live} 台` : '目前無現車，可代尋', sold ? `成交紀錄 ${sold} 台` : ''].filter(Boolean).join('・');
  return `
        <a class="guide-card" href="${g.file}">
          <span class="guide-card-title">${esc(g.label)}</span>
          <span class="guide-card-blurb">${esc(g.blurb)}</span>
          <span class="guide-card-meta">${counts}</span>
        </a>`;
}).join('') + '\n      ';

// 英文頁（en/）用的車卡：頁面有 <base href="../">，連結與照片路徑和中文頁相同
function enCard(car){
  const mi = car.specs && car.specs.mileage;
  const miText = !mi || mi === '—' || mi === '洽詢' ? 'Ask us' : mi === '全新' ? 'New' : mi.replace(/\s*公里/, ' km');
  const priceText = car.status === 'sold' ? '<strong>Sold</strong>'
    : car.status === 'coming' ? 'Price: <strong>Pre-order</strong>'
    : `Price: <strong>${car.price && car.price !== '電洽' ? esc(car.price) : 'Call us'}</strong>`;
  const titleFull = car.title + (car.subtitle ? ' ' + car.subtitle : '');
  return `
      <a href="${carUrl(car)}" class="car-card" data-brand="${esc(car.brand)}" hreflang="zh-TW">
        <img class="car-card-img" src="${photoUrl(car,0)}" alt="${esc(titleFull)} for sale in Hsinchu, Taiwan" loading="lazy">
        <div class="car-card-overlay">
          <div class="car-card-title">${esc(titleFull)}</div>
          <div class="car-card-info">
            <span>Mileage: <strong>${esc(miText)}</strong></span>
            <span>${priceText}</span>
          </div>
        </div>
      </a>`;
}
const enGrid = status => byStatus(status).map(enCard).join('') + '\n    ';

const BRAND_SEO_ALT = {
  'MINI': 'MINI 外匯車進口',
  'PORSCHE': '保時捷 Porsche 客製化尋車',
  'MERCEDES-BENZ': '賓士 Mercedes-AMG 進口外匯車',
  'BMW': 'BMW 進口外匯車',
  'BENTLEY': 'Bentley 賓利進口車',
  'ROLLS-ROYCE': 'Rolls-Royce 勞斯萊斯進口車',
  'FERRARI': 'Ferrari 法拉利進口車',
  'LAMBORGHINI': 'Lamborghini 藍寶堅尼進口車',
  'MCLAREN': 'McLaren 麥拉倫進口車',
};
const brandCards = () => SHOWCASE_BRANDS.map(b => {
  const href = b.brand ? `inventory.html?brand=${b.brand}` : 'inventory.html';
  const alt = BRAND_SEO_ALT[b.label] || b.label;
  return `
      <div class="showcase-slide" data-title="${esc(b.label)}">
        <a class="showcase-card brand-card" href="${href}" aria-label="${esc(alt)}"><span class="brand-logo-text">${esc(b.label)}</span></a>
      </div>`;
}).join('') + '\n  ';
const brandDots = () => SHOWCASE_BRANDS.map((b,i)=>`<button class="showcase-dot${i===0?' active':''}" data-idx="${i}" aria-label="${esc(b.label)}"></button>`).join('');

function inject(file, attr, content){
  let s = fs.readFileSync(file,'utf8');
  const A = attr.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re = new RegExp('(<(\\w+)[^>]*'+A+'[^>]*>)(?:<!--ssg-->[\\s\\S]*?<!--\\/ssg-->)?\\s*(<\\/\\2>)');
  if(!re.test(s)){ console.log('  SKIP (容器找不到):', file, attr); return; }
  s = s.replace(re, `$1<!--ssg-->${content}<!--/ssg-->$3`);
  fs.writeFileSync(file, s);
  console.log('  baked', file.padEnd(16), attr);
}

// ============================================================
// 共用資料
// ============================================================
const SITE = 'https://www.funcar-hsinchu.com.tw/';
const TODAY = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' });   // YYYY-MM-DD
const DEALER = {
  name: 'FUN CAR 貿鑫國際車業',
  legalName: '貿鑫國際有限公司',
  taxID: '85122378',
  founded: '2019 年 7 月',
  phone: '0922-782-597',
  tel: '0922782597',
  email: 'michelle@maukwen.com.tw',
  address: '新竹市北區吉羊路22巷55之3號',
  hours: '週一至週日 06:00–23:00',
  googleMaps: 'https://maps.app.goo.gl/r1JD8GTU861ZrX2D7',
  googleRating: '5.0',          // Google 商家評分，變動時更新這三行
  googleReviews: 125,
  googleAsOf: '2026 年 11 月',
  site8891: 'https://www.8891.com.tw/findBuz-info-10987.html',
  facebook: 'https://www.facebook.com/p/FUN-CAR-%E8%B2%BF%E9%91%AB%E5%9C%8B%E9%9A%9B%E8%BB%8A%E6%A5%AD-100063469527149/',
  instagram: 'https://www.instagram.com/fun_car_hsinchu88/',
};
const BRAND_EN = { bmw: 'BMW', porsche: 'Porsche', benz: 'Mercedes-Benz', mini: 'MINI', other: '' };
const STATUS = {
  'in-stock': { label: '在店車款', page: 'inventory.html', state: '在店現車', price: c => (c.price && c.price !== '電洽' ? c.price : '電洽') },
  'coming':   { label: '即將到港', page: 'incoming.html',  state: '即將到港', price: () => '接受預訂' },
  'sold':     { label: '已售車款', page: 'sold.html',      state: '已售出',   price: () => '已成交' },
};
const clean = v => (v != null && v !== '—' && String(v).trim()) ? String(v).trim() : null;
const fullName = c => c.title + (c.subtitle ? ' ' + c.subtitle : '');
const absPhoto = (c, i) => SITE + photoUrl(c, i);
const mileageNum = c => { const m = clean(c.specs.mileage); const n = m && m.replace(/[^\d]/g, ''); return n ? Number(n) : null; };

function carFacts(c) {
  const sp = c.specs || {};
  const f = [];
  if (clean(sp.year)) f.push(`${sp.year} 年式`);
  if (clean(sp.exteriorColor)) f.push(`外觀${sp.exteriorColor}`);
  const mi = clean(sp.mileage);
  if (mi && mi !== '洽詢') f.push(mi === '全新' ? '里程全新' : `里程 ${mi}`);
  if (clean(sp.origin)) f.push(`${sp.origin}車源`);
  if (clean(sp.transmission) && sp.transmission !== '自排') f.push(`${sp.transmission} 變速箱`);
  return f;
}

// ============================================================
// 車輛靜態頁 cars/<id>.html
// ============================================================
function carDescription(c) {
  const f = carFacts(c);
  const base = `${fullName(c)}${f.length ? '，' + f.slice(0, 3).join('、') : ''}`;
  if (c.status === 'sold') return `${base}。FUN CAR 貿鑫國際車業成交紀錄，新竹在地進口外匯車商，可委託客製代尋同款車。`;
  if (c.status === 'coming') return `${base}，即將到港、接受預訂。FUN CAR 貿鑫國際車業，新竹在地進口外匯車商。`;
  return `${base}，新竹展間現車。FUN CAR 貿鑫國際車業，實車照片與規格一次看，歡迎預約賞車。`;
}
function carTitle(c) {
  const tail = c.status === 'sold' ? '成交紀錄' : c.status === 'coming' ? '即將到港接受預訂' : '新竹外匯車現車';
  return `${fullName(c)}｜${tail}－FUN CAR 貿鑫國際車業`;
}

function relatedCars(c) {
  const pool = CARS.filter(x => x.id !== c.id && x.status !== 'sold');
  const same = pool.filter(x => x.brand === c.brand);
  const rest = pool.filter(x => x.brand !== c.brand);
  return [...same, ...rest].slice(0, 4);
}

function carBody(c) {
  const st = STATUS[c.status];
  const brandZh = BRAND_ZH[c.brand] || '進口車';
  const name = fullName(c);
  const slides = c.photos.map((_, i) =>
    `<div class="slide${i === 0 ? ' active' : ''}"><img src="${photoUrl(c, i)}" alt="${esc(name)} ${brandZh}新竹外匯車 實車照片 ${i + 1}"${i ? ' loading="lazy"' : ''}></div>`).join('');
  const dots = c.photos.map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}"></span>`).join('');
  const thumbs = c.photos.map((_, i) => `<div class="thumbnail${i === 0 ? ' active' : ''}"><img src="${photoUrl(c, i)}" alt="" loading="lazy"></div>`).join('');
  const fb = c.fbUrl ? `\n    <div class="detail-fb"><a href="${esc(c.fbUrl)}" target="_blank" rel="noopener" class="btn btn-outline">看更多實拍（Facebook）</a></div>` : '';

  const f = carFacts(c);
  const lead = `${name}${f.length ? '，' + f.join('、') : ''}`;
  const intro = c.status === 'sold'
    ? `${lead}，已由 FUN CAR 貿鑫國際車業完成交車，本頁保留為成交紀錄。想找同款或相近規格，可委託我們從海外客製代尋。`
    : c.status === 'coming'
    ? `${lead}，即將到港，現正接受預訂。到港前可先來電洽詢規格、預訂方式與交車時程。`
    : `${lead}，目前在 FUN CAR 貿鑫國際車業新竹展間現車展示，歡迎預約賞車或來電 ${DEALER.phone} 洽詢價格。`;
  const trust = '貿鑫每輛進口車都提供第三方車況鑑定履歷，由 Goo 官方鑑定專員在店實車鑑定；美規車款另附 CARFAX 車輛歷史報告。';

  const sp = c.specs || {};
  const v = x => esc(clean(x) || '洽詢');
  const rows = [
    ['車輛年份', v(sp.year)], ['車輛型號', esc(name)], ['外觀顏色', v(sp.exteriorColor)], ['里程數', v(sp.mileage)],
    ['變速箱', v(sp.transmission)], ['燃料', v(sp.fuel)], ['車源', v(sp.origin)], ['所在地', v(sp.location)],
    ['車輛狀態', st.state], [c.status === 'in-stock' ? '價格' : '狀態說明', esc(st.price(c))],
  ].map(([k, val]) => `        <div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${val}</span></div>`).join('\n');

  const cta = c.status === 'sold'
    ? `<a href="import-guide.html" class="btn btn-primary">委託客製代尋</a><a href="tel:${DEALER.tel}" class="btn btn-outline">來電洽詢 ${DEALER.phone}</a>`
    : `<a href="tel:${DEALER.tel}" class="btn btn-primary">來電洽詢 ${DEALER.phone}</a><a href="contact.html" class="btn btn-outline">預約賞車</a>`;

  const rel = relatedCars(c);
  const relHtml = rel.length ? `
    <section class="detail-related">
      <h2>${rel.some(x => x.brand === c.brand) ? `其他${spaced(BRAND_LABEL_ZH(c.brand))}與在店車款` : '其他在店車款'}</h2>
      <div class="car-grid">${rel.map(carCard).join('')}
      </div>
    </section>` : '';

  return `
    <div class="detail-breadcrumb">
      <a href="index.html">首頁</a> / <a href="${st.page}">${st.label}</a> / ${esc(c.title)}
    </div>
    <h1 class="detail-title">${esc(name)}</h1>

    <div class="detail-media">
      <div class="slideshow">
        <div class="slideshow-slides">${slides}</div>
        <div class="slideshow-dots">${dots}</div>
      </div>
      <div class="thumbnails">${thumbs}</div>
    </div>${fb}

    <section class="detail-intro">
      <h2>車輛介紹</h2>
      <p>${esc(intro)}</p>
      <p>${trust}</p>${guideOf(c) && fs.existsSync(guideOf(c).file) ? `
      <p>想比較這個車系的年式、車型差異與看車重點，請看 <a href="${guideOf(c).file}">${esc(guideOf(c).label)}</a>。</p>` : ''}
    </section>

    <div class="detail-specs">
      <div class="section-eyebrow" style="margin-bottom: 12px;">SPECIFICATIONS</div>
      <h2 style="font-weight: 200; font-size: 36px;">車輛<strong style="font-weight:600;">規格</strong></h2>
      <div class="spec-list">
${rows}
      </div>
    </div>

    <div class="detail-cta">${cta}</div>
${relHtml}
  `;
}
function spaced(t) { return /^[A-Za-z]/.test(t) ? ` ${t} ` : t; }
function BRAND_LABEL_ZH(b) { return ({ benz: '賓士', porsche: '保時捷', mini: 'MINI', bmw: 'BMW' })[b] || '進口車'; }

function carJsonLd(c) {
  const url = SITE + carUrl(c);
  const sp = c.specs || {};
  const car = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    '@id': url + '#car',
    name: fullName(c),
    url,
    description: carDescription(c),
    image: c.photos.slice(0, 10).map((_, i) => absPhoto(c, i)),
  };
  if (BRAND_EN[c.brand]) car.brand = { '@type': 'Brand', name: BRAND_EN[c.brand] };
  if (/^\d{4}$/.test(clean(sp.year) || '')) car.vehicleModelDate = sp.year;
  const mi = mileageNum(c);
  if (mi) car.mileageFromOdometer = { '@type': 'QuantitativeValue', value: mi, unitCode: 'KMT' };
  if (clean(sp.exteriorColor)) car.color = sp.exteriorColor;
  if (clean(sp.transmission)) car.vehicleTransmission = sp.transmission;
  if (clean(sp.fuel)) car.fuelType = sp.fuel;
  const priceNum = c.status === 'in-stock' && c.price && /\d/.test(c.price) ? Number(c.price.replace(/[^\d]/g, '')) : null;
  if (priceNum) car.offers = { '@type': 'Offer', price: priceNum, priceCurrency: 'TWD', availability: 'https://schema.org/InStock', seller: { '@id': SITE + '#dealer' } };
  const st = STATUS[c.status];
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: SITE },
      { '@type': 'ListItem', position: 2, name: st.label, item: SITE + st.page },
      { '@type': 'ListItem', position: 3, name: fullName(c), item: url },
    ],
  };
  return [car, crumbs].map(j => `  <script type="application/ld+json">\n${JSON.stringify(j, null, 2)}\n  </script>`).join('\n');
}

function buildCarPages() {
  const tpl = fs.readFileSync('car-detail.html', 'utf8');
  if (!tpl.includes('<div class="detail-wrap" data-car-detail></div>')) throw new Error('car-detail.html 模板缺少 data-car-detail 容器');
  fs.mkdirSync('cars', { recursive: true });
  for (const f of fs.readdirSync('cars')) if (f.endsWith('.html')) fs.unlinkSync('cars/' + f);   // 移除已刪除車輛的舊頁
  for (const c of CARS) {
    const url = SITE + carUrl(c);
    const title = carTitle(c), desc = carDescription(c), img = absPhoto(c, 0);
    const head = `  <!-- SEO metadata (auto) -->
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="icon" href="images/logo.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="FUN CAR 貿鑫國際車業">
  <meta property="og:locale" content="zh_TW">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${img}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${img}">
${carJsonLd(c)}
  <!-- /SEO -->`;
    let html = tpl
      .replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n<base href="../">')
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/  <!-- SEO metadata \(auto\) -->[\s\S]*?<!-- \/SEO -->/, head)
      .replace('<div class="detail-wrap" data-car-detail></div>', `<div class="detail-wrap" data-car-detail data-static data-car-id="${c.id}">${carBody(c)}</div>`);
    fs.writeFileSync(carUrl(c), html);
  }
  console.log('  built   cars/*.html      ', CARS.length, '頁');
}

// ============================================================
// 關於我們：公司資料一覽
// ============================================================
function factCard() {
  const rows = [
    ['公司登記名稱', DEALER.legalName],
    ['品牌名稱', DEALER.name],
    ['統一編號', DEALER.taxID],
    ['公司設立', DEALER.founded],
    ['展間地址', DEALER.address],
    ['聯絡電話', `<a href="tel:${DEALER.tel}">${DEALER.phone}</a>`],
    ['營業時間', DEALER.hours],
    ['服務項目', '外匯車進口引進、在店現車買賣、二手車估價收購、專員到府收車'],
    ['服務地區', '新竹市、竹北、新竹科學園區周邊，全台可跨區服務'],
    ['主力品牌', 'MINI、Mercedes-Benz／Mercedes-AMG、Porsche'],
    ['車況鑑定', 'Goo 官方鑑定專員在店實車鑑定；美規車款附 CARFAX 車輛歷史報告'],
    ['購車保障', '實車實價、第三方權威鑑定認證、無重大事故泡水保證、完整售後保固服務'],
    ['Google 評論', `${DEALER.googleRating} 星，共 ${DEALER.googleReviews} 則評論（${DEALER.googleAsOf}）・<a href="${DEALER.googleMaps}" target="_blank" rel="noopener">在 Google 地圖查看</a>`],
    ['8891 商家頁', `<a href="${DEALER.site8891}" target="_blank" rel="noopener">貿鑫國際有限公司</a>`],
  ];
  return `
    <table class="fact-table">
      <tbody>
${rows.map(([k, v]) => `        <tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('\n')}
      </tbody>
    </table>
  `;
}

// ============================================================
// sitemap.xml / inventory.json / llms.txt
// ============================================================
const STATIC_PAGES = [
  ['', '1.0'], ['inventory.html', '0.9'], ['incoming.html', '0.8'], ['import-guide.html', '0.9'], ['services.html', '0.8'],
  ['sold.html', '0.7'], ['about.html', '0.7'], ['maintenance.html', '0.5'], ['contact.html', '0.6'],
  ['import-tax-calculator.html', '0.8'], ['guides.html', '0.8'],
  ...GUIDES.filter(g => fs.existsSync(g.file)).map(g => [g.file, '0.8']),
  ['en/', '0.8'], ['en/buying-a-car-in-taiwan.html', '0.8'],
];
function buildSitemap() {
  const xmlEsc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const urls = STATIC_PAGES.map(([p, pr]) => `  <url>\n    <loc>${SITE}${p}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <priority>${pr}</priority>\n  </url>`);
  for (const c of CARS) {
    const imgs = c.photos.slice(0, 5).map((_, i) => `    <image:image><image:loc>${absPhoto(c, i)}</image:loc></image:image>`).join('\n');
    const pr = c.status === 'sold' ? '0.5' : '0.7';
    urls.push(`  <url>\n    <loc>${SITE}${carUrl(c)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <priority>${pr}</priority>\n${imgs}\n  </url>`);
  }
  fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`);
  console.log('  built   sitemap.xml      ', urls.length, '個網址');
}

function buildInventoryJson() {
  const data = {
    updated: TODAY,
    dealer: {
      name: DEALER.name, legalName: DEALER.legalName, taxID: DEALER.taxID, url: SITE,
      telephone: DEALER.phone, email: DEALER.email, address: DEALER.address, openingHours: DEALER.hours,
      googleMaps: DEALER.googleMaps, site8891: DEALER.site8891,
      googleRating: { ratingValue: Number(DEALER.googleRating), reviewCount: DEALER.googleReviews, asOf: DEALER.googleAsOf },
    },
    statusLegend: { 'in-stock': '在店現車', coming: '即將到港，接受預訂', sold: '已售出，保留為成交紀錄' },
    priceNote: '價格為「電洽」的車輛請來電洽詢。',
    cars: CARS.map(c => {
      const sp = c.specs || {};
      return {
        id: c.id, url: SITE + carUrl(c), status: c.status, brand: BRAND_EN[c.brand] || null, name: fullName(c),
        year: clean(sp.year), mileage: clean(sp.mileage), mileageKm: mileageNum(c), exteriorColor: clean(sp.exteriorColor),
        transmission: clean(sp.transmission), fuel: clean(sp.fuel), origin: clean(sp.origin), location: clean(sp.location),
        price: STATUS[c.status].price(c), images: c.photos.map((_, i) => absPhoto(c, i)),
      };
    }),
  };
  fs.writeFileSync('inventory.json', JSON.stringify(data, null, 2) + '\n');
  console.log('  built   inventory.json   ', CARS.length, '台');
}

function buildLlmsTxt() {
  const line = c => {
    const f = carFacts(c);
    return `- [${fullName(c)}](${SITE}${carUrl(c)})${f.length ? '：' + f.join('、') : ''}`;
  };
  const sec = (title, s) => byStatus(s).length ? `## ${title}（${byStatus(s).length} 台）\n\n${byStatus(s).map(line).join('\n')}\n` : '';
  const txt = `# FUN CAR 貿鑫國際車業

> 新竹在地進口外匯車商。公司登記名稱貿鑫國際有限公司，統一編號 ${DEALER.taxID}，${DEALER.founded}設立。專營外匯車進口引進、在店現車買賣、二手車估價收購，主力品牌為 MINI、Mercedes-Benz／Mercedes-AMG、Porsche。每輛車提供 Goo 官方在店鑑定，美規車款另附 CARFAX 車輛歷史報告。Google 商家評分 ${DEALER.googleRating} 星，共 ${DEALER.googleReviews} 則評論。

## 公司資料

- 展間地址：${DEALER.address}
- 電話：${DEALER.phone}
- Email：${DEALER.email}
- 營業時間：${DEALER.hours}
- Google 商家評分：${DEALER.googleRating} 星，共 ${DEALER.googleReviews} 則評論（${DEALER.googleAsOf}）
- Google 地圖與評論：${DEALER.googleMaps}
- 8891 商家頁：${DEALER.site8891}
- Facebook：${DEALER.facebook}
- Instagram：${DEALER.instagram}

## 主要頁面

- [在店車款](${SITE}inventory.html)：目前在新竹展間的現車
- [即將到港](${SITE}incoming.html)：已訂購、即將到台的車款，接受預訂
- [已售車款](${SITE}sold.html)：歷年成交紀錄
- [外匯車進口全攻略](${SITE}import-guide.html)：進口流程、費用組成、時程與常見問題
- [外匯車進口稅費試算器](${SITE}import-tax-calculator.html)：依官方稅率試算關稅、貨物稅、營業稅，附公式、試算範例、奢侈稅門檻與每年牌照稅、公路養管費
- [車款購買指南總覽](${SITE}guides.html)：各車系的世代差異、規格、看車重點，附在店車與成交紀錄
- [估車收車服務](${SITE}services.html)：二手車估價、收購、換購折抵、到府收車
- [保養資訊](${SITE}maintenance.html)：進口車保養建議
- [關於我們](${SITE}about.html)：專營車款、第三方鑑定方式、公司資料一覽、客戶評價
- [聯絡我們](${SITE}contact.html)：地址、電話、地圖

## English pages

- [FUN CAR in English](${SITE}en/)：Import and used car dealer in Hsinchu for international residents; cars in stock, phone and LINE in English
- [Buying a car in Taiwan as a foreigner](${SITE}en/buying-a-car-in-taiwan.html)：documents, registration, driver's licence, insurance, annual taxes, selling when you leave Taiwan

## 車款購買指南

${GUIDES.filter(g => fs.existsSync(g.file)).map(g => `- [${g.label}](${SITE}${g.file})：${g.blurb}`).join('\n')}

## 機器可讀資料

- [完整車輛資料 inventory.json](${SITE}inventory.json)：所有車輛的狀態、規格、價格說明與照片網址，每次網站更新時同步產生（最後更新 ${TODAY}）

${sec('在店現車', 'in-stock')}
${sec('即將到港', 'coming')}
${sec('成交紀錄', 'sold')}`.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync('llms.txt', txt.trimEnd() + '\n');
  console.log('  built   llms.txt');
}

// ============================================================
// 執行
// ============================================================
console.log('SSG 預渲染中…');
inject('index.html',      'data-showcase="in-stock"', brandCards());
inject('index.html',      'data-showcase-dots',       brandDots());
inject('index.html',      'data-car-grid="sold"',     grid('sold'));
inject('inventory.html',  'data-car-grid="in-stock"', grid('in-stock'));
inject('sold.html',       'data-car-grid="sold"',     grid('sold'));
inject('incoming.html',   'data-car-grid="coming"',   grid('coming'));
inject('about.html',      'data-fact-card',           factCard());
bakeGuides();
inject('guides.html',     'data-ssg="guide-list"',    guideList());
inject('en/index.html',   'data-ssg="en-in-stock"',   enGrid('in-stock'));
inject('en/index.html',   'data-ssg="en-coming"',     enGrid('coming'));
buildCarPages();
buildSitemap();
buildInventoryJson();
buildLlmsTxt();
console.log('完成。in-stock:'+byStatus('in-stock').length+' sold:'+byStatus('sold').length+' coming:'+byStatus('coming').length+' brands:'+SHOWCASE_BRANDS.length);
