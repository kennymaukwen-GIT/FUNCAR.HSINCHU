// 台灣平台設定：格式限制、發佈方式。
// mode: 'api'    = 有官方 API，核准後可自動發佈
//       'manual' = 沒有公開 API 或平台規範不允許自動化，agent 只產生文案，由人複製貼上
const PLATFORMS = {
  facebook: {
    label: 'Facebook 粉專', mode: 'api', maxChars: 2000, maxTags: 6,
    note: 'Graph API /{page-id}/photos、/feed；需粉專 Page Access Token（pages_manage_posts）',
  },
  instagram: {
    label: 'Instagram', mode: 'api', maxChars: 2200, maxTags: 15,
    note: 'Graph API 內容發佈；需 IG 專業帳號連結粉專，圖片須為公開 JPEG',
  },
  threads: {
    label: 'Threads', mode: 'api', maxChars: 500, maxTags: 1,
    note: 'Threads API（graph.threads.net）；每則上限 500 字',
  },
  line: {
    label: 'LINE 官方帳號', mode: 'api', maxChars: 400, maxTags: 0,
    note: 'Messaging API broadcast；按則數計費，建議只推每週精選或重點車',
  },
  google_business: {
    label: 'Google 商家動態', mode: 'manual', maxChars: 1500, maxTags: 0,
    note: 'Business Profile API 需另外申請權限；先人工貼到商家後台「新增更新」',
  },
  car8891: {
    label: '8891 車輛說明', mode: 'manual', maxChars: 2000, maxTags: 0,
    note: '8891 沒有公開 API，貼到車商後台的車輛說明欄',
  },
  short_video: {
    label: '短影音腳本（Reels / Shorts / TikTok）', mode: 'manual', maxChars: 1200, maxTags: 8,
    note: '腳本＋字幕；影片拍好後再上傳。TikTok 未通過審核的 App 只能發私人影片',
  },
};

module.exports = { PLATFORMS };
