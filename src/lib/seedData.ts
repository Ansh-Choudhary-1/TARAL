/**
 * Initial seed data for every localStorage-backed collection.
 *
 * These arrays were previously hardcoded inside the individual screen
 * components. They now live here as the *first-run* state only: once a
 * collection exists in localStorage the app reads and mutates that copy.
 */

export type OrderStatus = 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface TrackingStep {
  step: string;
  completed: boolean;
  date: string;
}

export interface Order {
  id: string;
  fuel: string;
  /** Quantity in MT. */
  quantity: number;
  supplier: string;
  location: string;
  status: OrderStatus;
  orderDate: string;
  deliveryDate: string;
  /** Unit price in ₹ per MT. */
  unitPrice: number;
  /** Total order value in ₹. */
  total: number;
  /** Owner of the order — `demo` for seed orders shared by every MSME view. */
  buyerEmail: string;
  company: string;
  trackingSteps: TrackingStep[];
}

export interface Product {
  id: number;
  name: string;
  supplier: string;
  location: string;
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  availability: 'High' | 'Medium' | 'Low';
  delivery: string;
  moisture: string;
  ashContent: string;
  calorificValue: string;
  inStock: number;
  image: string;
}

export interface FuelData {
  name: string;
  costPerGCal: number;
  co2Emission: number;
  sox: number;
  nox: number;
  ashContent: number;
  disposalCost: number;
  moistureLevel: number;
  reliability: 'High' | 'Medium' | 'Low';
  recommended?: boolean;
}

export interface FleetUnit {
  id: string;
  location: string;
  status: 'Active' | 'Maintenance' | 'Offline';
  production: number;
  temperature: number;
  pressure: number;
  feedstock: string;
  /** Daily output in MT. */
  outputPerDay: number;
  efficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
  coordinates: { lat: number; lng: number };
  activeOrders: number;
  operator: string;
}

export type MonitoringStatusLevel = 'optimal' | 'warning' | 'critical';

export interface MonitoringLog {
  timestamp: string;
  event: string;
  type: 'control' | 'optimization' | 'production' | 'environmental';
}

export interface MonitoringControlSettings {
  targetTemp: number;
  targetPressure: number;
  automationLevel: 'manual' | 'semi' | 'full';
  alerts: boolean;
}

export interface MonitoringUnit {
  id: string;
  location: string;
  status: 'Active' | 'Maintenance' | 'Offline';
  temperature: number;
  pressure: number;
  humidity: number;
  efficiency: number;
  production: number;
  fuelConsumption: number;
  co2Emission: number;
  statusLevel: MonitoringStatusLevel;
  controlSettings: MonitoringControlSettings;
  logs: MonitoringLog[];
}

export interface SavedReport {
  id: string;
  name: string;
  date: string;
  type: 'PDF' | 'Excel' | 'CSV';
  size: string;
  description: string;
}

export interface Inquiry {
  id: string;
  name: string;
  company: string;
  message: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
  estimatedDelivery: string;
  createdAt: string;
}

export interface CreditTrade {
  id: string;
  amount: number;
  createdAt: string;
}

/** Seed orders are shared by every MSME dashboard/tracking view. */
export const SEED_OWNER = 'demo';

export const seedOrders: Order[] = [
  {
    id: 'ORD-2025-001',
    fuel: 'Biomass Pellets',
    quantity: 5,
    supplier: 'TARAL Unit TR-001',
    location: 'Pune Industrial Area',
    status: 'Delivered',
    orderDate: '2025-01-10',
    deliveryDate: '2025-01-12',
    unitPrice: 2400,
    total: 12000,
    buyerEmail: SEED_OWNER,
    company: 'Demo MSME',
    trackingSteps: [
      { step: 'Order Placed', completed: true, date: '2025-01-10 09:30' },
      { step: 'Production Started', completed: true, date: '2025-01-10 14:00' },
      { step: 'Quality Check', completed: true, date: '2025-01-11 10:15' },
      { step: 'Dispatched', completed: true, date: '2025-01-11 16:30' },
      { step: 'Delivered', completed: true, date: '2025-01-12 11:45' },
    ],
  },
  {
    id: 'ORD-2025-002',
    fuel: 'RDF Pellets',
    quantity: 3,
    supplier: 'TARAL Unit TR-002',
    location: 'Mumbai Port',
    status: 'In Transit',
    orderDate: '2025-01-12',
    deliveryDate: '2025-01-15',
    unitPrice: 2200,
    total: 6600,
    buyerEmail: SEED_OWNER,
    company: 'Demo MSME',
    trackingSteps: [
      { step: 'Order Placed', completed: true, date: '2025-01-12 11:20' },
      { step: 'Production Started', completed: true, date: '2025-01-12 15:45' },
      { step: 'Quality Check', completed: true, date: '2025-01-13 09:30' },
      { step: 'Dispatched', completed: true, date: '2025-01-13 14:20' },
      { step: 'Delivered', completed: false, date: 'Expected: 2025-01-15' },
    ],
  },
  {
    id: 'ORD-2025-003',
    fuel: 'Briquettes',
    quantity: 2,
    supplier: 'TARAL Unit TR-004',
    location: 'Aurangabad Zone',
    status: 'Processing',
    orderDate: '2025-01-14',
    deliveryDate: '2025-01-17',
    unitPrice: 2600,
    total: 5200,
    buyerEmail: SEED_OWNER,
    company: 'Demo MSME',
    trackingSteps: [
      { step: 'Order Placed', completed: true, date: '2025-01-14 10:15' },
      { step: 'Production Started', completed: false, date: 'In Progress' },
      { step: 'Quality Check', completed: false, date: 'Pending' },
      { step: 'Dispatched', completed: false, date: 'Pending' },
      { step: 'Delivered', completed: false, date: 'Expected: 2025-01-17' },
    ],
  },
  {
    id: 'ORD-2025-004',
    fuel: 'Wood Chip Pellets',
    quantity: 4,
    supplier: 'TARAL Unit TR-005',
    location: 'Nashik Hub',
    status: 'Cancelled',
    orderDate: '2025-01-15',
    deliveryDate: '2025-01-19',
    unitPrice: 2350,
    total: 9400,
    buyerEmail: SEED_OWNER,
    company: 'Demo MSME',
    trackingSteps: [
      { step: 'Order Placed', completed: true, date: '2025-01-15 08:40' },
      { step: 'Production Started', completed: false, date: 'Cancelled' },
      { step: 'Quality Check', completed: false, date: 'Cancelled' },
      { step: 'Dispatched', completed: false, date: 'Cancelled' },
      { step: 'Delivered', completed: false, date: 'Cancelled' },
    ],
  },
];

export const seedProducts: Product[] = [
  {
    id: 1,
    name: 'Premium Biomass Pellets',
    supplier: 'TARAL Unit TR-001',
    location: 'Pune Industrial Area',
    price: 2400,
    unit: 'per MT',
    rating: 4.8,
    reviews: 156,
    availability: 'High',
    delivery: '2-3 days',
    moisture: '8%',
    ashContent: '2%',
    calorificValue: '4200 kcal/kg',
    inStock: 250,
    image:
      'https://images.pexels.com/photos/5825528/pexels-photo-5825528.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 2,
    name: 'Agricultural Briquettes',
    supplier: 'TARAL Unit TR-002',
    location: 'Mumbai Port',
    price: 2600,
    unit: 'per MT',
    rating: 4.6,
    reviews: 89,
    availability: 'Medium',
    delivery: '3-4 days',
    moisture: '12%',
    ashContent: '4%',
    calorificValue: '3800 kcal/kg',
    inStock: 180,
    image:
      'https://images.pexels.com/photos/6394951/pexels-photo-6394951.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 3,
    name: 'RDF Pellets (Industrial)',
    supplier: 'TARAL Unit TR-004',
    location: 'Aurangabad Zone',
    price: 2200,
    unit: 'per MT',
    rating: 4.4,
    reviews: 203,
    availability: 'High',
    delivery: '1-2 days',
    moisture: '15%',
    ashContent: '15%',
    calorificValue: '3600 kcal/kg',
    inStock: 320,
    image:
      'https://images.pexels.com/photos/3735189/pexels-photo-3735189.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 4,
    name: 'Wood Chip Pellets',
    supplier: 'TARAL Unit TR-005',
    location: 'Nashik Hub',
    price: 2350,
    unit: 'per MT',
    rating: 4.9,
    reviews: 78,
    availability: 'Low',
    delivery: '4-5 days',
    moisture: '6%',
    ashContent: '1%',
    calorificValue: '4500 kcal/kg',
    inStock: 95,
    image:
      'https://images.pexels.com/photos/5825442/pexels-photo-5825442.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const seedFuelData: FuelData[] = [
  {
    name: 'Coal',
    costPerGCal: 2800,
    co2Emission: 94.6,
    sox: 1.2,
    nox: 0.8,
    ashContent: 25,
    disposalCost: 150,
    moistureLevel: 8,
    reliability: 'High',
  },
  {
    name: 'Diesel',
    costPerGCal: 7200,
    co2Emission: 74.1,
    sox: 0.5,
    nox: 1.5,
    ashContent: 0,
    disposalCost: 0,
    moistureLevel: 0,
    reliability: 'High',
  },
  {
    name: 'Biomass Pellets',
    costPerGCal: 2400,
    co2Emission: 0,
    sox: 0.02,
    nox: 0.15,
    ashContent: 2,
    disposalCost: 20,
    moistureLevel: 8,
    reliability: 'High',
    recommended: true,
  },
  {
    name: 'Briquettes',
    costPerGCal: 2600,
    co2Emission: 0,
    sox: 0.03,
    nox: 0.18,
    ashContent: 4,
    disposalCost: 30,
    moistureLevel: 12,
    reliability: 'Medium',
  },
  {
    name: 'RDF Pellets',
    costPerGCal: 2200,
    co2Emission: 15.2,
    sox: 0.8,
    nox: 0.6,
    ashContent: 15,
    disposalCost: 100,
    moistureLevel: 15,
    reliability: 'Medium',
  },
  {
    name: 'Natural Gas',
    costPerGCal: 3200,
    co2Emission: 56.1,
    sox: 0,
    nox: 0.3,
    ashContent: 0,
    disposalCost: 0,
    moistureLevel: 0,
    reliability: 'High',
  },
];

export const seedFleetUnits: FleetUnit[] = [
  {
    id: 'TR-001',
    location: 'Pune Industrial Area',
    status: 'Active',
    production: 95,
    temperature: 850,
    pressure: 2.4,
    feedstock: 'Agricultural Waste',
    outputPerDay: 12.5,
    efficiency: 92,
    lastMaintenance: '2025-01-05',
    nextMaintenance: '2025-02-05',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    activeOrders: 8,
    operator: 'Rajesh Patil',
  },
  {
    id: 'TR-002',
    location: 'Mumbai Port',
    status: 'Active',
    production: 87,
    temperature: 820,
    pressure: 2.2,
    feedstock: 'Wood Chips',
    outputPerDay: 10.8,
    efficiency: 89,
    lastMaintenance: '2025-01-08',
    nextMaintenance: '2025-02-08',
    coordinates: { lat: 19.076, lng: 72.8777 },
    activeOrders: 6,
    operator: 'Priya Sharma',
  },
  {
    id: 'TR-003',
    location: 'Nashik Hub',
    status: 'Maintenance',
    production: 0,
    temperature: 25,
    pressure: 0,
    feedstock: 'N/A',
    outputPerDay: 0,
    efficiency: 0,
    lastMaintenance: '2025-01-14',
    nextMaintenance: '2025-01-16',
    coordinates: { lat: 19.9975, lng: 73.7898 },
    activeOrders: 0,
    operator: 'Amit Kumar',
  },
  {
    id: 'TR-004',
    location: 'Aurangabad Zone',
    status: 'Active',
    production: 78,
    temperature: 780,
    pressure: 2.0,
    feedstock: 'Rice Husk',
    outputPerDay: 9.2,
    efficiency: 85,
    lastMaintenance: '2025-01-02',
    nextMaintenance: '2025-02-02',
    coordinates: { lat: 19.8762, lng: 75.3433 },
    activeOrders: 12,
    operator: 'Sunita Desai',
  },
];

const defaultControlSettings: MonitoringControlSettings = {
  targetTemp: 850,
  targetPressure: 2.4,
  automationLevel: 'semi',
  alerts: true,
};

const baseMonitoringLogs: MonitoringLog[] = [
  { timestamp: '2025-01-15 14:30:00', event: 'Temperature adjusted to 850°C', type: 'control' },
  { timestamp: '2025-01-15 14:25:00', event: 'Pressure optimized to 2.4 MPa', type: 'control' },
  { timestamp: '2025-01-15 14:20:00', event: 'Fuel efficiency improved to 92%', type: 'optimization' },
  { timestamp: '2025-01-15 14:15:00', event: 'Production rate: 12.5 MT/day', type: 'production' },
  { timestamp: '2025-01-15 14:10:00', event: 'CO₂ emission: 0.15 kg/MT', type: 'environmental' },
];

export const seedMonitoringUnits: MonitoringUnit[] = [
  {
    id: 'TR-001',
    location: 'Pune Industrial Area',
    status: 'Active',
    temperature: 850,
    pressure: 2.4,
    humidity: 45,
    efficiency: 92,
    production: 12.5,
    fuelConsumption: 8.2,
    co2Emission: 0.15,
    statusLevel: 'optimal',
    controlSettings: { ...defaultControlSettings },
    logs: baseMonitoringLogs.map((log) => ({ ...log })),
  },
  {
    id: 'TR-002',
    location: 'Mumbai Port',
    status: 'Active',
    temperature: 820,
    pressure: 2.2,
    humidity: 48,
    efficiency: 89,
    production: 10.8,
    fuelConsumption: 7.6,
    co2Emission: 0.18,
    statusLevel: 'optimal',
    controlSettings: { ...defaultControlSettings, targetTemp: 820, targetPressure: 2.2 },
    logs: baseMonitoringLogs.map((log) => ({ ...log })),
  },
  {
    id: 'TR-003',
    location: 'Nashik Hub',
    status: 'Maintenance',
    temperature: 25,
    pressure: 0,
    humidity: 55,
    efficiency: 0,
    production: 0,
    fuelConsumption: 0,
    co2Emission: 0,
    statusLevel: 'warning',
    controlSettings: { ...defaultControlSettings, automationLevel: 'manual' },
    logs: [
      { timestamp: '2025-01-14 08:00:00', event: 'Unit taken offline for scheduled maintenance', type: 'control' },
    ],
  },
  {
    id: 'TR-004',
    location: 'Aurangabad Zone',
    status: 'Active',
    temperature: 780,
    pressure: 2.0,
    humidity: 42,
    efficiency: 85,
    production: 9.2,
    fuelConsumption: 6.9,
    co2Emission: 0.2,
    statusLevel: 'optimal',
    controlSettings: { ...defaultControlSettings, targetTemp: 800, targetPressure: 2.0 },
    logs: baseMonitoringLogs.map((log) => ({ ...log })),
  },
];

export const seedReports: SavedReport[] = [
  {
    id: 'RPT-0001',
    name: 'Monthly Sustainability Report',
    date: 'January 2025',
    type: 'PDF',
    size: '2.4 MB',
    description: 'Comprehensive overview of environmental impact and sustainability initiatives',
  },
  {
    id: 'RPT-0002',
    name: 'Carbon Footprint Analysis',
    date: 'Q4 2024',
    type: 'PDF',
    size: '1.8 MB',
    description: 'Detailed analysis of carbon emissions and reduction strategies',
  },
  {
    id: 'RPT-0003',
    name: 'ESG Performance Dashboard',
    date: 'December 2024',
    type: 'Excel',
    size: '856 KB',
    description: 'Environmental, Social, and Governance performance metrics',
  },
  {
    id: 'RPT-0004',
    name: 'Compliance Summary',
    date: 'January 2025',
    type: 'PDF',
    size: '1.2 MB',
    description: 'Regulatory compliance status and certification updates',
  },
];
