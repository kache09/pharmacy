export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  PHARMACIST = 'PHARMACIST',
  CASHIER = 'CASHIER'
}

export enum PaymentMethod {
  CASH = 'CASH',
  MOBILE_MONEY = 'MOBILE_MONEY', // M-Pesa, TigoPesa
  INSURANCE = 'INSURANCE', // NHIF, AAR
  CREDIT = 'CREDIT'
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DrugBatch {
  batchNumber: string;
  expiryDate: string; // ISO Date
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  genericName: string;
  category: string; // e.g., Antibiotic, Analgesic
  price: number;
  unit: string; // e.g., Tablet, Bottle
  minStockLevel: number;
  batches: DrugBatch[];
  requiresPrescription: boolean;
  totalStock: number; // Calculated field
}

export interface CartItem extends Product {
  quantity: number;
  selectedBatch: string;
  discount: number;
}

export interface Sale {
  id: string;
  date: string;
  branchId: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  insuranceProvider?: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
}

export interface InteractionResult {
  severity: 'HIGH' | 'MODERATE' | 'LOW' | 'NONE';
  description: string;
}
