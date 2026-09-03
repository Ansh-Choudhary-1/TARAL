import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { getOrSeed, set as writeStorage, remove as removeStorage, STORAGE_KEYS, RESETTABLE_KEYS } from '../lib/storage';
import {
  seedOrders,
  seedProducts,
  seedFuelData,
  seedFleetUnits,
  seedMonitoringUnits,
  seedReports,
  type Order,
  type OrderStatus,
  type Product,
  type FuelData,
  type FleetUnit,
  type MonitoringUnit,
  type MonitoringLog,
  type SavedReport,
  type Inquiry,
  type Quote,
  type CreditTrade,
} from '../lib/seedData';
const TRACKING_LABELS = ['Order Placed', 'Production Started', 'Quality Check', 'Dispatched', 'Delivered'];
const COMPLETED_BY_STATUS: Record<OrderStatus, number> = {
  Processing: 2,
  'In Transit': 4,
  Delivered: 5,
  Cancelled: 0,
};

/** Fallback ₹/MT price by fuel name, sourced from the marketplace catalogue. */
const FUEL_PRICE: Record<string, number> = {
  'Biomass Pellets': 2400,
  'Premium Biomass Pellets': 2400,
  Briquettes: 2600,
  'Agricultural Briquettes': 2600,
  'RDF Pellets': 2200,
  'RDF Pellets (Industrial)': 2200,
  'Wood Chip Pellets': 2350,
  Coal: 2800,
  Diesel: 7200,
  'Natural Gas': 3200,
};

function nowStamp(): string {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildTrackingSteps(status: OrderStatus, deliveryDate: string, previous?: Order['trackingSteps']): Order['trackingSteps'] {
  if (status === 'Cancelled') {
    return (previous ?? TRACKING_LABELS.map((step) => ({ step, completed: false, date: 'Cancelled' }))).map((s) => ({
      ...s,
    }));
  }
  const completed = COMPLETED_BY_STATUS[status];
  return TRACKING_LABELS.map((label, i) => {
    const prev = previous?.[i];
    const isCompleted = i < completed;
    if (isCompleted) {
      return { step: label, completed: true, date: prev?.completed ? prev.date : nowStamp() };
    }
    if (label === 'Delivered') return { step: label, completed: false, date: `Expected: ${deliveryDate}` };
    return { step: label, completed: false, date: i === completed ? 'In Progress' : 'Pending' };
  });
}

export interface CreateOrderInput {
  fuel: string;
  quantity: number;
  unitPrice?: number;
  buyerEmail: string;
  company: string;
  supplier?: string;
  location?: string;
}

interface DataContextType {
  orders: Order[];
  products: Product[];
  fuelData: FuelData[];
  fleetUnits: FleetUnit[];
  monitoringUnits: MonitoringUnit[];
  reports: SavedReport[];
  inquiries: Inquiry[];
  quotes: Quote[];
  creditTrades: CreditTrade[];

  addOrder: (input: CreateOrderInput) => Order;
  setOrderStatus: (id: string, status: OrderStatus) => void;

  addInquiry: (input: Omit<Inquiry, 'id' | 'createdAt'>) => Inquiry;
  addQuote: (input: Omit<Quote, 'id' | 'createdAt'>) => Quote;
  addReport: (input: Omit<SavedReport, 'id'>) => SavedReport;
  addCreditTrade: (amount: number) => CreditTrade;

  updateFleetUnit: (id: string, updates: Partial<FleetUnit>) => void;
  updateMonitoringUnit: (id: string, updates: Partial<MonitoringUnit>) => void;
  addMonitoringLog: (id: string, entry: MonitoringLog) => void;

  priceForFuel: (fuel: string) => number;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function usePersistentState<T>(key: string, seed: T) {
  const [state, setRaw] = useState<T>(() => getOrSeed(key, seed));
  const setState = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setRaw((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
        writeStorage(key, next);
        return next;
      });
    },
    [key],
  );
  return [state, setState] as const;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = usePersistentState<Order[]>(STORAGE_KEYS.orders, seedOrders);
  const [products, setProducts] = usePersistentState<Product[]>(STORAGE_KEYS.products, seedProducts);
  const [fuelData, setFuelData] = usePersistentState<FuelData[]>(STORAGE_KEYS.fuelData, seedFuelData);
  const [fleetUnits, setFleetUnits] = usePersistentState<FleetUnit[]>(STORAGE_KEYS.fleetUnits, seedFleetUnits);
  const [monitoringUnits, setMonitoringUnits] = usePersistentState<MonitoringUnit[]>(
    STORAGE_KEYS.monitoringUnits,
    seedMonitoringUnits,
  );
  const [reports, setReports] = usePersistentState<SavedReport[]>(STORAGE_KEYS.reports, seedReports);
  const [inquiries, setInquiries] = usePersistentState<Inquiry[]>(STORAGE_KEYS.inquiries, []);
  const [quotes, setQuotes] = usePersistentState<Quote[]>(STORAGE_KEYS.quotes, []);
  const [creditTrades, setCreditTrades] = usePersistentState<CreditTrade[]>(STORAGE_KEYS.creditTrades, []);

  const priceForFuel = useCallback(
    (fuel: string) => {
      const product = products.find((p) => p.name === fuel || p.name.includes(fuel) || fuel.includes(p.name));
      return product?.price ?? FUEL_PRICE[fuel] ?? 2500;
    },
    [products],
  );

  const addOrder = useCallback(
    (input: CreateOrderInput): Order => {
      const unitPrice = input.unitPrice ?? priceForFuel(input.fuel);
      const quantity = Math.max(1, Math.round(input.quantity));
      const deliveryDate = addDays(4);
      const match = products.find((p) => p.name === input.fuel || p.name.includes(input.fuel));
      const year = new Date().getFullYear();
      const seq = orders.filter((o) => o.id.startsWith(`ORD-${year}-`)).length + 1;

      const order: Order = {
        id: `ORD-${year}-${String(seq).padStart(3, '0')}`,
        fuel: input.fuel,
        quantity,
        supplier: input.supplier ?? match?.supplier ?? 'TARAL Unit TR-001',
        location: input.location ?? match?.location ?? 'Pune Industrial Area',
        status: 'Processing',
        orderDate: today(),
        deliveryDate,
        unitPrice,
        total: unitPrice * quantity,
        buyerEmail: input.buyerEmail,
        company: input.company,
        trackingSteps: buildTrackingSteps('Processing', deliveryDate),
      };

      setOrders((prev) => [order, ...prev]);
      if (match) {
        setProducts((prev) =>
          prev.map((p) => (p.id === match.id ? { ...p, inStock: Math.max(0, p.inStock - quantity) } : p)),
        );
      }
      return order;
    },
    [orders, priceForFuel, products, setOrders, setProducts],
  );

  const setOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o;
          const deliveryDate = status === 'Delivered' ? today() : o.deliveryDate;
          return {
            ...o,
            status,
            deliveryDate,
            trackingSteps: buildTrackingSteps(status, deliveryDate, o.trackingSteps),
          };
        }),
      );
    },
    [setOrders],
  );

  const addInquiry = useCallback(
    (input: Omit<Inquiry, 'id' | 'createdAt'>): Inquiry => {
      const inquiry: Inquiry = { ...input, id: `INQ-${Date.now()}`, createdAt: nowStamp() };
      setInquiries((prev) => [inquiry, ...prev]);
      return inquiry;
    },
    [setInquiries],
  );

  const addQuote = useCallback(
    (input: Omit<Quote, 'id' | 'createdAt'>): Quote => {
      const quote: Quote = { ...input, id: `QT-${Date.now()}`, createdAt: nowStamp() };
      setQuotes((prev) => [quote, ...prev]);
      return quote;
    },
    [setQuotes],
  );

  const addReport = useCallback(
    (input: Omit<SavedReport, 'id'>): SavedReport => {
      const report: SavedReport = { ...input, id: `RPT-${Date.now()}` };
      setReports((prev) => [report, ...prev]);
      return report;
    },
    [setReports],
  );

  const addCreditTrade = useCallback(
    (amount: number): CreditTrade => {
      const trade: CreditTrade = { id: `TRD-${Date.now()}`, amount, createdAt: nowStamp() };
      setCreditTrades((prev) => [trade, ...prev]);
      return trade;
    },
    [setCreditTrades],
  );

  const updateFleetUnit = useCallback(
    (id: string, updates: Partial<FleetUnit>) => {
      setFleetUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    },
    [setFleetUnits],
  );

  const updateMonitoringUnit = useCallback(
    (id: string, updates: Partial<MonitoringUnit>) => {
      setMonitoringUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    },
    [setMonitoringUnits],
  );

  const addMonitoringLog = useCallback(
    (id: string, entry: MonitoringLog) => {
      setMonitoringUnits((prev) =>
        prev.map((u) => (u.id === id ? { ...u, logs: [entry, ...u.logs].slice(0, 25) } : u)),
      );
    },
    [setMonitoringUnits],
  );

  const resetDemoData = useCallback(() => {
    RESETTABLE_KEYS.forEach(removeStorage);
    setOrders(seedOrders);
    setProducts(seedProducts);
    setFuelData(seedFuelData);
    setFleetUnits(seedFleetUnits);
    setMonitoringUnits(seedMonitoringUnits);
    setReports(seedReports);
    setInquiries([]);
    setQuotes([]);
    setCreditTrades([]);
  }, [
    setOrders,
    setProducts,
    setFuelData,
    setFleetUnits,
    setMonitoringUnits,
    setReports,
    setInquiries,
    setQuotes,
    setCreditTrades,
  ]);

  const value = useMemo<DataContextType>(
    () => ({
      orders,
      products,
      fuelData,
      fleetUnits,
      monitoringUnits,
      reports,
      inquiries,
      quotes,
      creditTrades,
      addOrder,
      setOrderStatus,
      addInquiry,
      addQuote,
      addReport,
      addCreditTrade,
      updateFleetUnit,
      updateMonitoringUnit,
      addMonitoringLog,
      priceForFuel,
      resetDemoData,
    }),
    [
      orders,
      products,
      fuelData,
      fleetUnits,
      monitoringUnits,
      reports,
      inquiries,
      quotes,
      creditTrades,
      addOrder,
      setOrderStatus,
      addInquiry,
      addQuote,
      addReport,
      addCreditTrade,
      updateFleetUnit,
      updateMonitoringUnit,
      addMonitoringLog,
      priceForFuel,
      resetDemoData,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
