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
//   folder    : 照片資料夾，固定格式 cars/<品牌>/<id>（相對於 images/）
//   photos    : 該資料夾內的照片檔名，依顯示順序命名 01.jpg、02.jpg…（第一張為封面）
//   specs     : 車輛規格（可自由修改或補空白）
//   price     : 顯示的價格（可填 '電洽' 或 '$1,800,000'）
// ============================================

const CARS = [

  // ============ 在店車款 ============

  {
    id: 'benz-glc43-amg-coupe-white-2026',
    status: 'in-stock',
    brand: 'benz',
    title: '2026 BENZ GLC43',
    subtitle: 'AMG COUPE',
    folder: 'cars/benz/benz-glc43-amg-coupe-white-2026',
    photos: ['01.jpg', '02.jpg'],
    specs: { year: '2026', mileage: '全新', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '極白', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1F9ZRFHshW/',
  },

  {
    id: 'porsche-macan-2024',
    status: 'in-stock',
    brand: 'porsche',
    title: '2024 PORSCHE MACAN',
    subtitle: '',
    folder: 'cars/porsche/porsche-macan-2024',
    photos: ['01.jpg'],
    specs: { year: '2024', mileage: '24,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '蠟灰色', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/19mBLGXDJx/',
  },

  {
    id: 'benz-c180-coupe-amg-2021',
    status: 'in-stock',
    brand: 'benz',
    title: '2021 BENZ C180',
    subtitle: 'COUPE AMG',
    folder: 'cars/benz/benz-c180-coupe-amg-2021',
    photos: ['01.jpg'],
    specs: { year: '2021', mileage: '洽詢', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '極白', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1Eqdi7caWd/',
  },

  {
    id: 'mini-cooper-jcw-2023',
    status: 'in-stock',
    brand: 'mini',
    title: '2023 MINI COOPER',
    subtitle: 'JCW',
    folder: 'cars/mini/mini-cooper-jcw-2023',
    photos: ['01.jpg'],
    specs: { year: '2023', mileage: '25,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '午夜黑', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1F94ShSinr/',
  },

  {
    id: 'porsche-718-cayman-s-2020',
    status: 'in-stock',
    brand: 'porsche',
    title: '2020 PORSCHE 718 CAYMAN',
    subtitle: 'S',
    folder: 'cars/porsche/porsche-718-cayman-s-2020',
    photos: ['01.jpg'],
    specs: { year: '2020', mileage: '13,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '總代理', exteriorColor: '御林軍紅', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1coMbR9bhw/',
  },

  {
    id: 'benz-glc300-coupe-white-2024',
    status: 'in-stock',
    brand: 'benz',
    title: '2024 BENZ GLC300',
    subtitle: 'COUPE AMG',
    folder: 'cars/benz/benz-glc300-coupe-white-2024',
    photos: ['01.jpg'],
    specs: { year: '2024', mileage: '23,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '總代理', exteriorColor: '瓷釉白', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/19GgFU2RsR/',
  },

  {
    id: 'mini-clubman-jcw-red-2023',
    status: 'in-stock',
    brand: 'mini',
    title: '2023 MINI CLUBMAN',
    subtitle: 'JCW ALL4',
    folder: 'cars/mini/mini-clubman-jcw-red-2023',
    photos: ['01.jpg'],
    specs: { year: '2023', mileage: '8,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '辣椒紅', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1EioE5ys71/',
  },

  {
    id: 'mini-clubman-jcw-untold-black-2024',
    status: 'in-stock',
    brand: 'mini',
    title: '2024 MINI CLUBMAN',
    subtitle: 'JCW UNTOLD EDITION',
    folder: 'cars/mini/mini-clubman-jcw-untold-black-2024',
    photos: ['01.jpg'],
    specs: { year: '2024', mileage: '11,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '黑', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1HNNWYTmYV/',
  },

  {
    id: 'benz-glb35-amg-2024',
    status: 'in-stock',
    brand: 'benz',
    title: '2024 BENZ GLB35',
    subtitle: 'AMG 4MATIC',
    folder: 'cars/benz/benz-glb35-amg-2024',
    photos: ['01.jpg'],
    specs: { year: '2024', mileage: '14,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '黑', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1HLuVNKgQr/',
  },

  {
    id: 'benz-gt43-amg-2022',
    status: 'in-stock',
    brand: 'benz',
    title: '2022 BENZ GT43',
    subtitle: 'AMG 4 DOOR COUPE',
    folder: 'cars/benz/benz-gt43-amg-2022',
    photos: ['01.jpg'],
    specs: { year: '2022', mileage: '20,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '極白', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1854T7g8hp/',
  },

  {
    id: 'benz-glc43-amg-black',
    status: 'in-stock',
    brand: 'benz',
    title: 'BENZ GLC43',
    subtitle: 'AMG',
    folder: 'cars/benz/benz-glc43-amg-black',
    photos: ['01.jpg'],
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
    folder: 'cars/mini/mini-countryman-jcw-white',
    photos: ['01.jpg'],
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
    folder: 'cars/mini/mini-clubman-jcw-black-red',
    photos: ['01.jpg'],
    specs: { year: '—', mileage: '—', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '黑紅', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1HoEjPeTCm/',
  },

  {
    id: 'mini-clubman-jcw-green',
    status: 'in-stock',
    brand: 'mini',
    title: '2023 MINI CLUBMAN',
    subtitle: 'JCW ALL4',
    folder: 'cars/mini/mini-clubman-jcw-green',
    photos: ['01.jpg'],
    specs: { year: '2023', mileage: '26,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '反叛綠', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1Fi74Jz8Gq/',
  },

  {
    id: 'mini-clubman-jcw-sage',
    status: 'in-stock',
    brand: 'mini',
    title: '2024 MINI CLUBMAN',
    subtitle: 'S UNTOLD EDITION',
    folder: 'cars/mini/mini-clubman-jcw-sage',
    photos: ['01.jpg'],
    specs: { year: '2024', mileage: '7,000 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '灰藍', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/193JW9BSh6/',
  },

  {
    id: 'mini-clubman-jcw-white',
    status: 'in-stock',
    brand: 'mini',
    title: '2024 MINI CLUBMAN',
    subtitle: 'JCW ALL4',
    folder: 'cars/mini/mini-clubman-jcw-white',
    photos: ['01.jpg'],
    specs: { year: '2024', mileage: '4,500 公里', transmission: '自排', fuel: '汽油', location: '新竹', origin: '—', exteriorColor: '北極白', interiorColor: '—' },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1bk1VRj2JZ/',
  },

  {
    id: 'porsche-718-boxster-s-2017',
    status: 'in-stock',
    brand: 'porsche',
    title: '2017 PORSCHE 718 BOXSTER',
    subtitle: 'S',
    folder: 'cars/porsche/porsche-718-boxster-s-2017',
    photos: ['01.jpg'],
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
    folder: 'cars/mini/mini-cabrio-jcw-2024',
    photos: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg',
      '07.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg',
      '13.jpg'
    ],
    specs: {
      year: '2024',
      mileage: '15,000 公里',
      transmission: '自排',
      fuel: '汽油',
      location: '新竹',
      origin: '—',
      exteriorColor: '北極白',
      interiorColor: '—',
    },
    price: '電洽',
    fbUrl: 'https://www.facebook.com/share/p/1c7mLEjkLF/',
  },

  {
    id: 'mini-clubman-untold-2024',
    status: 'sold',
    brand: 'mini',
    title: '2024 MINI CLUBMAN S',
    subtitle: 'UNTOLD EDITION',
    folder: 'cars/mini/mini-clubman-untold-2024',
    photos: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg',
      '07.jpg', '08.jpg', '09.jpg', '10.jpg'
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
    status: 'sold',
    brand: 'benz',
    title: '2025 BENZ E200',
    subtitle: 'LUXURY',
    folder: 'cars/benz/benz-e200-luxury-2025',
    photos: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg',
      '07.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg'
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
    status: 'sold',
    brand: 'benz',
    title: 'BENZ GLC 300',
    subtitle: '',
    folder: 'cars/benz/benz-glc300-black',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
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
    status: 'sold',
    brand: 'mini',
    title: 'MINI CLUBMAN',
    subtitle: 'JCW',
    folder: 'cars/mini/mini-clubman-jcw-black',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg'],
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
    subtitle: 'JCW ALL4',
    folder: 'cars/mini/mini-clubman-jcw-all4-2024',
    photos: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg',
      '07.jpg', '08.jpg', '09.jpg'
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
    subtitle: 'AMG',
    folder: 'cars/benz/benz-cla45s-amg-2023',
    photos: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg',
      '07.jpg', '08.jpg', '09.jpg'
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
    subtitle: 'AMG',
    folder: 'cars/benz/benz-glc43-amg-white-2025',
    photos: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg',
      '07.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg',
      '13.jpg', '14.jpg'
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
    subtitle: '',
    folder: 'cars/benz/benz-e200',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'],
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
    subtitle: 'AMG',
    folder: 'cars/benz/benz-e53',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
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
    subtitle: '',
    folder: 'cars/benz/benz-glb250',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
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
    subtitle: 'AMG',
    folder: 'cars/benz/benz-glb35-amg',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
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
    subtitle: 'COUPE',
    folder: 'cars/benz/benz-glc43-coupe',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
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
    subtitle: '',
    folder: 'cars/benz/benz-gle450-black',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'],
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
    subtitle: 'COUPE',
    folder: 'cars/benz/benz-gle450-coupe',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
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
    subtitle: '',
    folder: 'cars/benz/benz-gle450-white',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'],
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
    subtitle: 'AMG',
    folder: 'cars/benz/benz-gle53-amg',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
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
    subtitle: 'AMG',
    folder: 'cars/benz/benz-gt53-amg',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'],
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
    subtitle: 'COUPE',
    folder: 'cars/benz/benz-glc300-coupe',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg'],
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
    subtitle: '',
    folder: 'cars/porsche/porsche-macan',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
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
    subtitle: 'S',
    folder: 'cars/porsche/porsche-macan-s',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'],
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
    folder: 'cars/mini/mini-cabrio-seaside-2023',
    photos: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg',
      '07.jpg', '08.jpg', '09.jpg', '10.jpg'
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
    folder: 'cars/benz/benz-glc43-black-2025',
    photos: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg',
      '07.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg'
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
// 所有車輛照片都放在 images/cars/<品牌>/<車輛id>/ 底下，檔名 01.jpg、02.jpg…
function photoUrl(car, index) {
  const filename = car.photos[index];
  return 'images/' + encodeURIComponent(car.folder).replace(/%2F/g, '/') + '/' + encodeURIComponent(filename);
}

function carsByStatus(status) {
  return CARS.filter(c => c.status === status);
}

function findCar(id) {
  return CARS.find(c => c.id === id);
}
