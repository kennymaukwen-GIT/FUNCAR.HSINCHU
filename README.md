# FUN CAR 貿鑫國際車業 官網

純靜態網站（HTML + CSS + JS），正式網址 https://www.funcar-hsinchu.com.tw/

## 資料夾結構

```
.
├── index.html / inventory.html / sold.html / incoming.html …   各頁面
├── css/style.css          全站樣式
├── js/cars.js             ★ 車輛資料庫（新增 / 修改車輛只改這個檔）
├── js/main.js             頁面邏輯（卡片、輪播、品牌展示…）
├── build-seo.js           SEO 預渲染：把車輛卡片烤進 HTML（改完 cars.js 後執行）
├── server.py              本機預覽用的簡易伺服器
├── sitemap.xml / robots.txt
├── videos/hero.mp4        首頁背景影片
└── images/
    ├── logo.png           網站 logo
    ├── hero/              各頁面大圖背景（inventory / sold / services / in-stock）
    ├── showroom/          展間照片（也是 og:image）
    ├── brands/            品牌 logo（png）
    ├── cars/              ★ 車輛照片，依「品牌 / 車輛 id」分類
    │   ├── benz/<車輛id>/01.jpg, 02.jpg …
    │   ├── mini/<車輛id>/…
    │   └── porsche/<車輛id>/…
    └── archive/           未上架、備用的照片與原始 logo（網站不會讀取）
```

## 新增一台車

1. 在 `images/cars/<品牌>/` 建立資料夾，名稱 = 車輛 id（英文小寫、用 `-` 分隔，例如 `benz-glc300-coupe-2025`）。
2. 照片依顯示順序命名 `01.jpg`、`02.jpg`…，`01.jpg` 是封面。
3. 在 `js/cars.js` 的 `CARS` 陣列新增一筆：

```js
{
  id: 'benz-glc300-coupe-2025',
  status: 'in-stock',            // 'in-stock' 在店 | 'sold' 已售 | 'coming' 即將到港
  brand: 'benz',                 // 'benz' | 'bmw' | 'porsche' | 'mini' | 'other'
  title: '2025 BENZ GLC300',
  subtitle: 'COUPE AMG',
  folder: 'cars/benz/benz-glc300-coupe-2025',
  photos: ['01.jpg', '02.jpg', '03.jpg'],
  specs: { year: '2025', mileage: '12,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '極白', interiorColor: '—' },
  price: '電洽',
  fbUrl: 'https://www.facebook.com/…',   // 選填
},
```

4. 執行 `node build-seo.js`，把卡片重新烤進 `index.html`、`inventory.html`、`sold.html`、`incoming.html`。
5. 若有改 `css/style.css` 或 `js/cars.js`，把各 HTML 裡的 `?v=` 版本號 +1，讓瀏覽器重新下載。

車子賣掉時只要把 `status` 改成 `'sold'`、`price` 改成 `'已售出'`，照片資料夾不用搬。

## 本機預覽

```bash
python3 server.py
```

然後開 http://localhost:8765/
