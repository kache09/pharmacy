
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
  username: string; // Added for Auth
  password?: string; // Added for Auth (Mock only - in real app this is hashed)
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
  price: number; // Selling Price per unit (Global Base Price)
  unit: string; // e.g., Tablet, Bottle
  minStockLevel: number;
  batches: DrugBatch[];
  requiresPrescription: boolean;
  totalStock: number; // Calculated field
}

export interface BranchInventoryItem {
  productId: string;
  quantity: number;
  batches: DrugBatch[];
  customPrice?: number; // Optional override for branch-specific pricing
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
  // Security Keys for Verification Steps
  keeperCode?: string; // Code for Store Keeper to confirm receipt
  controllerCode?: string; // Code for Inventory Controller to verify
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

// Stock Requisition (Branch Requesting Stock)
export interface StockRequisition {
  id: string;
  branchId: string;
  requestDate: string;
  requestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'NORMAL' | 'URGENT';
  items: {
    productId: string;
    productName: string;
    currentStock: number;
    requestedQty: number;
  }[];
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

export interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  branchId: string;
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
