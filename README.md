# FUN CAR 貿鑫國際車業 官網

純靜態網站（HTML + CSS + JS），正式網址 https://www.funcar-hsinchu.com.tw/

## 資料夾結構

```
.
├── index.html / inventory.html / sold.html / incoming.html …   各頁面
├── css/style.css          全站樣式
├── js/cars.js             ★ 車輛資料庫（新增 / 修改車輛只改這個檔）
├── js/main.js             頁面邏輯（卡片、輪播、品牌展示…）
├── build-seo.js           SEO 預渲染與自動產生檔案（改完 cars.js 後執行）
├── import-tax-calculator.html  外匯車進口稅費試算器（稅率寫在頁尾的 <script>，稅法變動時要改）
├── mini-clubman-jcw-guide.html MINI Clubman JCW 購買指南（在店車、成交紀錄由 build-seo.js 自動產生）
├── en/                    英文頁（給竹科外籍人士）：index.html 在店車由 build-seo.js 自動產生
├── car-detail.html        車輛內頁的共用模板（本身不收錄，舊網址會轉到 cars/<id>.html）
├── cars/<id>.html         ★ 每台車的靜態內頁，由 build-seo.js 自動產生，不要手動修改
├── vercel.json            Vercel 轉址設定（舊車輛網址、舊聯絡頁）
├── llms.txt               給 AI 讀的網站摘要，自動產生
├── inventory.json         機器可讀的完整車輛資料，自動產生
├── server.py              本機預覽用的簡易伺服器
├── sitemap.xml            網站地圖，自動產生
├── robots.txt
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

4. 執行 `node build-seo.js`。它會一次更新：
   - 首頁、在店、已售、即將到港頁的車卡
   - `cars/<id>.html` 每台車的靜態內頁（含結構化資料）
   - 關於我們頁的「公司資料一覽」表（車輛數量會自動更新）
   - `sitemap.xml`、`llms.txt`、`inventory.json`
5. 若有改 `css/style.css` 或 `js/cars.js`，把各 HTML 裡的 `?v=` 版本號 +1，讓瀏覽器重新下載。

車子賣掉時只要把 `status` 改成 `'sold'`、`price` 改成 `'已售出'`，再執行 `node build-seo.js`。照片資料夾不用搬，車輛內頁會自動改成成交紀錄。

公司資料（統一編號、地址、營業時間、Google 地圖、8891 連結）集中在 `build-seo.js` 開頭的 `DEALER` 設定，改一次全站同步。

## 本機預覽

```bash
python3 server.py
```

然後開 http://localhost:8765/
