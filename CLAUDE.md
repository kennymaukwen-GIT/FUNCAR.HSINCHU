# FUN CAR 貿鑫國際車業官網：工作規則

純靜態網站（HTML + CSS + JS），推到 `main` 後 Vercel 自動部署到 https://www.funcar-hsinchu.com.tw/ 。
資料夾結構與新增車輛的完整步驟見 README.md。

## 修改網站的固定流程

1. 車輛資料只改 `js/cars.js`。照片放 `images/cars/<品牌>/<車輛id>/`，依顯示順序命名 `01.jpg`、`02.jpg`…，`01.jpg` 是封面。
2. 改完執行 `node build-seo.js`。它會更新列表頁車卡、`cars/<id>.html` 車輛靜態頁、關於頁的公司資料表、`sitemap.xml`、`llms.txt`、`inventory.json`。
   - 不要手動修改 `cars/` 底下的 HTML、`sitemap.xml`、`llms.txt`、`inventory.json`，下次建置會被覆蓋。
3. 改到 `css/style.css`、`js/main.js`、`js/cars.js` 時，把所有 HTML 裡對應的 `?v=` 版本號加 1。
4. 推送前用 `python3 server.py` 在本機啟動，並用瀏覽器實測：0 破圖、0 JavaScript 錯誤。
5. 推送到 `main` 後，確認該 commit 在 GitHub 上的 Vercel 狀態為 success。

## 上線方式（網站負責人已同意）

- **日常小改動直接推 `main`**：車輛上架、下架、改價格、標已售出、換照片、改公司資料、修錯字。測試通過就推。
- **大改動先推分支、開 PR**：改版面或樣式、改 `js/main.js` 或 `build-seo.js` 的邏輯、大範圍 SEO 調整、新增頁面、改 `vercel.json`。等 Vercel 預覽網址給負責人確認後才合併。
- 不確定屬於哪一類時，當作大改動處理。

## 公司資料

- 集中在 `build-seo.js` 開頭的 `DEALER` 設定，改一次全站同步：登記名稱、統一編號、地址、電話、營業時間、Google 地圖、8891 連結、Google 評分。
- 名稱、地址、電話、營業時間必須全站一致，也要和 Google 商家、8891、臉書一致。
- 頁尾、首頁商家結構化資料裡也寫有營業時間，修改時要一起改。

## 內容原則

- 車輛規格、價格、車源、鑑定內容只寫有根據的事實。不確定的欄位填 `'—'`，網站會顯示「洽詢」。
- 「韓規、加規、美規、滿配」這類規格字眼，只有確認該車符合時才能使用。
- 不要把 Google 或其他平台的評分寫進結構化資料的 aggregateRating 或 review，評分只用一般文字呈現。
- 已售車輛不要刪除，把 `status` 改成 `'sold'`、`price` 改成 `'已售出'`，車輛頁會自動變成成交紀錄。

## 轉址

`vercel.json` 設定了舊網址的永久轉址：`car-detail.html?id=<車輛id>` 轉到 `cars/<車輛id>.html`，`models.html` 轉到 `contact.html`。不要刪除。
