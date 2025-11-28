
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  PHARMACIST = 'PHARMACIST',
  CASHIER = 'CASHIER',
  INVENTORY_CONTROLLER = 'INVENTORY_CONTROLLER',
  ACCOUNTANT = 'ACCOUNTANT',
  AUDITOR = 'AUDITOR'
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

export interface Staff {
  id: string;
  name: string;
  role: UserRole;
  branchId: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
  joinedDate: string;
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
  costPrice: number; // Buying Price per unit
  price: number; // Selling Price per unit
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

// Stock Transfer Types
export type TransferStatus = 'IN_TRANSIT' | 'RECEIVED_KEEPER' | 'COMPLETED' | 'REJECTED';

export interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
}

export interface StockTransfer {
  id: string;
  sourceBranchId: string;
  targetBranchId: string;
  dateSent: string;
  items: TransferItem[];
  status: TransferStatus;
  notes?: string;
  workflow: {
    step: 'INITIATED' | 'KEEPER_CHECK' | 'CONTROLLER_VERIFY' | 'DONE';
    logs: {
      role: string; // 'Store Keeper' | 'Inventory Controller'
      action: string;
      timestamp: string;
      user: string;
    }[];
  };
}

// Invoicing Types
export interface InvoicePayment {
  id: string;
  amount: number;
  date: string;
  receiptNumber: string;
  method: PaymentMethod;
  recordedBy: string;
}

export interface Invoice {
  id: string;
  branchId: string;
  customerName: string;
  dateIssued: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
  description: string;
  payments: InvoicePayment[];
}

// Clinical Types
export interface Patient {
  id: string;
  name: string;
  age: number;
  weight?: number;
  gender: 'Male' | 'Female';
  phone: string;
  allergies: string[];
  branchId: string;
  lastVisit: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: 'PENDING' | 'DISPENSED';
  items: { name: string; dosage: string; frequency: string }[];
  notes?: string;
}

// Audit Logs
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  branchId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
