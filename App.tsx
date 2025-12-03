
import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Finance from './components/Finance';
import Branches from './components/Branches';
import Staff from './components/Staff';
import Clinical from './components/Clinical';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Approvals from './components/Approvals';
import { Staff as StaffType, UserRole, BranchInventoryItem, StockTransfer, Sale, Invoice, CartItem, PaymentMethod, StockReleaseRequest, StockRequisition, DisposalRequest, Expense, Branch } from './types';
import { BRANCH_INVENTORY, STOCK_TRANSFERS, MOCK_INVOICES, MOCK_REQUISITIONS, INITIAL_EXPENSES, MOCK_SALES, BRANCHES } from './data/mockData';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<StaffType | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBranchId, setCurrentBranchId] = useState('HEAD_OFFICE');

  // Global State for Data Consistency
  const [inventory, setInventory] = useState<Record<string, BranchInventoryItem[]>>(BRANCH_INVENTORY);
  const [transfers, setTransfers] = useState<StockTransfer[]>(STOCK_TRANSFERS);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [releaseRequests, setReleaseRequests] = useState<StockReleaseRequest[]>([]);
  const [requisitions, setRequisitions] = useState<StockRequisition[]>(MOCK_REQUISITIONS);
  const [disposalRequests, setDisposalRequests] = useState<DisposalRequest[]>([]);
  const [branches, setBranches] = useState<Branch[]>(BRANCHES);

  // Automatic Expiry Check on Load
  useEffect(() => {
    const checkExpiry = () => {
      const today = new Date().toISOString().split('T')[0];
      let hasUpdates = false;
      const updatedInventory = { ...inventory };

      Object.keys(updatedInventory).forEach(branchId => {
        updatedInventory[branchId] = updatedInventory[branchId].map(item => {
          let itemUpdated = false;
          const updatedBatches = item.batches.map(batch => {
             // If expiry date passed and status is not yet EXPIRED or REJECTED
             if (batch.expiryDate < today && batch.status !== 'EXPIRED' && batch.status !== 'REJECTED') {
                 hasUpdates = true;
                 itemUpdated = true;
                 return { ...batch, status: 'EXPIRED' as const };
             }
             return batch;
          });
          return itemUpdated ? { ...item, batches: updatedBatches } : item;
        });
      });

      if (hasUpdates) {
          setInventory(updatedInventory);
          console.log("System Auto-Check: Expired batches detected and marked as EXPIRED.");
      }
    };

    checkExpiry();
  }, []); // Run once on mount

  // Handle Login
  const handleLogin = (user: StaffType) => {
    setCurrentUser(user);
    // Determine initial branch context
    if (user.role === UserRole.SUPER_ADMIN) {
        setCurrentBranchId('HEAD_OFFICE');
    } else {
        setCurrentBranchId(user.branchId);
    }
    // Set default active tab based on role
    if (user.role === UserRole.CASHIER) setActiveTab('pos');
    else if (user.role === UserRole.PHARMACIST) setActiveTab('clinical');
    else if (user.role === UserRole.ACCOUNTANT) setActiveTab('finance');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleCreateInvoice = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
  };

  // Logic to process payment and deduct stock (Finance triggers this)
  const handleInvoicePayment = (updatedInvoice: Invoice) => {
      // 1. Update the Invoice List
      setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));

      // 2. If Invoice is fully PAID and comes from POS (or has items), deduct inventory
      if (updatedInvoice.status === 'PAID' && updatedInvoice.items && updatedInvoice.items.length > 0) {
          
          const branchId = updatedInvoice.branchId;
          
          setInventory(prev => {
            const branchStock = [...(prev[branchId] || [])];
            
            updatedInvoice.items?.forEach(cartItem => {
                const index = branchStock.findIndex(i => i.productId === cartItem.id);
                if (index !== -1) {
                    // Deduct total quantity
                    branchStock[index].quantity = Math.max(0, branchStock[index].quantity - cartItem.quantity);
                    
                    // Deduct from batches (FIFO Logic - simplified) - Only deduct from ACTIVE batches
                    let remainingToDeduct = cartItem.quantity;
                    const updatedBatches = branchStock[index].batches.map(batch => {
                         if (remainingToDeduct <= 0 || batch.status !== 'ACTIVE') return batch;
                         
                         if (batch.quantity >= remainingToDeduct) {
                             const newBatchQty = batch.quantity - remainingToDeduct;
                             remainingToDeduct = 0;
                             return { ...batch, quantity: newBatchQty };
                         } else {
                             remainingToDeduct -= batch.quantity;
                             return { ...batch, quantity: 0 };
                         }
                    }).filter(b => b.quantity > 0); // Remove empty batches

                    branchStock[index].batches = updatedBatches;
                }
            });

            return { ...prev, [branchId]: branchStock };
        });

        // 3. Record as a Sale for analytics
        const itemsToRecord: CartItem[] = updatedInvoice.items || [];
        const saleRecord: Sale = {
            id: `SALE-${updatedInvoice.id}`,
            date: new Date().toISOString(),
            branchId: updatedInvoice.branchId,
            items: itemsToRecord,
            totalAmount: updatedInvoice.totalAmount,
            totalCost: itemsToRecord.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0),
            profit: updatedInvoice.totalAmount - itemsToRecord.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0),
            paymentMethod: updatedInvoice.payments[updatedInvoice.payments.length - 1]?.method || PaymentMethod.CASH,
            customerName: updatedInvoice.customerName,
            status: 'COMPLETED'
        };
        setSales(prev => [saleRecord, ...prev]);
      }
  };

  const handleCreateReleaseRequest = (req: StockReleaseRequest) => {
      setReleaseRequests(prev => [req, ...prev]);
  };

  const handleApproveRelease = (req: StockReleaseRequest) => {
      // 1. Update Request Status
      setReleaseRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r));

      // 2. Update Inventory Batch Statuses to ACTIVE
      setInventory(prev => {
          const branchStock = [...(prev[req.branchId] || [])];

          req.items.forEach(reqItem => {
              const productIndex = branchStock.findIndex(p => p.productId === reqItem.productId);
              if (productIndex >= 0) {
                  // Find the matching batch
                  const batchIndex = branchStock[productIndex].batches.findIndex(b => b.batchNumber === reqItem.batchNumber);
                  if (batchIndex >= 0) {
                      branchStock[productIndex].batches[batchIndex].status = 'ACTIVE';
                  }
              }
          });

          return { ...prev, [req.branchId]: branchStock };
      });

      alert(`Release Request ${req.id} approved. Stock is now visible in POS.`);
  };

  const handleCreateRequisition = (req: StockRequisition) => {
    setRequisitions(prev => [req, ...prev]);
  };

  const handleRequisitionAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    // 1. Update Requisition Status
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));

    // 2. If Approved, Automatically Create a Stock Transfer (Shipment)
    if (action === 'APPROVED') {
        const req = requisitions.find(r => r.id === id);
        if (req) {
            const newTransfer: StockTransfer = {
                id: `TR-${Date.now().toString().slice(-6)}`,
                sourceBranchId: 'HEAD_OFFICE',
                targetBranchId: req.branchId,
                dateSent: new Date().toISOString().split('T')[0],
                status: 'IN_TRANSIT',
                keeperCode: Math.floor(100000 + Math.random() * 900000).toString(),
                controllerCode: Math.floor(100000 + Math.random() * 900000).toString(),
                notes: `Auto-generated from Requisition ${req.id}`,
                items: req.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.requestedQty,
                    batchNumber: 'BATCH-AUTO-' + Math.floor(Math.random() * 1000), // In real app, picker would scan actual batch
                    expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0] // Default 1 year expiry for demo
                })),
                workflow: {
                    step: 'KEEPER_CHECK',
                    logs: [{ role: 'System', action: 'Auto-Dispatched', timestamp: new Date().toLocaleString(), user: 'Automation' }]
                }
            };

            setTransfers(prev => [newTransfer, ...prev]);
            alert(`Requisition Approved! Shipment #${newTransfer.id} has been created and dispatched to ${req.branchId}.`);
        }
    }
  };

  // --- DISPOSAL HANDLERS ---
  const handleCreateDisposalRequest = (req: DisposalRequest) => {
    setDisposalRequests(prev => [req, ...prev]);
  };

  const handleApproveDisposal = (req: DisposalRequest) => {
    setDisposalRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r));
    alert(`Disposal Request ${req.id} approved. Inventory Keeper can now finalize destruction.`);
  };

  const handleFinalizeDisposal = (req: DisposalRequest) => {
      // 1. Update Request Status
      setDisposalRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'COMPLETED' } : r));

      // 2. Permanently Remove Stock
      setInventory(prev => {
          const branchStock = [...(prev[req.branchId] || [])];

          req.items.forEach(reqItem => {
              const productIndex = branchStock.findIndex(p => p.productId === reqItem.productId);
              if (productIndex >= 0) {
                  // Filter out the disposed batch completely
                  const originalBatches = branchStock[productIndex].batches;
                  const filteredBatches = originalBatches.filter(b => b.batchNumber !== reqItem.batchNumber);
                  
                  branchStock[productIndex].batches = filteredBatches;
                  branchStock[productIndex].quantity = filteredBatches.reduce((sum, b) => sum + b.quantity, 0);
              }
          });

          return { ...prev, [req.branchId]: branchStock };
      });
      alert("Stock Disposed. Inventory updated.");
  };

  // --- EXPENSE HANDLERS ---
  const handleCreateExpense = (exp: Expense) => {
      setExpenses(prev => [exp, ...prev]);
  };

  const handleExpenseAction = (id: number, action: 'Approved' | 'Rejected') => {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: action } : e));
  };


  // If not logged in, show Login Screen
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Check if current user's branch is ACTIVE (If not Super Admin)
  const usersBranch = branches.find(b => b.id === currentUser.branchId);
  if (currentUser.role !== UserRole.SUPER_ADMIN && usersBranch?.status === 'INACTIVE') {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-200">
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
                  <div className="flex items-center justify-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg mb-4">
                       <AlertTriangle size={18} />
                       <span className="font-bold">Branch Inactive</span>
                  </div>
                  <p className="text-slate-500 mb-8">
                      The branch <strong>{usersBranch.name}</strong> has been deactivated by the administration.
                      <br/><br/>
                      System access is currently disabled for all users at this location. Please contact Head Office for assistance.
                  </p>
                  <button 
                    onClick={handleLogout} 
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
                  >
                      Return to Login
                  </button>
              </div>
          </div>
      );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            currentBranchId={currentBranchId} 
            inventory={inventory} 
            sales={sales}
            expenses={expenses}
            onViewInventory={() => setActiveTab('inventory')} 
          />
        );
      case 'approvals':
        return (
            <Approvals 
                releaseRequests={releaseRequests} 
                onApproveRelease={handleApproveRelease}
                requisitions={requisitions}
                onActionRequisition={handleRequisitionAction}
                disposalRequests={disposalRequests}
                onApproveDisposal={handleApproveDisposal}
                expenses={expenses}
                onActionExpense={handleExpenseAction}
            />
        );
      case 'pos':
        return (
          <POS 
            currentBranchId={currentBranchId} 
            inventory={inventory} 
            onCreateInvoice={handleCreateInvoice}
          />
        );
      case 'inventory':
        return (
          <Inventory 
            currentBranchId={currentBranchId} 
            inventory={inventory}
            setInventory={setInventory}
            transfers={transfers}
            setTransfers={setTransfers}
            releaseRequests={releaseRequests}
            onCreateReleaseRequest={handleCreateReleaseRequest}
            onCreateRequisition={handleCreateRequisition}
            currentUser={currentUser}
            disposalRequests={disposalRequests}
            onCreateDisposalRequest={handleCreateDisposalRequest}
            onFinalizeDisposal={handleFinalizeDisposal}
          />
        );
      case 'finance':
        return (
            <Finance 
                currentBranchId={currentBranchId} 
                invoices={invoices}
                expenses={expenses}
                sales={sales}
                onProcessPayment={handleInvoicePayment}
                onCreateExpense={handleCreateExpense}
            />
        );
      case 'staff':
        return <Staff currentBranchId={currentBranchId} />;
      case 'branches':
        return <Branches branches={branches} onUpdateBranches={setBranches} />;
      case 'clinical':
        return <Clinical currentBranchId={currentBranchId} />;
      case 'reports':
        return <Reports currentBranchId={currentBranchId} inventory={inventory} sales={sales} expenses={expenses} />;
      case 'settings':
        return <Settings currentBranchId={currentBranchId} />;
      default:
        return (
          <Dashboard 
            currentBranchId={currentBranchId} 
            inventory={inventory} 
            sales={sales}
            expenses={expenses}
            onViewInventory={() => setActiveTab('inventory')} 
          />
        );
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      currentBranchId={currentBranchId}
      setCurrentBranchId={setCurrentBranchId}
      currentUser={currentUser}
      onLogout={handleLogout}
      branches={branches}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
