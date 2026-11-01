// 事實來源：只讀官網建置產生的 inventory.json（由 build-seo.js 從 js/cars.js 產生）。
// agent 寫的每一句車輛描述都必須能回推到這裡的欄位。
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function loadInventory() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'inventory.json'), 'utf8'));
}

// 車輛狀態 → 內容事件
const EVENT_BY_STATUS = { 'in-stock': 'arrival', coming: 'incoming', sold: 'sold' };
const EVENT_LABEL = { arrival: '新車到店', incoming: '即將到港・接受預訂', sold: '成交紀錄' };

const known = v => (v != null && v !== '—' && v !== '洽詢' && String(v).trim() !== '') ? String(v).trim() : null;
const knownPrice = p => (known(p) && !['電洽', '已成交', '已售出', '接受預訂'].includes(p)) ? p : null;

// 把一台車整理成「只含已確認欄位」的事實表。未確認的欄位一律為 null，模板與 LLM 都不能補寫。
function factSheet(car, dealer) {
  return {
    id: car.id,
    event: EVENT_BY_STATUS[car.status],
    status: car.status,
    name: car.name,
    brand: car.brand,
    year: known(car.year),
    mileage: known(car.mileage),          // 例如「24,000 公里」或「全新」
    exteriorColor: known(car.exteriorColor),
    transmission: known(car.transmission),
    fuel: known(car.fuel),
    origin: known(car.origin),            // 例如「總代理」；null 代表未確認，不能寫車源
    location: known(car.location),
    price: knownPrice(car.price),         // null 代表電洽
    url: car.url,
    images: car.images || [],
    dealer: {
      name: dealer.name,
      phone: dealer.telephone,
      address: dealer.address,
      hours: dealer.openingHours,
      googleMaps: dealer.googleMaps,
    },
  };
}

// 傳給 LLM 時移除 null，避免模型把空欄位當成可發揮的空間
function compactFacts(f) {
  const out = {};
  for (const [k, v] of Object.entries(f)) {
    if (v == null) continue;
    out[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? compactFacts(v) : v;
  }
  return out;
}

module.exports = { ROOT, loadInventory, factSheet, compactFacts, EVENT_BY_STATUS, EVENT_LABEL };
