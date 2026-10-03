import {
  VEHICLE_CATEGORIES, SERVICE_PACKAGES, ADDONS, DIRTINESS, STATUS_FLOW,
} from './constants';

export const DEMO_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxjYXIlMjB3YXNofGVufDB8fHx8MTc5MDk4NDkwMnww&ixlib=rb-4.1.0&q=85',
  dirty: [
    'https://images.unsplash.com/photo-1702235548944-87199c005acb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxkaXJ0eSUyMGNhcnxlbnwwfHx8fDE3OTA5ODQ5MDJ8MA&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1586733564032-3db923113ff0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwxfHxtdWRkeSUyMHZlaGljbGV8ZW58MHx8fHwxNzkwOTg0OTExfDA&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1554863804-69546eb96737?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHxtdWRkeSUyMHZlaGljbGV8ZW58MHx8fHwxNzkwOTg0OTExfDA&ixlib=rb-4.1.0&q=85',
  ],
};

const round1000 = (n) => Math.round(n / 1000) * 1000;

const CATEGORY_BASE = {
  motor: 15000, mobil_kecil: 35000, mobil_sedang: 45000, mobil_besar: 55000,
  pickup_van: 50000, truk: 90000, bus: 150000,
};
const PKG_MULT = { reguler: 1.0, premium: 1.6, interior: 1.4, komplit: 2.2 };
const DIRT_MULT = { ringan: 1.0, sedang: 1.3, berat: 1.7 };

function buildPricingMatrix() {
  const m = {};
  VEHICLE_CATEGORIES.forEach((c) => {
    m[c.id] = {};
    SERVICE_PACKAGES.forEach((p) => {
      m[c.id][p.id] = {};
      DIRTINESS.forEach((d) => {
        m[c.id][p.id][d.id] = round1000(CATEGORY_BASE[c.id] * PKG_MULT[p.id] * DIRT_MULT[d.id]);
      });
    });
  });
  return m;
}

const ADDON_PRICES = { wax: 25000, vacuum: 20000, pengharum: 10000, jok: 30000, poles_ban: 15000 };

function priceOf(matrix, cat, pkg, dirt, addonIds, discount = 0) {
  const base = matrix[cat][pkg][dirt];
  const addonItems = addonIds.map((id) => ({ id, name: ADDONS.find((a) => a.id === id)?.name, price: ADDON_PRICES[id] }));
  const addonTotal = addonItems.reduce((s, a) => s + a.price, 0);
  const subtotal = base + addonTotal;
  return { base, addonItems, addonTotal, subtotal, discount, total: Math.max(0, subtotal - discount) };
}

const iso = (d) => d.toISOString();
function minsAgo(m) { return iso(new Date(Date.now() - m * 60000)); }
function dayAt(daysAgo, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return iso(d);
}

export function buildSeed() {
  const matrix = buildPricingMatrix();

  const outlet = {
    name: 'WashFlow Carwash — Cabang Utama',
    address: 'Jl. Merdeka No. 12, Jakarta Pusat',
    phone: '0812-3456-7890',
    footer: 'Terima kasih telah mencuci di WashFlow!',
  };

  const users = [
    { id: 'u_admin', name: 'Budi Santoso', role: 'admin', initial: 'BS' },
    { id: 'u_op', name: 'Andi Pratama', role: 'operator', initial: 'AP' },
    { id: 'u_kasir', name: 'Sari Dewi', role: 'kasir', initial: 'SD' },
  ];

  const customers = [
    { id: 'c1', name: 'Budi Hartono', whatsapp: '081234567001' },
    { id: 'c2', name: 'Siti Aminah', whatsapp: '081234567002' },
    { id: 'c3', name: 'Agus Wijaya', whatsapp: '081234567003' },
    { id: 'c4', name: 'Dewi Lestari', whatsapp: '081234567004' },
    { id: 'c5', name: 'Rudi Salim', whatsapp: '081234567005' },
    { id: 'c6', name: 'Maya Putri', whatsapp: '081234567006' },
    { id: 'c7', name: 'PT Logistik Jaya', whatsapp: '081234567007' },
    { id: 'c8', name: 'Rina Melati', whatsapp: '081234567008' },
    { id: 'c9', name: 'Hendra Gunawan', whatsapp: '081234567009' },
  ];

  const vehicles = [
    { id: 'v1', plate: 'B 1234 ABC', categoryId: 'mobil_kecil', brand: 'Toyota Agya', color: 'Merah', customerId: 'c1' },
    { id: 'v2', plate: 'B 1235 ZZ', categoryId: 'motor', brand: 'Honda Beat', color: 'Hitam', customerId: 'c1' },
    { id: 'v3', plate: 'B 5678 XYZ', categoryId: 'mobil_sedang', brand: 'Honda Mobilio', color: 'Putih', customerId: 'c2' },
    { id: 'v4', plate: 'D 4321 KLM', categoryId: 'motor', brand: 'Honda Vario', color: 'Biru', customerId: 'c3' },
    { id: 'v5', plate: 'B 9988 QRS', categoryId: 'mobil_besar', brand: 'Toyota Fortuner', color: 'Hitam', customerId: 'c4' },
    { id: 'v6', plate: 'F 1122 GH', categoryId: 'pickup_van', brand: 'Suzuki Carry', color: 'Biru', customerId: 'c5' },
    { id: 'v7', plate: 'B 2468 MNO', categoryId: 'motor', brand: 'Yamaha NMAX', color: 'Abu-abu', customerId: 'c6' },
    { id: 'v8', plate: 'L 7777 BA', categoryId: 'truk', brand: 'Mitsubishi Fuso', color: 'Kuning', customerId: 'c7' },
    { id: 'v9', plate: 'B 3030 US', categoryId: 'bus', brand: 'Hino R260', color: 'Putih', customerId: 'c7' },
    { id: 'v10', plate: 'B 4455 TY', categoryId: 'mobil_kecil', brand: 'Daihatsu Ayla', color: 'Silver', customerId: 'c8' },
    { id: 'v11', plate: 'AB 8899 CD', categoryId: 'mobil_sedang', brand: 'Toyota Avanza', color: 'Abu-abu', customerId: 'c9' },
  ];

  const vMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
  const inspections = [];
  const orders = [];
  const payments = [];
  let orderCounter = 0; let queueCounter = 0; let invoiceCounter = 0;

  const ymd = (isoStr) => {
    const d = new Date(isoStr);
    return `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  };

  function makeInspection(veh, level, { reason = '', chosen = null, notes = '', photos = [] } = {}, createdAt) {
    const id = `insp_${inspections.length + 1}`;
    const indicators = {};
    inspections.push({
      id, vehicleId: veh.id, categoryId: veh.categoryId, indicators,
      recommended: level, chosen: chosen || level, reason, visualNotes: notes, photos, createdAt,
    });
    return id;
  }

  function makeOrder({ veh, pkg, dirt, addons, status, createdAt, discount = 0, insp = {} }) {
    orderCounter += 1; queueCounter += 1;
    const snap = priceOf(matrix, veh.categoryId, pkg, dirt, addons, discount);
    const inspectionId = makeInspection(veh, dirt, insp, createdAt);
    const orderNo = `WF-${ymd(createdAt)}-${String(orderCounter).padStart(3, '0')}`;
    const idx = STATUS_FLOW.indexOf(status);
    const statusHistory = [];
    const baseT = new Date(createdAt).getTime();
    for (let i = 0; i <= idx; i++) {
      statusHistory.push({ status: STATUS_FLOW[i], at: iso(new Date(baseT + i * 12 * 60000)) });
    }
    const order = {
      id: `ord_${orderCounter}`, orderNo, queueNo: queueCounter,
      vehicleId: veh.id, customerId: veh.customerId, categoryId: veh.categoryId,
      packageId: pkg, dirtiness: dirt, addonIds: addons, inspectionId,
      approved: true, operatorNote: insp.operatorNote || '', resultNote: '',
      photosBefore: insp.photos || [], photosAfter: [],
      status, statusHistory, createdAt, discount, priceSnapshot: snap, paymentId: null,
    };
    orders.push(order);
    return order;
  }

  function makePayment(order, { method, discount = 0, discountType = 'nominal' }, paidAt) {
    invoiceCounter += 1;
    const snap = priceOf(matrix, order.categoryId, order.packageId, order.dirtiness, order.addonIds, discount);
    const invoiceNo = `INV-${ymd(paidAt)}-${String(invoiceCounter).padStart(3, '0')}`;
    const pay = {
      id: `pay_${invoiceCounter}`, orderId: order.id, invoiceNo, method,
      discount, discountType, subtotal: snap.subtotal, total: snap.total,
      cashierId: 'u_kasir', createdAt: paidAt,
    };
    payments.push(pay);
    order.paymentId = pay.id;
    order.discount = discount;
    order.priceSnapshot = snap;
    return pay;
  }

  // --- Active queue today: one order per status ---
  makeOrder({ veh: vMap.v3, pkg: 'premium', dirt: 'sedang', addons: ['wax'], status: 'menunggu', createdAt: minsAgo(8) });
  makeOrder({ veh: vMap.v4, pkg: 'reguler', dirt: 'ringan', addons: [], status: 'dicuci', createdAt: minsAgo(25) });
  makeOrder({
    veh: vMap.v5, pkg: 'komplit', dirt: 'berat', addons: ['vacuum', 'jok', 'pengharum'], status: 'finishing', createdAt: minsAgo(55),
    insp: {
      notes: 'Lumpur tebal di kolong & spakbor, interior sangat kotor bekas proyek. Terdapat baret halus pintu kiri.',
      operatorNote: 'Kendaraan bekas jalan proyek, butuh pencucian ekstra pada kolong.',
      photos: DEMO_IMAGES.dirty,
    },
  });
  makeOrder({ veh: vMap.v6, pkg: 'interior', dirt: 'sedang', addons: ['vacuum'], status: 'selesai', createdAt: minsAgo(80) });
  makeOrder({ veh: vMap.v7, pkg: 'reguler', dirt: 'ringan', addons: [], status: 'menunggu_pembayaran', createdAt: minsAgo(95) });

  // A paid order earlier today
  const todayPaid = makeOrder({ veh: vMap.v1, pkg: 'premium', dirt: 'sedang', addons: ['poles_ban'], status: 'dibayar', createdAt: dayAt(0, 8, 15) });
  makePayment(todayPaid, { method: 'qris', discount: 0 }, dayAt(0, 8, 45));

  // --- Past 7 days completed & paid transactions ---
  const pkgIds = ['reguler', 'premium', 'interior', 'komplit'];
  const dirts = ['ringan', 'sedang', 'berat'];
  const methods = ['tunai', 'qris', 'transfer'];
  const addonSets = [[], ['wax'], ['vacuum'], ['pengharum', 'poles_ban'], ['jok']];
  let seedN = 7;
  for (let d = 1; d <= 7; d++) {
    const count = 2 + (d % 3); // 2-4 per day
    for (let k = 0; k < count; k++) {
      seedN = (seedN * 7 + 13) % 97;
      const veh = vehicles[seedN % vehicles.length];
      const pkg = pkgIds[(seedN + k) % pkgIds.length];
      const dirt = dirts[(seedN + d) % dirts.length];
      const addons = addonSets[(seedN + k) % addonSets.length];
      const method = methods[(seedN + d + k) % methods.length];
      const discount = (seedN % 4 === 0) ? 10000 : 0;
      const created = dayAt(d, 9 + (k * 2) % 8, (seedN % 50));
      const o = makeOrder({ veh, pkg, dirt, addons, status: 'dibayar', createdAt: created });
      makePayment(o, { method, discount }, dayAt(d, 9 + (k * 2) % 8, (seedN % 50) + 20));
    }
  }

  return {
    version: 1,
    outlet,
    users,
    pricingMatrix: matrix,
    addonPrices: { ...ADDON_PRICES },
    customers,
    vehicles,
    inspections,
    orders,
    payments,
    counters: { order: orderCounter, queue: queueCounter, invoice: invoiceCounter },
  };
}
