// ============================================
// FUN CAR 車輛資料庫
// ============================================
// 要新增 / 修改車輛，直接編輯這個檔案即可
//
// 每輛車的欄位說明：
//   id        : 網址用的編號（英文小寫，用 - 分隔，不要重複）
//   status    : 'in-stock'（在店）| 'sold'（已售）| 'coming'（即將到港）
//   brand     : 'benz' | 'bmw' | 'porsche' | 'mini' | 'other'
//   title     : 卡片主標題（年份+品牌+車系）
//   subtitle  : 卡片副標題（車型/版本）
//   folder    : 照片資料夾名稱（相對於 images/）
//   photos    : 該資料夾內所有照片檔名（依顯示順序）
//   specs     : 車輛規格（可自由修改或補空白）
//   price     : 顯示的價格（可填 '電洽' 或 '$1,800,000'）
// ============================================

const CARS = [

  // ============ 在店車款 ============

  {
    id: 'benz-glb35-amg-2024',
    status: 'in-stock',
    brand: 'benz',
    title: '2024 BENZ GLB35',
    subtitle: 'AMG 4MATIC',
    folder: 'BENZ',
    photos: ['2024 GLB35 AMG 4MATIC : 黑 : 5座:14000公里.jpg'],
    specs: { year: '2024', mileage: '14,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '黑', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1HLuVNKgQr/',
  },

  {
    id: 'benz-gt53-amg-white',
    status: 'in-stock',
    brand: 'benz',
    title: 'BENZ GT53',
    subtitle: 'AMG',
    folder: 'BENZ',
    photos: ['GT53 AMG-1.jpg'],
    specs: { year: '—', mileage: '—', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '白', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1854T7g8hp/',
  },

  {
    id: 'benz-glc43-amg-black',
    status: 'in-stock',
    brand: 'benz',
    title: 'BENZ GLC43',
    subtitle: 'AMG',
    folder: 'BENZ',
    photos: ['GLC 43 AMG-1.jpg'],
    specs: { year: '—', mileage: '—', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '黑', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1HzfCNv8GB/',
  },

  {
    id: 'mini-countryman-jcw-white',
    status: 'in-stock',
    brand: 'mini',
    title: 'MINI COUNTRYMAN',
    subtitle: 'JCW',
    folder: 'MINI',
    photos: ['Countryman JCW-1.jpg'],
    specs: { year: '—', mileage: '—', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '白', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1SVt4UY9d1/',
  },

  {
    id: 'mini-clubman-jcw-black-red',
    status: 'in-stock',
    brand: 'mini',
    title: 'MINI CLUBMAN',
    subtitle: 'JCW',
    folder: 'MINI',
    photos: ['Clubman JCW-1.jpg'],
    specs: { year: '—', mileage: '—', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '黑紅', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1HoEjPeTCm/',
  },

  {
    id: 'mini-clubman-jcw-green',
    status: 'in-stock',
    brand: 'mini',
    title: 'MINI CLUBMAN',
    subtitle: 'JCW',
    folder: 'MINI',
    photos: ['Clubman JCW-2.jpg'],
    specs: { year: '—', mileage: '—', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '墨綠', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1DTfNVE9gM/',
  },

  {
    id: 'mini-clubman-jcw-sage',
    status: 'in-stock',
    brand: 'mini',
    title: 'MINI CLUBMAN',
    subtitle: 'JCW',
    folder: 'MINI',
    photos: ['Clubman JCW-3.jpg'],
    specs: { year: '—', mileage: '—', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '灰藍', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1BrD6ZKC1Q/',
  },

  {
    id: 'mini-clubman-jcw-white',
    status: 'in-stock',
    brand: 'mini',
    title: 'MINI CLUBMAN',
    subtitle: 'JCW',
    folder: 'MINI',
    photos: ['Clubman JCW-4.jpg'],
    specs: { year: '—', mileage: '—', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '白', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/19hyoo5brJ/',
  },

  {
    id: 'porsche-718-boxster-s-2017',
    status: 'in-stock',
    brand: 'porsche',
    title: '2017 PORSCHE 718 BOXSTER',
    subtitle: 'S',
    folder: 'PORSCHE',
    photos: ['年份：2017 車型：Porsche 718 Boxster S 顏色：極白 里程37,000公里 .jpg'],
    specs: {
      year: '2017',
      mileage: '37,000 公里',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '極白',
      interiorColor: '—',
    },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/permalink.php?story_fbid=pfbid036DTpJ5CC7gjmEPeGuXdHZ1rezt3gRqbiCYg3PebzzSykEPciMWX1ZECaV9juC2nWl&id=100063469527149',
  },

  {
    id: 'mini-cabrio-jcw-2024',
    status: 'in-stock',
    brand: 'mini',
    title: '2024 MINI CABRIO',
    subtitle: 'JCW',
    folder: 'in-stock/2024 MY MINI Cabrio JCW',
    photos: [
      'IMG_2671.JPG','IMG_2672.JPG','IMG_2673.JPG','IMG_2674.JPG','IMG_2675.JPG',
      'IMG_2677.JPG','IMG_2678.JPG','IMG_2682.JPG','IMG_2687.JPG','IMG_2688.JPG',
      'IMG_2690.JPG','IMG_2691.JPG'
    ],
    specs: {
      year: '2024',
      mileage: '—',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '電洽',
  },

  {
    id: 'mini-clubman-untold-2024',
    status: 'in-stock',
    brand: 'mini',
    title: '2024 MINI CLUBMAN S',
    subtitle: 'UNTOLD EDITION',
    folder: 'in-stock/2024 MY MINI CLubman S Untold Edition',
    photos: [
      'IMG_2816.JPG','IMG_2817 2.JPG','IMG_2818 2.JPG','IMG_2819 2.JPG','IMG_2820 2.JPG',
      'IMG_2821 4.JPG','IMG_2822 2.JPG','IMG_2823 2.JPG','IMG_2824 2.JPG','IMG_2825 2.JPG'
    ],
    specs: {
      year: '2024',
      mileage: '—',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '電洽',
  },

  {
    id: 'benz-e200-luxury-2025',
    status: 'in-stock',
    brand: 'benz',
    title: '2025 BENZ E200',
    subtitle: 'LUXURY',
    folder: 'in-stock/2025 BENZ E200 Luxury',
    photos: [
      'IMG_2693.JPG','IMG_2694.JPG','IMG_2695.JPG','IMG_2698.JPG','IMG_2700.JPG',
      'IMG_2705.JPG','IMG_2707.JPG','IMG_2708.JPG','IMG_2710.JPG','IMG_2712.JPG',
      'IMG_2713.JPG'
    ],
    specs: {
      year: '2025',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '電洽',
  },

  {
    id: 'benz-glc300-black',
    status: 'in-stock',
    brand: 'benz',
    title: 'BENZ GLC 300',
    subtitle: 'BLACK',
    folder: 'in-stock/BENZ GLC 300 Black',
    photos: [
      'IMG_2893.JPG','IMG_2894.JPG','IMG_2895.JPG','IMG_2896.JPG','IMG_2897.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '黑色',
      interiorColor: '—',
    },
    price: '電洽',
  },

  {
    id: 'mini-clubman-jcw-black',
    status: 'in-stock',
    brand: 'mini',
    title: 'MINI CLUBMAN',
    subtitle: 'JCW · BLACK',
    folder: 'in-stock/MINI Clubman JCW Black',
    photos: [
      'IMG_2905.JPG','IMG_2906.JPG','IMG_2907.JPG','IMG_2910.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '黑色',
      interiorColor: '—',
    },
    price: '電洽',
  },

  // ============ 已售車款 ============

  {
    id: 'mini-clubman-jcw-all4-2024',
    status: 'sold',
    brand: 'mini',
    title: '2024 MINI CLUBMAN',
    subtitle: 'JCW ALL4 · 新竹外匯車成交',
    folder: 'sold/2024 MY MINI Clubman JCW ALL4',
    photos: [
      'IMG_2744 2.JPG','IMG_2745 2.JPG','IMG_2746 2.JPG','IMG_2747 2.JPG','IMG_2748 2.JPG',
      'IMG_2749 2.JPG','IMG_2753 2.JPG','IMG_2757 2.JPG','IMG_2760.JPG'
    ],
    specs: {
      year: '2024',
      mileage: '—',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-cla45s-amg-2023',
    status: 'sold',
    brand: 'benz',
    title: '2023 BENZ CLA 45s',
    subtitle: 'AMG · 進口車代辦實績',
    folder: 'sold/2023 BENZ CLA 45s AMG',
    photos: [
      'IMG_2837.JPG','IMG_2838.JPG','IMG_2839.JPG','IMG_2840.JPG','IMG_2841.JPG',
      'IMG_2842.JPG','IMG_2843.JPG','IMG_2844.JPG','IMG_2845.JPG'
    ],
    specs: {
      year: '2023',
      mileage: '—',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-glc43-amg-white-2025',
    status: 'sold',
    brand: 'benz',
    title: '2025 BENZ GLC 43',
    subtitle: 'AMG · WHITE · 新竹外匯休旅成交',
    folder: 'sold/2025 BENZ GLC 43 AMG WHITE',
    photos: [
      'IMG_2714.JPG','IMG_2715.JPG','IMG_2716.JPG','IMG_2718.JPG','IMG_2721.JPG',
      'IMG_2722.JPG','IMG_2724.JPG','IMG_2727.JPG','IMG_2728.JPG','IMG_2729.JPG',
      'IMG_2733.JPG','IMG_2736.JPG','IMG_2740 4.JPG','IMG_2743 2.JPG'
    ],
    specs: {
      year: '2025',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '白色',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-e200',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ E 200',
    subtitle: '外匯車成交紀錄',
    folder: 'sold/BENZ E 200',
    photos: [
      'IMG_2929.JPG','IMG_2930.JPG','IMG_2931.JPG','IMG_2933.JPG','IMG_2934.JPG',
      'IMG_2936.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-e53',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ E53',
    subtitle: 'AMG · 新竹外匯車成交',
    folder: 'sold/BENZ E53',
    photos: [
      'IMG_2920.JPG','IMG_2921.JPG','IMG_2922.JPG','IMG_2923.JPG','IMG_2925.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-glb250',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GLB 250',
    subtitle: '進口休旅代辦實績',
    folder: 'sold/BENZ GLB 250',
    photos: [
      'IMG_2955.JPG','IMG_2956.JPG','IMG_2957.JPG','IMG_2958.JPG','IMG_2959.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-glb35-amg',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GLB 35',
    subtitle: 'AMG · 新竹外匯休旅成交',
    folder: 'sold/BENZ GLB 35 AMG',
    photos: [
      'IMG_3014.JPG','IMG_3015.JPG','IMG_3016.JPG','IMG_3017.JPG','IMG_3018.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-glc43-coupe',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GLC 43',
    subtitle: 'COUPE · 進口休旅代辦實績',
    folder: 'sold/BENZ GLC 43 Coupe',
    photos: [
      'IMG_2913.JPG','IMG_2914.JPG','IMG_2915.JPG','IMG_2916.JPG','IMG_2917.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-gle450-black',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GLE 450',
    subtitle: 'BLACK · 新竹外匯休旅成交',
    folder: 'sold/BENZ GLE 450 Black',
    photos: [
      'IMG_2937.JPG','IMG_2938.JPG','IMG_2939.JPG','IMG_2940.JPG','IMG_2941.JPG',
      'IMG_2942.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '黑色',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-gle450-coupe',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GLE 450',
    subtitle: 'COUPE · 進口休旅代辦實績',
    folder: 'sold/BENZ GLE 450 Coupe',
    photos: [
      'IMG_2994.JPG','IMG_2995.JPG','IMG_2996.JPG','IMG_2997.JPG','IMG_2998.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-gle450-white',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GLE 450',
    subtitle: 'WHITE · 新竹外匯休旅成交',
    folder: 'sold/BENZ GLE 450 White',
    photos: [
      'IMG_2943.JPG','IMG_2944.JPG','IMG_2945.JPG','IMG_2946.JPG','IMG_2947.JPG',
      'IMG_2948.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '白色',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-gle53-amg',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GLE 53',
    subtitle: 'AMG · 進口休旅代辦實績',
    folder: 'sold/BENZ GLE 53 AMG',
    photos: [
      'IMG_3007.JPG','IMG_3008.JPG','IMG_3009.JPG','IMG_3010.JPG','IMG_3012.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-gt53-amg',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GT 53',
    subtitle: 'AMG · 進口車代辦實績',
    folder: 'sold/BENZ GT53 AMG',
    photos: [
      'IMG_2999.JPG','IMG_3002.JPG','IMG_3003.JPG','IMG_3004.JPG','IMG_3005.JPG',
      'IMG_3006.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'benz-glc300-coupe',
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GLC 300',
    subtitle: 'COUPE · 新竹外匯休旅成交',
    folder: 'sold/GLC 300 Coupe',
    photos: [
      'IMG_2949.JPG','IMG_2950.JPG','IMG_2951.JPG','IMG_2952.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'porsche-macan',
    status: 'sold',
    brand: 'porsche',
    title: 'PORSCHE MACAN',
    subtitle: '進口休旅代辦實績',
    folder: 'sold/PORSCHE Macan',
    photos: [
      'IMG_2968.JPG','IMG_2969.JPG','IMG_2970.JPG','IMG_2971.JPG','IMG_2972.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: 'PDK',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  {
    id: 'porsche-macan-s',
    status: 'sold',
    brand: 'porsche',
    title: 'PORSCHE MACAN',
    subtitle: 'S · 新竹外匯休旅成交',
    folder: 'sold/PORSCHE Macan S',
    photos: [
      'IMG_2960.JPG','IMG_2961.JPG','IMG_2963.JPG','IMG_2964.JPG','IMG_2965.JPG',
      'IMG_2966.JPG'
    ],
    specs: {
      year: '—',
      mileage: '—',
      transmission: 'PDK',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '已售出',
  },

  // ============ 即將到港 ============

  {
    id: 'mini-cabrio-seaside-2023',
    status: 'coming',
    brand: 'mini',
    title: '2023 MINI CABRIO',
    subtitle: 'SEASIDE S',
    folder: 'incoming/2023 MY MINI Cabrio Seaside S',
    photos: [
      'IMG_2794.JPG','IMG_2796.JPG','IMG_2798.JPG','IMG_2799.JPG','IMG_2800 2.JPG',
      'IMG_2802.JPG','IMG_2803.JPG','IMG_2806.JPG','IMG_2808.JPG','IMG_2811.JPG'
    ],
    specs: {
      year: '2023',
      mileage: '—',
      transmission: '自排',
      fuel: '汽油',
      location: '即將到港',
      origin: '—',
      exteriorColor: '—',
      interiorColor: '—',
    },
    price: '接受預訂',
  },

  {
    id: 'benz-glc43-black-2025',
    status: 'coming',
    brand: 'benz',
    title: '2025 BENZ GLC 43',
    subtitle: 'AMG · BLACK',
    folder: 'incoming/2025 BENZ GLC 43 BLACK',
    photos: [
      'IMG_2761.JPG','IMG_2762.JPG','IMG_2763 2.JPG','IMG_2765.JPG','IMG_2768.JPG',
      'IMG_2769.JPG','IMG_2770.JPG','IMG_2772.JPG','IMG_2776.JPG','IMG_2783.JPG',
      'IMG_2787.JPG','IMG_2788.JPG'
    ],
    specs: {
      year: '2025',
      mileage: '—',
      transmission: '9G-TRONIC',
      fuel: '汽油',
      location: '即將到港',
      origin: '—',
      exteriorColor: '黑色',
      interiorColor: '—',
    },
    price: '接受預訂',
  },

];

// ============================================
// 工具函式 - 不需要修改
// ============================================
// 品牌資料夾放在網站根目錄(BENZ/BMW/MINI/PORSCHE/OTHERS),照片直接從那裡抓;
// 其餘 folder(如 in-stock/…、sold/…)維持從 images/ 底下抓。
const ROOT_PHOTO_FOLDERS = ['BENZ', 'BMW', 'MINI', 'PORSCHE', 'OTHERS'];
function photoUrl(car, index) {
  const filename = car.photos[index];
  const first = String(car.folder).split('/')[0];
  const base = ROOT_PHOTO_FOLDERS.includes(first) ? '' : 'images/';
  return base + encodeURIComponent(car.folder).replace(/%2F/g, '/') + '/' + encodeURIComponent(filename);
}

function carsByStatus(status) {
  return CARS.filter(c => c.status === status);
}

function findCar(id) {
  return CARS.find(c => c.id === id);
}
