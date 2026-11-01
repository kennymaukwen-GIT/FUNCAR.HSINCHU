# content-agent（暫停中，尚未完成）

從 `inventory.json` 產生各平台貼文草稿（Facebook、Instagram、Threads、LINE、Google 商家、8891、短影音腳本）的工具雛形。
方向後來改為經營論壇的站外提及（見 `marketing/offsite-30day-plan.md`），這裡先暫停。

目前完成：
- `lib/facts.js`：讀 inventory.json，整理成只含已確認欄位的事實表
- `lib/platforms.js`：各平台格式限制與發佈方式
- `lib/templates.js`：不需 API 金鑰的模板文案

尚未完成：主程式 `agent.js`、事實檢查、核准流程、各平台發佈。`package.json` 裡的指令目前還不能執行。

此資料夾已用 `.vercelignore` 排除，不會部署到官網。
