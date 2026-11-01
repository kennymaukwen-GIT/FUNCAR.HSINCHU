// 模板產生器：不需要 API 金鑰，只用事實表組字。LLM 模式也以這份為底稿，失敗時退回這份。
const { EVENT_LABEL } = require('./facts');

const BRAND_TAGS = {
  'Mercedes-Benz': ['#賓士', '#MercedesBenz'],
  Porsche: ['#保時捷', '#Porsche'],
  MINI: ['#MINI'],
  BMW: ['#BMW'],
};
const BASE_TAGS = ['#FUNCAR', '#貿鑫國際車業', '#新竹外匯車', '#進口車'];

// 從車名取出車型標籤（只用車名裡本來就有的字，例如 GLC43、AMG、JCW）
function modelTags(name) {
  const tokens = String(name).toUpperCase().split(/[\s·]+/);
  const tags = tokens.filter(t => /^[A-Z]+\d+[A-Z]*$/.test(t) || ['AMG', 'JCW', 'MACAN', 'CAYMAN', 'BOXSTER', 'CLUBMAN', 'COUNTRYMAN'].includes(t));
  return [...new Set(tags)].map(t => '#' + t);
}

function hashtags(f, max) {
  if (!max) return [];
  const tags = [...modelTags(f.name), ...(BRAND_TAGS[f.brand] || []), ...BASE_TAGS];
  return [...new Set(tags)].slice(0, max);
}

function utm(url, platform, f) {
  const u = new URL(url);
  u.searchParams.set('utm_source', platform);
  u.searchParams.set('utm_medium', platform === 'google_business' ? 'local' : 'social');
  u.searchParams.set('utm_campaign', `${f.event}-${f.id}`);
  return u.toString();
}

// 規格清單：只列有值的欄位
function specLines(f, bullet = '▸ ') {
  const rows = [
    ['年式', f.year],
    ['里程', f.mileage],
    ['外觀', f.exteriorColor],
    ['變速箱', f.transmission],
    ['燃料', f.fuel],
    ['車源', f.origin],
    ['賞車地點', f.location],
  ];
  return rows.filter(([, v]) => v).map(([k, v]) => `${bullet}${k}：${v}`);
}

function priceLine(f) {
  if (f.event === 'sold') return null;
  if (f.event === 'incoming') return '價格：接受預訂，歡迎來電洽詢';
  return f.price ? `價格：${f.price}` : '價格：電洽';
}

function headline(f) {
  return `【${EVENT_LABEL[f.event]}】${f.name}`;
}

function callToAction(f) {
  if (f.event === 'sold') return '想找同款或指定車型，可以委託我們客製代尋。';
  if (f.event === 'incoming') return '即將到港，想先預訂或了解細節，歡迎私訊或來電。';
  return '實車在新竹展間，歡迎預約賞車。';
}

function contactBlock(f) {
  const d = f.dealer;
  return [`📍 ${d.name}`, `☎ ${d.phone}`, `🏠 ${d.address}`, `🕘 ${d.hours}`].join('\n');
}

const T = {
  facebook(f, p) {
    const lines = [headline(f), ''];
    if (f.event === 'sold') lines.push(`${f.name} 已成交，感謝車主的信任 🙏`, '');
    lines.push(...specLines(f));
    const pl = priceLine(f); if (pl) lines.push(pl);
    lines.push('', callToAction(f), '', `完整照片與規格 👉 ${utm(f.url, 'facebook', f)}`, '', contactBlock(f), '', hashtags(f, p.maxTags).join(' '));
    return { text: lines.join('\n'), link: utm(f.url, 'facebook', f), media: f.images.slice(0, 10) };
  },

  instagram(f, p) {
    const lines = [headline(f), ''];
    if (f.event === 'sold') lines.push(`${f.name} 已成交，感謝車主的信任 🙏`, '');
    lines.push(...specLines(f));
    const pl = priceLine(f); if (pl) lines.push(pl);
    lines.push('', callToAction(f), '完整規格請點主頁連結，或直接私訊我們。', '', `☎ ${f.dealer.phone}`, `📍 ${f.dealer.address}`, '', hashtags(f, p.maxTags).join(' '));
    return { text: lines.join('\n'), media: f.images.slice(0, 10) };
  },

  threads(f, p) {
    const facts = specLines(f, '').slice(0, 3).join('｜');
    const lead = f.event === 'sold' ? `${f.name} 已成交 🙏` : f.event === 'incoming' ? `${f.name} 即將到港，接受預訂。` : `${f.name} 到店了。`;
    const ask = f.event === 'sold' ? '想找同款可以留言或私訊，我們幫你代尋。' : '有興趣的留言或私訊聊聊 👇';
    const text = [lead, facts, ask, utm(f.url, 'threads', f), hashtags(f, p.maxTags).join(' ')].filter(Boolean).join('\n\n');
    return { text, media: f.images.slice(0, 1) };
  },

  line(f) {
    // altText 是通知列與不支援 Flex 時顯示的文字，上限 400 字
    const facts = specLines(f, '').slice(0, 3).join('｜');
    const altText = `${headline(f)}｜${facts}`;
    return { text: altText, link: utm(f.url, 'line', f), media: f.images.slice(0, 1), flex: lineFlex(f) };
  },

  google_business(f) {
    const lines = [headline(f), '', ...specLines(f, '・')];
    const pl = priceLine(f); if (pl) lines.push(pl);
    lines.push('', callToAction(f), `營業時間：${f.dealer.hours}`, `電話：${f.dealer.phone}`);
    return { text: lines.join('\n'), link: utm(f.url, 'google_business', f), cta: '瞭解詳情', media: f.images.slice(0, 1) };
  },

  car8891(f) {
    if (f.event === 'sold') return null;   // 已售車不上架 8891
    const lines = [f.name, '', '【車輛資料】', ...specLines(f, '・')];
    const pl = priceLine(f); if (pl) lines.push(pl);
    lines.push('', '【關於我們】', `${f.dealer.name}，新竹在地進口外匯車商，可客製代尋指定車款。`,
      `地址：${f.dealer.address}`, `營業時間：${f.dealer.hours}`, `電話：${f.dealer.phone}`, '',
      `更多照片與資料：${f.url}`);
    return { text: lines.join('\n') };
  },

  short_video(f, p) {
    const n = f.images.length;
    const lines = [
      `🎬 ${headline(f)}（直式 9:16，約 20–30 秒）`, '',
      '[開場] 車頭 45 度近拍，慢速推進', `字幕：${f.event === 'sold' ? '已成交' : EVENT_LABEL[f.event]}｜${f.name}`, '',
      '[外觀] 側身繞車一圈', `字幕：${specLines(f, '').filter(s => /外觀|年式/.test(s)).join('｜') || f.name}`, '',
      '[內裝] 方向盤、座椅、中控台特寫', `字幕：${specLines(f, '').filter(s => /里程|車源/.test(s)).join('｜') || '實車在新竹展間'}`, '',
      '[結尾] 店招／展間畫面', `字幕：${callToAction(f)}`, `字幕：${f.dealer.name}｜${f.dealer.phone}`, '',
      `素材：官網目前有 ${n} 張照片可做輪播備案`, '',
      '貼文說明：', `${headline(f)}`, `完整資料 👉 ${f.url}`, hashtags(f, p.maxTags).join(' '),
    ];
    return { text: lines.join('\n') };
  },
};

function lineFlex(f) {
  const rows = specLines(f, '').slice(0, 4).map(s => ({ type: 'text', text: s, size: 'sm', color: '#555555', wrap: true }));
  const pl = priceLine(f);
  if (pl) rows.push({ type: 'text', text: pl, size: 'sm', color: '#111111', weight: 'bold', wrap: true });
  return {
    type: 'bubble',
    hero: f.images[0] ? { type: 'image', url: f.images[0], size: 'full', aspectRatio: '4:3', aspectMode: 'cover' } : undefined,
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'text', text: EVENT_LABEL[f.event], size: 'xs', color: '#C8102E', weight: 'bold' },
        { type: 'text', text: f.name, size: 'lg', weight: 'bold', wrap: true },
        ...rows,
      ],
    },
    footer: {
      type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'button', style: 'primary', color: '#111111', action: { type: 'uri', label: '看照片與規格', uri: utm(f.url, 'line', f) } },
        { type: 'button', style: 'secondary', action: { type: 'uri', label: '來電洽詢', uri: 'tel:' + f.dealer.phone.replace(/-/g, '') } },
      ],
    },
  };
}

function render(platform, f, p) {
  const fn = T[platform];
  return fn ? fn(f, p) : null;
}

module.exports = { render, utm, specLines, hashtags };
