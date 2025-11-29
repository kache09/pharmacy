
import { Branch, Product, Sale, StockTransfer, Invoice, PaymentMethod, Staff, UserRole, Patient, Prescription, AuditLog, BranchInventoryItem } from '../types';

export const BRANCHES: Branch[] = [
  { id: 'HEAD_OFFICE', name: 'Head Office (Global View)', location: 'HQ', manager: 'Super Admin', status: 'ACTIVE' },
  { id: 'BR001', name: 'Kariakoo Branch', location: 'Ilala, Dar es Salaam', manager: 'Juma M', status: 'ACTIVE' },
  { id: 'BR002', name: 'Masaki Branch', location: 'Kinondoni, Dar es Salaam', manager: 'Sarah K', status: 'ACTIVE' },
  { id: 'BR003', name: 'Mbezi Beach', location: 'Kinondoni, Dar es Salaam', manager: 'David L', status: 'INACTIVE' },
  { id: 'BR004', name: 'Dodoma Plaza', location: 'Dodoma CBD', manager: 'Rehema P', status: 'ACTIVE' },
];

export const STAFF_LIST: Staff[] = [
  { id: 'ST-001', name: 'Dr. Amani', role: UserRole.SUPER_ADMIN, branchId: 'HEAD_OFFICE', email: 'amani@afyatrack.co.tz', phone: '+255 700 000 001', status: 'ACTIVE', joinedDate: '2022-01-01', lastLogin: 'Just now', username: 'admin', password: '123' },
  { id: 'ST-002', name: 'Juma M', role: UserRole.BRANCH_MANAGER, branchId: 'BR001', email: 'juma@afyatrack.co.tz', phone: '+255 712 345 678', status: 'ACTIVE', joinedDate: '2022-03-15', lastLogin: '2 hrs ago', username: 'juma', password: '123' },
  { id: 'ST-003', name: 'Sarah K', role: UserRole.PHARMACIST, branchId: 'BR002', email: 'sarah@afyatrack.co.tz', phone: '+255 755 123 456', status: 'ACTIVE', joinedDate: '2022-06-10', lastLogin: '5 hrs ago', username: 'sarah', password: '123' },
  { id: 'ST-004', name: 'David L', role: UserRole.INVENTORY_CONTROLLER, branchId: 'HEAD_OFFICE', email: 'david@afyatrack.co.tz', phone: '+255 655 987 654', status: 'ACTIVE', joinedDate: '2023-01-20', lastLogin: '1 day ago', username: 'david', password: '123' },
  { id: 'ST-005', name: 'Grace P', role: UserRole.CASHIER, branchId: 'BR001', email: 'grace@afyatrack.co.tz', phone: '+255 688 111 222', status: 'ACTIVE', joinedDate: '2023-05-12', lastLogin: '10 mins ago', username: 'grace', password: '123' },
  { id: 'ST-006', name: 'Hassan A', role: UserRole.ACCOUNTANT, branchId: 'HEAD_OFFICE', email: 'hassan@afyatrack.co.tz', phone: '+255 777 333 444', status: 'ACTIVE', joinedDate: '2023-02-01', lastLogin: '3 days ago', username: 'hassan', password: '123' },
  { id: 'ST-007', name: 'Rehema P', role: UserRole.BRANCH_MANAGER, branchId: 'BR004', email: 'rehema@afyatrack.co.tz', phone: '+255 713 555 666', status: 'ACTIVE', joinedDate: '2023-08-01', lastLogin: '1 hr ago', username: 'rehema', password: '123' },
  { id: 'ST-008', name: 'John D', role: UserRole.PHARMACIST, branchId: 'BR001', email: 'john@afyatrack.co.tz', phone: '+255 766 888 999', status: 'INACTIVE', joinedDate: '2022-11-15', lastLogin: '2 weeks ago', username: 'john', password: '123' },
];

export const PRODUCTS: Product[] = [
  { id: '1', name: 'Panadol Extra', genericName: 'Paracetamol', category: 'Painkiller', costPrice: 3500, price: 5000, unit: 'Strip', minStockLevel: 50, totalStock: 0, requiresPrescription: false, batches: [] },
  { id: '2', name: 'Augmentin 625mg', genericName: 'Amoxicillin/Clavulanate', category: 'Antibiotic', costPrice: 11000, price: 15000, unit: 'Box', minStockLevel: 20, totalStock: 0, requiresPrescription: true, batches: [] },
  { id: '3', name: 'Metformin 500mg', genericName: 'Metformin', category: 'Diabetes', costPrice: 5500, price: 8000, unit: 'Box', minStockLevel: 10, totalStock: 0, requiresPrescription: true, batches: [] },
  { id: '4', name: 'Cipro 500mg', genericName: 'Cipro', category: 'Antibiotic', costPrice: 4000, price: 6000, unit: 'Box', minStockLevel: 15, totalStock: 0, requiresPrescription: true, batches: [] },
  { id: '5', name: 'Vitamin C + Zinc', genericName: 'Ascorbic Acid', category: 'Supplement', costPrice: 5000, price: 8000, unit: 'Bottle', minStockLevel: 10, totalStock: 80, requiresPrescription: false, batches: [] },
  { id: '6', name: 'Cetirizine', genericName: 'Cetirizine', category: 'Antihistamine', costPrice: 1500, price: 3000, unit: 'Strip', minStockLevel: 20, totalStock: 200, requiresPrescription: false, batches: [] },
];

// Mapping stock per branch for logic simulation
export const BRANCH_INVENTORY: Record<string, BranchInventoryItem[]> = {
  'BR001': [ // Kariakoo
    { productId: '1', quantity: 120, batches: [{ batchNumber: 'PANA-001', expiryDate: '2025-06-01', quantity: 120 }] },
    { productId: '2', quantity: 15, batches: [{ batchNumber: 'AUG-992', expiryDate: '2023-12-01', quantity: 15 }] },
    { productId: '3', quantity: 200, batches: [{ batchNumber: 'MET-101', expiryDate: '2026-01-01', quantity: 200 }] },
  ],
  'BR002': [ // Masaki - Higher prices for some items
    { productId: '1', quantity: 450, batches: [{ batchNumber: 'PANA-003', expiryDate: '2025-08-01', quantity: 450 }], customPrice: 6000 },
    { productId: '2', quantity: 80, batches: [{ batchNumber: 'AUG-994', expiryDate: '2024-05-01', quantity: 80 }], customPrice: 18000 },
  ],
  'BR004': [ // Dodoma
    { productId: '1', quantity: 60, batches: [{ batchNumber: 'PANA-005', expiryDate: '2025-02-01', quantity: 60 }] },
  ]
};

export const BRANCH_FINANCE_STATS = {
  'HEAD_OFFICE': { revenue: 107000000, profit: 32400000, expenses: 8500000 },
  'BR001': { revenue: 45000000, profit: 12000000, expenses: 3200000 },
  'BR002': { revenue: 32000000, profit: 9500000, expenses: 2800000 },
  'BR003': { revenue: 18000000, profit: 4500000, expenses: 1500000 },
  'BR004': { revenue: 12000000, profit: 3100000, expenses: 1000000 },
};

export const WEEKLY_SALES_DATA = {
  'HEAD_OFFICE': [
    { name: 'Mon', sales: 1200000, revenue: 400000 },
    { name: 'Tue', sales: 1500000, revenue: 550000 },
    { name: 'Wed', sales: 980000, revenue: 300000 },
    { name: 'Thu', sales: 1700000, revenue: 680000 },
    { name: 'Fri', sales: 2100000, revenue: 850000 },
    { name: 'Sat', sales: 2400000, revenue: 950000 },
    { name: 'Sun', sales: 1100000, revenue: 350000 },
  ],
  'BR001': [
    { name: 'Mon', sales: 500000, revenue: 150000 },
    { name: 'Tue', sales: 600000, revenue: 180000 },
    { name: 'Wed', sales: 400000, revenue: 120000 },
    { name: 'Thu', sales: 700000, revenue: 210000 },
    { name: 'Fri', sales: 800000, revenue: 250000 },
    { name: 'Sat', sales: 900000, revenue: 300000 },
    { name: 'Sun', sales: 400000, revenue: 100000 },
  ]
};

export const STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 'TR-2023-889',
    sourceBranchId: 'HEAD_OFFICE',
    targetBranchId: 'BR001',
    dateSent: '2023-10-26',
    items: [
      { productId: '2', productName: 'Augmentin 625mg', quantity: 50, batchNumber: 'AUG-NEW-01', expiryDate: '2025-01-01' },
      { productId: '4', productName: 'Cipro 500mg', quantity: 100, batchNumber: 'CIP-NEW-02', expiryDate: '2025-03-15' }
    ],
    status: 'IN_TRANSIT',
    keeperCode: '228899', // Verification Code
    controllerCode: '554411', // Verification Code
    workflow: {
      step: 'KEEPER_CHECK',
      logs: [
        { role: 'Head Office', action: 'Dispatched', timestamp: '2023-10-26 09:00', user: 'Central Store' }
      ]
    }
  },
  {
    id: 'TR-2023-890',
    sourceBranchId: 'HEAD_OFFICE',
    targetBranchId: 'BR001',
    dateSent: '2023-10-25',
    items: [
      { productId: '1', productName: 'Panadol Extra', quantity: 200, batchNumber: 'PANA-X-99', expiryDate: '2026-01-01' }
    ],
    status: 'RECEIVED_KEEPER',
    keeperCode: '112233', // Used (conceptually)
    controllerCode: '778899', // Pending verification
    workflow: {
      step: 'CONTROLLER_VERIFY',
      logs: [
        { role: 'Head Office', action: 'Dispatched', timestamp: '2023-10-25 08:30', user: 'Central Store' },
        { role: 'Store Keeper', action: 'Physical Receipt Confirmed', timestamp: '2023-10-25 14:00', user: 'Juma (Keeper)' }
      ]
    }
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2023-001',
    branchId: 'BR001',
    customerName: 'Aga Khan Hospital',
    dateIssued: '2023-10-01',
    dueDate: '2023-10-30',
    totalAmount: 2500000,
    paidAmount: 1000000,
    status: 'PARTIAL',
    description: 'Bulk Supply of Antibiotics',
    payments: [
      { id: 'PAY-001', amount: 1000000, date: '2023-10-05', receiptNumber: 'REC-998877', method: PaymentMethod.MOBILE_MONEY, recordedBy: 'Juma M' }
    ]
  },
  {
    id: 'INV-2023-002',
    branchId: 'BR002',
    customerName: 'TotalCare Clinic',
    dateIssued: '2023-10-15',
    dueDate: '2023-11-15',
    totalAmount: 1200000,
    paidAmount: 0,
    status: 'UNPAID',
    description: 'Monthly Consumables',
    payments: []
  },
  {
    id: 'INV-2023-003',
    branchId: 'BR001',
    customerName: 'Dar International School',
    dateIssued: '2023-10-20',
    dueDate: '2023-11-20',
    totalAmount: 450000,
    paidAmount: 450000,
    status: 'PAID',
    description: 'First Aid Kit Replenishment',
    payments: [
       { id: 'PAY-002', amount: 450000, date: '2023-10-22', receiptNumber: 'REC-998900', method: PaymentMethod.CASH, recordedBy: 'Juma M' }
    ]
  }
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'Mariam Juma', age: 34, gender: 'Female', phone: '+255 712 000 001', allergies: ['Penicillin'], branchId: 'BR001', lastVisit: '2023-10-01' },
  { id: 'P002', name: 'Baraka Ali', age: 45, gender: 'Male', phone: '+255 713 000 002', allergies: [], branchId: 'BR001', lastVisit: '2023-09-15' },
  { id: 'P003', name: 'Neema John', age: 28, gender: 'Female', phone: '+255 714 000 003', allergies: ['Sulfa'], branchId: 'BR002', lastVisit: '2023-10-20' },
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  { 
    id: 'RX-1001', patientId: 'P001', patientName: 'Mariam Juma', doctorName: 'Dr. Mbena', date: '2023-10-01', status: 'DISPENSED',
    items: [{ name: 'Augmentin 625mg', dosage: '1 tab', frequency: '2x Daily' }] 
  },
  { 
    id: 'RX-1002', patientId: 'P002', patientName: 'Baraka Ali', doctorName: 'Dr. Chale', date: '2023-09-15', status: 'PENDING',
    items: [{ name: 'Metformin 500mg', dosage: '1 tab', frequency: '3x Daily' }] 
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-9001', userId: 'ST-002', userName: 'Juma M', action: 'LOGIN', details: 'Successful login from Web Client', timestamp: '2023-10-27 08:00:15', branchId: 'BR001', severity: 'INFO' },
  { id: 'LOG-9002', userId: 'ST-005', userName: 'Grace P', action: 'SALE_COMPLETE', details: 'Processed Sale #SALE-921 (Amount: 15,000 TZS)', timestamp: '2023-10-27 08:15:30', branchId: 'BR001', severity: 'INFO' },
  { id: 'LOG-9003', userId: 'ST-001', userName: 'Dr. Amani', action: 'PRICE_UPDATE', details: 'Updated price for Panadol Extra (4,500 -> 5,000)', timestamp: '2023-10-27 09:30:00', branchId: 'HEAD_OFFICE', severity: 'WARNING' },
  { id: 'LOG-9004', userId: 'ST-003', userName: 'Sarah K', action: 'STOCK_ADJUSTMENT', details: 'Removed 2 boxes of Cipro (Damaged)', timestamp: '2023-10-27 10:45:12', branchId: 'BR002', severity: 'WARNING' },
  { id: 'LOG-9005', userId: 'ST-002', userName: 'Juma M', action: 'INVOICE_CREATE', details: 'Created Invoice #INV-2023-001', timestamp: '2023-10-27 11:20:05', branchId: 'BR001', severity: 'INFO' },
  { id: 'LOG-9006', userId: 'SYSTEM', userName: 'System Bot', action: 'AUTO_BACKUP', details: 'Daily Database Backup Completed', timestamp: '2023-10-27 00:00:00', branchId: 'HEAD_OFFICE', severity: 'INFO' },
  { id: 'LOG-9007', userId: 'ST-005', userName: 'Grace P', action: 'LOGIN_FAILED', details: 'Incorrect Password Attempt (3x)', timestamp: '2023-10-27 07:55:00', branchId: 'BR001', severity: 'CRITICAL' },
];

export const CATEGORY_PERFORMANCE = [
  { name: 'Antibiotics', value: 45 },
  { name: 'Painkillers', value: 30 },
  { name: 'Supplements', value: 15 },
  { name: 'Chronic', value: 10 },
];
