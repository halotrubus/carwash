'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { DB_KEY, SESSION_KEY, STATUS_FLOW } from './constants';
import { buildSeed } from './seed';
import { computePrice } from './pricing';

const WashflowContext = createContext(null);

function loadDb() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveDb(db) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {}
}

export function WashflowProvider({ children }) {
  const [db, setDb] = useState(null);
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  // Load / seed on mount (client only -> SSR safe)
  useEffect(() => {
    let data = loadDb();
    if (!data) {
      data = buildSeed();
      saveDb(data);
    }
    setDb(data);
    try {
      const s = window.localStorage.getItem(SESSION_KEY);
      if (s) setSession(JSON.parse(s));
    } catch (e) {}
    setReady(true);
  }, []);

  const persist = useCallback((updater) => {
    setDb((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveDb(next);
      return next;
    });
  }, []);

  const now = () => new Date().toISOString();

  // ---- Auth ----
  const login = useCallback((role) => {
    setDb((prev) => {
      const user = prev?.users?.find((u) => u.role === role) || { id: 'u_' + role, name: role, role };
      const s = { userId: user.id, role, name: user.name };
      try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
      setSession(s);
      return prev;
    });
  }, []);

  const logout = useCallback(() => {
    try { window.localStorage.removeItem(SESSION_KEY); } catch (e) {}
    setSession(null);
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = buildSeed();
    saveDb(fresh);
    setDb(fresh);
  }, []);

  // ---- Lookups ----
  const findVehicleByPlate = useCallback((plate) => {
    if (!db || !plate) return null;
    const norm = plate.trim().toUpperCase().replace(/\s+/g, ' ');
    return db.vehicles.find((v) => v.plate.toUpperCase().replace(/\s+/g, ' ') === norm) || null;
  }, [db]);

  const vehicleHistory = useCallback((vehicleId) => {
    if (!db) return [];
    return db.orders.filter((o) => o.vehicleId === vehicleId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [db]);

  const getCustomer = useCallback((id) => db?.customers.find((c) => c.id === id), [db]);
  const getVehicle = useCallback((id) => db?.vehicles.find((v) => v.id === id), [db]);
  const getInspection = useCallback((id) => db?.inspections.find((i) => i.id === id), [db]);
  const getPayment = useCallback((id) => db?.payments.find((p) => p.id === id), [db]);

  // ---- Create order (receive vehicle) ----
  const createOrder = useCallback((payload) => {
    let created;
    persist((prev) => {
      const next = { ...prev };
      next.customers = [...prev.customers];
      next.vehicles = [...prev.vehicles];
      next.inspections = [...prev.inspections];
      next.orders = [...prev.orders];

      const plateNorm = payload.plate.trim().toUpperCase().replace(/\s+/g, ' ');
      let vehicle = next.vehicles.find((v) => v.plate.toUpperCase().replace(/\s+/g, ' ') === plateNorm);
      let customer;
      if (vehicle) {
        customer = next.customers.find((c) => c.id === vehicle.customerId);
        if (customer && (payload.customerName || payload.whatsapp)) {
          customer = { ...customer, name: payload.customerName || customer.name, whatsapp: payload.whatsapp || customer.whatsapp };
          next.customers = next.customers.map((c) => (c.id === customer.id ? customer : c));
        }
        vehicle = { ...vehicle, categoryId: payload.categoryId || vehicle.categoryId, brand: payload.brand || vehicle.brand, color: payload.color || vehicle.color };
        next.vehicles = next.vehicles.map((v) => (v.id === vehicle.id ? vehicle : v));
      } else {
        customer = { id: 'c_' + uuid().slice(0, 8), name: payload.customerName || 'Pelanggan', whatsapp: payload.whatsapp || '' };
        next.customers.push(customer);
        vehicle = { id: 'v_' + uuid().slice(0, 8), plate: plateNorm, categoryId: payload.categoryId, brand: payload.brand || '', color: payload.color || '', customerId: customer.id };
        next.vehicles.push(vehicle);
      }

      const insp = payload.inspection || {};
      const inspection = {
        id: 'insp_' + uuid().slice(0, 8), vehicleId: vehicle.id, categoryId: vehicle.categoryId,
        indicators: insp.indicators || {}, recommended: insp.recommended, chosen: insp.chosen,
        reason: insp.reason || '', visualNotes: insp.visualNotes || '', photos: insp.photos || [],
        createdAt: now(),
      };
      next.inspections.push(inspection);

      const counters = { ...prev.counters };
      counters.order += 1; counters.queue += 1;
      const createdAt = now();
      const d = new Date(createdAt);
      const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      const snap = computePrice(prev, { categoryId: vehicle.categoryId, packageId: payload.packageId, dirtiness: insp.chosen, addonIds: payload.addonIds || [] }, 0);

      const order = {
        id: 'ord_' + uuid().slice(0, 8), orderNo: `WF-${ymd}-${String(counters.order).padStart(3, '0')}`,
        queueNo: counters.queue, vehicleId: vehicle.id, customerId: customer.id, categoryId: vehicle.categoryId,
        packageId: payload.packageId, dirtiness: insp.chosen, addonIds: payload.addonIds || [],
        inspectionId: inspection.id, approved: true, operatorNote: payload.operatorNote || '', resultNote: '',
        photosBefore: insp.photos || [], photosAfter: [], status: 'menunggu',
        statusHistory: [{ status: 'menunggu', at: createdAt }], createdAt, discount: 0, priceSnapshot: snap, paymentId: null,
      };
      next.orders.push(order);
      next.counters = counters;
      created = order;
      return next;
    });
    return created;
  }, [persist]);

  const updateOrderStatus = useCallback((orderId, status) => {
    persist((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId
        ? { ...o, status, statusHistory: [...o.statusHistory, { status, at: now() }] }
        : o)),
    }));
  }, [persist]);

  const advanceOrder = useCallback((orderId) => {
    persist((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id !== orderId) return o;
        const idx = STATUS_FLOW.indexOf(o.status);
        const nextStatus = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
        if (nextStatus === o.status) return o;
        return { ...o, status: nextStatus, statusHistory: [...o.statusHistory, { status: nextStatus, at: now() }] };
      }),
    }));
  }, [persist]);

  const addOrderResult = useCallback((orderId, { resultNote, photosAfter }) => {
    persist((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId
        ? { ...o, resultNote: resultNote ?? o.resultNote, photosAfter: photosAfter ?? o.photosAfter }
        : o)),
    }));
  }, [persist]);

  const createPayment = useCallback((orderId, { method, discount = 0, discountType = 'nominal' }) => {
    let pay;
    persist((prev) => {
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order) return prev;
      const counters = { ...prev.counters, invoice: prev.counters.invoice + 1 };
      const snap = computePrice(prev, order, discount);
      const d = new Date();
      const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      pay = {
        id: 'pay_' + uuid().slice(0, 8), orderId, invoiceNo: `INV-${ymd}-${String(counters.invoice).padStart(3, '0')}`,
        method, discount, discountType, subtotal: snap.subtotal, total: snap.total, cashierId: session?.userId || 'u_kasir', createdAt: now(),
      };
      const at = now();
      return {
        ...prev,
        counters,
        payments: [...prev.payments, pay],
        orders: prev.orders.map((o) => (o.id === orderId
          ? { ...o, status: 'dibayar', discount, priceSnapshot: snap, paymentId: pay.id, statusHistory: [...o.statusHistory, { status: 'dibayar', at }] }
          : o)),
      };
    });
    return pay;
  }, [persist, session]);

  // ---- Master data editing ----
  const updateOutlet = useCallback((patch) => persist((prev) => ({ ...prev, outlet: { ...prev.outlet, ...patch } })), [persist]);
  const updatePriceCell = useCallback((categoryId, packageId, dirtiness, value) => persist((prev) => {
    const matrix = { ...prev.pricingMatrix };
    matrix[categoryId] = { ...matrix[categoryId] };
    matrix[categoryId][packageId] = { ...matrix[categoryId][packageId], [dirtiness]: Number(value) || 0 };
    return { ...prev, pricingMatrix: matrix };
  }), [persist]);
  const updateAddonPrice = useCallback((addonId, value) => persist((prev) => ({ ...prev, addonPrices: { ...prev.addonPrices, [addonId]: Number(value) || 0 } })), [persist]);

  const value = {
    db, session, ready,
    login, logout, resetDemo,
    findVehicleByPlate, vehicleHistory, getCustomer, getVehicle, getInspection, getPayment,
    createOrder, updateOrderStatus, advanceOrder, addOrderResult, createPayment,
    updateOutlet, updatePriceCell, updateAddonPrice,
  };

  return <WashflowContext.Provider value={value}>{children}</WashflowContext.Provider>;
}

export function useWashflow() {
  const ctx = useContext(WashflowContext);
  if (!ctx) throw new Error('useWashflow must be used within WashflowProvider');
  return ctx;
}
