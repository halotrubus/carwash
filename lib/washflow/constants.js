// WashFlow master business data & domain constants

export const DB_KEY = 'washflow_db_v1';
export const SESSION_KEY = 'washflow_session_v1';

export const ROLES = {
  admin: { id: 'admin', label: 'Admin / Owner', desc: 'Dashboard, laporan, master data & pengaturan' },
  operator: { id: 'operator', label: 'Operator', desc: 'Terima kendaraan, inspeksi & antrean cuci' },
  kasir: { id: 'kasir', label: 'Kasir', desc: 'Pembayaran, diskon, struk & riwayat' },
};

export const VEHICLE_CATEGORIES = [
  { id: 'motor', name: 'Motor', type: 'motor' },
  { id: 'mobil_kecil', name: 'Mobil Kecil', type: 'mobil' },
  { id: 'mobil_sedang', name: 'Mobil Sedang / MPV', type: 'mobil' },
  { id: 'mobil_besar', name: 'Mobil Besar / SUV', type: 'mobil' },
  { id: 'pickup_van', name: 'Pickup / Van', type: 'mobil' },
  { id: 'truk', name: 'Truk', type: 'truk' },
  { id: 'bus', name: 'Bus', type: 'bus' },
];

export const SERVICE_PACKAGES = [
  { id: 'reguler', name: 'Cuci Reguler', desc: 'Cuci body luar + keringkan' },
  { id: 'premium', name: 'Cuci Premium', desc: 'Body + semir ban + dashboard' },
  { id: 'interior', name: 'Cuci Interior', desc: 'Vacuum + pembersihan kabin' },
  { id: 'komplit', name: 'Cuci Komplit', desc: 'Eksterior + interior menyeluruh' },
];

export const DIRTINESS = [
  { id: 'ringan', name: 'Ringan', color: 'emerald' },
  { id: 'sedang', name: 'Sedang', color: 'amber' },
  { id: 'berat', name: 'Berat', color: 'red' },
];

export const ADDONS = [
  { id: 'wax', name: 'Wax / Coating' },
  { id: 'vacuum', name: 'Vacuum Mendalam' },
  { id: 'pengharum', name: 'Pengharum' },
  { id: 'jok', name: 'Pembersihan Jok' },
  { id: 'poles_ban', name: 'Poles Ban' },
];

// Order status flow
export const STATUS_FLOW = ['menunggu', 'dicuci', 'finishing', 'selesai', 'menunggu_pembayaran', 'dibayar'];

export const STATUS_META = {
  menunggu: { label: 'Menunggu', color: 'slate', next: 'dicuci', nextLabel: 'Mulai Cuci' },
  dicuci: { label: 'Dicuci', color: 'cyan', next: 'finishing', nextLabel: 'Ke Finishing' },
  finishing: { label: 'Finishing', color: 'violet', next: 'selesai', nextLabel: 'Tandai Selesai' },
  selesai: { label: 'Selesai', color: 'emerald', next: 'menunggu_pembayaran', nextLabel: 'Kirim ke Kasir' },
  menunggu_pembayaran: { label: 'Menunggu Pembayaran', color: 'orange', next: 'dibayar', nextLabel: 'Proses Bayar' },
  dibayar: { label: 'Dibayar / Diambil', color: 'green', next: null, nextLabel: null },
};

export const PAYMENT_METHODS = [
  { id: 'tunai', name: 'Tunai' },
  { id: 'qris', name: 'QRIS' },
  { id: 'transfer', name: 'Transfer' },
];

export const DISCOUNT_LIMIT_NOMINAL = 20000;
export const DISCOUNT_LIMIT_PERCENT = 10;

// Inspection checklist templates per vehicle type
export const CHECKLIST_TEMPLATES = {
  motor: [
    { id: 'bodi', label: 'Bodi motor' },
    { id: 'jok', label: 'Jok' },
    { id: 'velg', label: 'Velg & ban' },
    { id: 'rantai', label: 'Rantai / kolong' },
  ],
  mobil: [
    { id: 'eksterior', label: 'Eksterior / bodi' },
    { id: 'kabin', label: 'Interior / kabin' },
    { id: 'ban', label: 'Ban & kolong' },
    { id: 'bagasi', label: 'Bagasi' },
  ],
  truk: [
    { id: 'kabin', label: 'Kabin' },
    { id: 'roda', label: 'Roda' },
    { id: 'kolong', label: 'Kolong' },
    { id: 'bak', label: 'Bak / box' },
  ],
  bus: [
    { id: 'eksterior', label: 'Eksterior' },
    { id: 'penumpang', label: 'Area penumpang' },
    { id: 'kursi', label: 'Kursi' },
    { id: 'lorong', label: 'Lorong' },
    { id: 'bagasi', label: 'Bagasi' },
  ],
};

// Common trip / condition indicators (applies to all)
export const TRIP_CONDITIONS = [
  { id: 'noda_bau', label: 'Noda / bau khusus' },
  { id: 'perjalanan', label: 'Kondisi perjalanan (kota/hujan/tanah/proyek)' },
];

export function getCategory(id) {
  return VEHICLE_CATEGORIES.find((c) => c.id === id);
}
export function getPackage(id) {
  return SERVICE_PACKAGES.find((p) => p.id === id);
}
export function getAddon(id) {
  return ADDONS.find((a) => a.id === id);
}
export function getChecklistFor(categoryId) {
  const cat = getCategory(categoryId);
  const base = CHECKLIST_TEMPLATES[cat?.type] || CHECKLIST_TEMPLATES.mobil;
  return [...base, ...TRIP_CONDITIONS];
}
