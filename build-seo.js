// SSG 預渲染:把 JS 動態內容烤進 HTML(供第一波抓取)。
// main.js 載入時會重繪相同內容,故最終視覺不變。可重複執行(idempotent)。
const fs = require('fs');

function loadArray(src, name){
  const m = src.match(new RegExp('const\\s+'+name+'\\s*=\\s*(\\[[\\s\\S]*?\\n\\];)'));
  if(!m) throw new Error('找不到 '+name);
  return eval(m[1]);
}
const CARS = loadArray(fs.readFileSync('js/cars.js','utf8'), 'CARS');
const SHOWCASE_BRANDS = loadArray(fs.readFileSync('js/main.js','utf8'), 'SHOWCASE_BRANDS');

const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const ROOT_PHOTO_FOLDERS = ['BENZ','BMW','MINI','PORSCHE','OTHERS'];
const photoUrl = (car,i) => (ROOT_PHOTO_FOLDERS.includes(String(car.folder).split('/')[0]) ? '' : 'images/')+encodeURIComponent(car.folder).replace(/%2F/g,'/')+'/'+encodeURIComponent(car.photos[i]);
const byStatus = s => CARS.filter(c => c.status === s);

const BRAND_ZH = { bmw: 'BMW', porsche: '保時捷', benz: '賓士', mini: 'MINI', other: '進口車' };
function carCard(car){
  const href = `car-detail.html?id=${car.id}`;
  const price = car.status==='sold' ? '已售出' : (car.status==='coming' ? '接受預訂' : (car.price==='電洽' ? '電洽' : '$ '+car.price));
  const alt = `${car.title} ${BRAND_ZH[car.brand]||''} 新竹外匯車`;
  const mi = car.specs && car.specs.mileage;
  const miRow = (mi && mi !== '—') ? `<div class="car-card-mileage"><span>里程</span><span>${esc(mi)}</span></div>` : '';
  return `
      <a href="${href}" class="car-card" data-brand="${esc(car.brand)}">
        <div class="car-card-media"><img class="car-card-img" src="${photoUrl(car,0)}" alt="${esc(alt)}" loading="lazy"></div>
        <div class="car-card-body">
          <div class="car-card-title">${esc(car.title)}</div>
          <div class="car-card-subtitle">${esc(car.subtitle)}</div>
          ${miRow}
          <div class="car-card-price">${esc(price)}</div>
        </div>
      </a>`;
}
const grid = status => byStatus(status).map(carCard).join('') + '\n    ';

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

console.log('SSG 預渲染中…');
inject('index.html',      'data-showcase="in-stock"', brandCards());
inject('index.html',      'data-showcase-dots',       brandDots());
inject('index.html',      'data-car-grid="sold"',     grid('sold'));
inject('inventory.html',  'data-car-grid="in-stock"', grid('in-stock'));
inject('sold.html',       'data-car-grid="sold"',     grid('sold'));
inject('incoming.html',   'data-car-grid="coming"',   grid('coming'));
inject('models.html',     'data-showcase="in-stock"', brandCards());
inject('models.html',     'data-showcase-dots',       brandDots());
console.log('完成。in-stock:'+byStatus('in-stock').length+' sold:'+byStatus('sold').length+' coming:'+byStatus('coming').length+' brands:'+SHOWCASE_BRANDS.length);
