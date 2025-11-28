
import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Calendar, 
  RefreshCcw, 
  MapPin, 
  Truck, 
  CheckSquare, 
  ClipboardCheck, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Wallet, 
  TrendingUp,
  Plus,
  X,
  Save,
  Search,
  Filter
} from 'lucide-react';
import { BRANCHES, PRODUCTS, BRANCH_INVENTORY, STOCK_TRANSFERS } from '../data/mockData';
import { StockTransfer, Product } from '../types';

const Inventory: React.FC<{currentBranchId: string}> = ({ currentBranchId }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'transfers'>('stock');
  
  // Local State for Data Manipulation
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [inventory, setInventory] = useState(BRANCH_INVENTORY);
  const [transfers, setTransfers] = useState<StockTransfer[]>(STOCK_TRANSFERS);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form States
  const [newStock, setNewStock] = useState({
    productId: '',
    isNewProduct: false,
    name: '',
    genericName: '',
    category: '',
    costPrice: '',
    price: '',
    unit: 'Box',
    batchNumber: '',
    expiryDate: '',
    quantity: ''
  });

  const [adjustment, setAdjustment] = useState({
    reason: 'Restock',
    quantity: '',
    type: 'ADD' // ADD or REMOVE
  });
  
  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';
  const activeBranchName = BRANCHES.find(b => b.id === currentBranchId)?.name;

  // Logic to merge Product Definitions with Branch Inventory Levels
  const displayedInventory = products.map(product => {
    let totalStock = 0;
    let batches: any[] = [];

    if (isHeadOffice) {
        Object.values(inventory).forEach((branchStockList: any) => {
            const item = branchStockList.find((i: any) => i.productId === product.id);
            if (item) {
                totalStock += item.quantity;
                batches = [...batches, ...item.batches];
            }
        });
    } else {
        const branchStockList = inventory[currentBranchId] || [];
        const item = branchStockList.find(i => i.productId === product.id);
        if (item) {
            totalStock = item.quantity;
            batches = item.batches;
        }
    }

    return { ...product, totalStock, batches };
  });

  // Calculate Aggregated Financials
  const totalAssetValue = displayedInventory.reduce((acc, curr) => acc + (curr.totalStock * curr.costPrice), 0);
  const totalPotentialRevenue = displayedInventory.reduce((acc, curr) => acc + (curr.totalStock * curr.price), 0);

  // Filter transfers for current branch
  const branchTransfers = transfers.filter(t => 
    isHeadOffice ? true : t.targetBranchId === currentBranchId || t.sourceBranchId === currentBranchId
  );

  // --- Handlers ---

  const handleSaveStock = () => {
    // 1. Handle New Product Creation
    let targetProductId = newStock.productId;
    
    if (newStock.isNewProduct) {
        const newId = (products.length + 1).toString();
        const newProd: Product = {
            id: newId,
            name: newStock.name,
            genericName: newStock.genericName,
            category: newStock.category,
            costPrice: parseFloat(newStock.costPrice),
            price: parseFloat(newStock.price),
            unit: newStock.unit,
            minStockLevel: 10,
            totalStock: 0,
            requiresPrescription: false,
            batches: []
        };
        setProducts([...products, newProd]);
        targetProductId = newId;
    }

    // 2. Add Stock to Inventory State
    const targetBranch = isHeadOffice ? 'BR001' : currentBranchId; // Default to BR001 if HO adds
    const qty = parseInt(newStock.quantity);
    
    setInventory(prev => {
        const branchStock = prev[targetBranch] || [];
        const existingItemIndex = branchStock.findIndex(i => i.productId === targetProductId);
        
        let newBranchStock = [...branchStock];

        if (existingItemIndex >= 0) {
            // Update existing item
            const item = newBranchStock[existingItemIndex];
            item.quantity += qty;
            item.batches.push({
                batchNumber: newStock.batchNumber,
                expiryDate: newStock.expiryDate,
                quantity: qty
            });
        } else {
            // Create new entry for branch
            newBranchStock.push({
                productId: targetProductId,
                quantity: qty,
                batches: [{
                    batchNumber: newStock.batchNumber,
                    expiryDate: newStock.expiryDate,
                    quantity: qty
                }]
            });
        }

        return {
            ...prev,
            [targetBranch]: newBranchStock
        };
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleAdjustStock = () => {
      if (!selectedItem) return;

      const qty = parseInt(adjustment.quantity);
      const adjustVal = adjustment.type === 'ADD' ? qty : -qty;

      setInventory(prev => {
          const branchStock = prev[currentBranchId] || [];
          const newBranchStock = branchStock.map(item => {
              if (item.productId === selectedItem.id) {
                  return {
                      ...item,
                      quantity: Math.max(0, item.quantity + adjustVal), // Prevent negative
                      // Ideally we adjust specific batches, but for simple mock we just adjust total and first batch
                      batches: item.batches.length > 0 ? [
                          { ...item.batches[0], quantity: Math.max(0, item.batches[0].quantity + adjustVal) },
                          ...item.batches.slice(1)
                      ] : []
                  };
              }
              return item;
          });

          return { ...prev, [currentBranchId]: newBranchStock };
      });

      setShowAdjustModal(false);
      setSelectedItem(null);
      setAdjustment({ reason: 'Restock', quantity: '', type: 'ADD' });
  };

  const resetForm = () => {
    setNewStock({
        productId: '', isNewProduct: false, name: '', genericName: '', category: '', 
        costPrice: '', price: '', unit: 'Box', batchNumber: '', expiryDate: '', quantity: ''
    });
  };

  const openAdjustModal = (item: any) => {
      setSelectedItem(item);
      setShowAdjustModal(true);
  };

  // Workflow Handlers
  const handleKeeperConfirm = (id: string) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'RECEIVED_KEEPER',
          workflow: {
            step: 'CONTROLLER_VERIFY',
            logs: [...t.workflow.logs, { role: 'Store Keeper', action: 'Confirmed Receipt', timestamp: new Date().toLocaleString(), user: 'Current User' }]
          }
        } as StockTransfer;
      }
      return t;
    }));
  };

  const handleControllerVerify = (id: string) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'COMPLETED',
          workflow: {
            step: 'DONE',
            logs: [...t.workflow.logs, { role: 'Inventory Controller', action: 'Verified & Stocked', timestamp: new Date().toLocaleString(), user: 'Current User' }]
          }
        } as StockTransfer;
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
             <MapPin size={16} />
             <span>{isHeadOffice ? 'Global Stock View (All Branches)' : `Stock at ${activeBranchName}`}</span>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold text-sm shadow-md shadow-teal-600/20"
            >
                <Plus size={16} /> Add New Stock
            </button>
            <div className="h-8 w-[1px] bg-slate-300 mx-1"></div>
            <button 
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'stock' ? 'bg-white border-teal-600 text-teal-700 border shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                Current Stock
            </button>
            <button 
                onClick={() => setActiveTab('transfers')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'transfers' ? 'bg-white border-teal-600 text-teal-700 border shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                Transfers
                {branchTransfers.filter(t => t.status !== 'COMPLETED').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {branchTransfers.filter(t => t.status !== 'COMPLETED').length}
                    </span>
                )}
            </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                         <DollarSign size={24} />
                     </div>
                     <div>
                         <p className="text-sm text-slate-500 font-medium">Total Asset Value (Cost)</p>
                         <h3 className="text-2xl font-bold text-slate-800">
                             {totalAssetValue.toLocaleString()} <span className="text-sm font-normal text-slate-400">TZS</span>
                         </h3>
                     </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                         <TrendingUp size={24} />
                     </div>
                     <div>
                         <p className="text-sm text-slate-500 font-medium">Projected Revenue (Retail)</p>
                         <h3 className="text-2xl font-bold text-slate-800">
                             {totalPotentialRevenue.toLocaleString()} <span className="text-sm font-normal text-slate-400">TZS</span>
                         </h3>
                     </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                         <Wallet size={24} />
                     </div>
                     <div>
                         <p className="text-sm text-slate-500 font-medium">Potential Gross Profit</p>
                         <h3 className="text-2xl font-bold text-slate-800">
                             {(totalPotentialRevenue - totalAssetValue).toLocaleString()} <span className="text-sm font-normal text-slate-400">TZS</span>
                         </h3>
                     </div>
                 </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input type="text" placeholder="Search inventory..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-xs">
                        <RefreshCcw size={14} /> Sync MSD
                    </button>
                </div>
                <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Info</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pricing</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Level</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {displayedInventory.map((product) => {
                    const isLowStock = product.totalStock <= product.minStockLevel;
                    const stockValue = product.totalStock * product.costPrice;

                    return (
                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                            <div>
                            <h4 className="font-bold text-slate-800">{product.name}</h4>
                            <p className="text-xs text-slate-500">{product.genericName}</p>
                            <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 px-1 rounded mt-1 inline-block">{product.category}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <div className="text-xs text-slate-500">
                                    Buy: <span className="font-medium text-slate-700">{product.costPrice.toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    Sell: <span className="font-bold text-emerald-600">{product.price.toLocaleString()}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-lg ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                                        {product.totalStock}
                                    </span>
                                    <span className="text-xs text-slate-400">{product.unit}s</span>
                                    {isLowStock && <AlertTriangle size={14} className="text-red-500" />}
                                </div>
                                <span className="text-[10px] text-slate-400">Val: {stockValue.toLocaleString()} TZS</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="space-y-1">
                            {product.batches.length > 0 ? product.batches.map((batch, idx) => {
                                const expiry = new Date(batch.expiryDate);
                                const isExpiring = expiry.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days
                                return (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                    <span className="font-mono text-slate-500">{batch.batchNumber}</span>
                                    <span className={`flex items-center gap-1 ${isExpiring ? 'text-amber-600 font-bold' : 'text-emerald-600'}`}>
                                        <Calendar size={10} />
                                        {batch.expiryDate}
                                    </span>
                                    <span className="text-slate-400">({batch.quantity})</span>
                                    </div>
                                )
                            }) : <span className="text-xs text-slate-400 italic">No Active Batches</span>}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                            {isHeadOffice ? (
                                <button className="text-slate-400 font-medium hover:text-teal-600 text-xs flex items-center gap-1">
                                    <ClipboardCheck size={14} /> View Log
                                </button>
                            ) : (
                                <button 
                                    onClick={() => openAdjustModal(product)}
                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-medium rounded hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-xs transition-colors shadow-sm"
                                >
                                    Adjust Stock
                                </button>
                            )}
                        </td>
                        </tr>
                    )
                    })}
                </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Transfers Tab Content */}
      {activeTab === 'transfers' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {branchTransfers.length === 0 ? (
                 <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                     <Truck size={48} className="mx-auto text-slate-300 mb-4" />
                     <h3 className="text-lg font-bold text-slate-700">No Transfers Found</h3>
                     <p className="text-slate-500">There are no incoming or outgoing stock transfers for this branch.</p>
                 </div>
             ) : (
                 branchTransfers.map(transfer => {
                     const isComplete = transfer.status === 'COMPLETED';
                     const isReadyForKeeper = transfer.status === 'IN_TRANSIT';
                     const isReadyForController = transfer.status === 'RECEIVED_KEEPER';

                     return (
                         <div key={transfer.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                             <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                                 <div className="flex items-center gap-4">
                                     <div className={`p-3 rounded-full ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                         {isComplete ? <CheckSquare size={24}/> : <Truck size={24}/>}
                                     </div>
                                     <div>
                                         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                             Transfer #{transfer.id}
                                             {isComplete && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">COMPLETED</span>}
                                             {isReadyForKeeper && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold animate-pulse">IN TRANSIT</span>}
                                             {isReadyForController && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">PENDING VERIFICATION</span>}
                                         </h3>
                                         <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                             <span>From: <strong>{BRANCHES.find(b=>b.id === transfer.sourceBranchId)?.name}</strong></span>
                                             <ArrowRight size={14}/>
                                             <span>To: <strong>{BRANCHES.find(b=>b.id === transfer.targetBranchId)?.name}</strong></span>
                                             <span className="mx-2">•</span>
                                             <span>{transfer.dateSent}</span>
                                         </p>
                                     </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-3">
                                     {!isHeadOffice && isReadyForKeeper && (
                                         <button 
                                            onClick={() => handleKeeperConfirm(transfer.id)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all"
                                         >
                                             <Package size={18} />
                                             <div className="text-left">
                                                 <div className="text-xs opacity-80 uppercase tracking-wide">Step 1: Keeper</div>
                                                 <div>Confirm Receipt</div>
                                             </div>
                                         </button>
                                     )}
                                     
                                     {!isHeadOffice && isReadyForController && (
                                         <button 
                                            onClick={() => handleControllerVerify(transfer.id)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-600/20 transition-all"
                                         >
                                             <ClipboardCheck size={18} />
                                             <div className="text-left">
                                                 <div className="text-xs opacity-80 uppercase tracking-wide">Step 2: Controller</div>
                                                 <div>Verify & Stock</div>
                                             </div>
                                         </button>
                                     )}
                                 </div>
                             </div>
                             <div className="p-6">
                                 <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Items in Shipment</h4>
                                 <table className="w-full text-left text-sm">
                                     <thead className="text-slate-400 font-medium border-b border-slate-100">
                                         <tr>
                                             <th className="pb-3 pl-2">Item Name</th>
                                             <th className="pb-3">Batch No</th>
                                             <th className="pb-3">Expiry</th>
                                             <th className="pb-3">Quantity</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-50">
                                         {transfer.items.map((item, idx) => (
                                             <tr key={idx} className="hover:bg-slate-50">
                                                 <td className="py-3 pl-2 font-medium text-slate-800">{item.productName}</td>
                                                 <td className="py-3 font-mono text-slate-500">{item.batchNumber}</td>
                                                 <td className="py-3 text-slate-600">{item.expiryDate}</td>
                                                 <td className="py-3 font-bold text-teal-700">{item.quantity} units</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                             <div className="bg-slate-50 p-6 border-t border-slate-100">
                                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Processing Timeline</h4>
                                 <div className="space-y-4">
                                     {transfer.workflow.logs.map((log, i) => (
                                         <div key={i} className="flex gap-4 relative">
                                             {i !== transfer.workflow.logs.length - 1 && (
                                                <div className="absolute left-[11px] top-6 bottom-[-20px] w-0.5 bg-slate-200"></div>
                                             )}
                                             <div className="relative z-10 w-6 h-6 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center shrink-0">
                                                 <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                                             </div>
                                             <div>
                                                 <div className="flex items-baseline gap-2">
                                                     <span className="font-bold text-slate-800">{log.action}</span>
                                                     <span className="text-xs text-slate-400"><Clock size={10} className="inline mr-1"/>{log.timestamp}</span>
                                                 </div>
                                                 <p className="text-xs text-slate-500">
                                                     by <span className="font-medium text-teal-700">{log.user}</span> • <span className="italic">{log.role}</span>
                                                 </p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     )
                 })
             )}
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-xl font-bold text-slate-900">Add New Stock</h3>
                          <p className="text-slate-500 text-sm">Enter stock details for {activeBranchName}</p>
                      </div>
                      <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      {/* Product Selection */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                           <div className="flex gap-4 mb-4">
                               <button 
                                 onClick={() => setNewStock({...newStock, isNewProduct: false})}
                                 className={`flex-1 py-2 text-sm font-bold rounded-lg ${!newStock.isNewProduct ? 'bg-white shadow text-teal-700' : 'text-slate-500'}`}
                               >
                                   Existing Product
                               </button>
                               <button 
                                 onClick={() => setNewStock({...newStock, isNewProduct: true})}
                                 className={`flex-1 py-2 text-sm font-bold rounded-lg ${newStock.isNewProduct ? 'bg-white shadow text-teal-700' : 'text-slate-500'}`}
                               >
                                   Create New Product
                               </button>
                           </div>
                           
                           {!newStock.isNewProduct ? (
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Product</label>
                                   <select 
                                     className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                     value={newStock.productId}
                                     onChange={(e) => setNewStock({...newStock, productId: e.target.value})}
                                   >
                                       <option value="">-- Choose Product --</option>
                                       {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.genericName})</option>)}
                                   </select>
                               </div>
                           ) : (
                               <div className="space-y-3">
                                   <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
                                       <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. DawaX 500mg" value={newStock.name} onChange={e => setNewStock({...newStock, name: e.target.value})} />
                                   </div>
                                   <div className="grid grid-cols-2 gap-3">
                                       <div>
                                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Generic Name</label>
                                           <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Paracetamol" value={newStock.genericName} onChange={e => setNewStock({...newStock, genericName: e.target.value})} />
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                           <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Painkiller" value={newStock.category} onChange={e => setNewStock({...newStock, category: e.target.value})} />
                                       </div>
                                   </div>
                                   <div className="grid grid-cols-3 gap-3">
                                        <div>
                                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cost Price</label>
                                           <input type="number" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="0.00" value={newStock.costPrice} onChange={e => setNewStock({...newStock, costPrice: e.target.value})} />
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Selling Price</label>
                                           <input type="number" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="0.00" value={newStock.price} onChange={e => setNewStock({...newStock, price: e.target.value})} />
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
                                           <select className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={newStock.unit} onChange={e => setNewStock({...newStock, unit: e.target.value})}>
                                               <option>Box</option><option>Strip</option><option>Bottle</option><option>Vial</option>
                                           </select>
                                       </div>
                                   </div>
                               </div>
                           )}
                      </div>

                      {/* Batch Details */}
                      <div>
                           <h4 className="font-bold text-slate-800 text-sm mb-3">Batch & Quantity Details</h4>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batch Number</label>
                                   <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm font-mono" placeholder="BATCH-001" value={newStock.batchNumber} onChange={e => setNewStock({...newStock, batchNumber: e.target.value})} />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                                   <input type="date" className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={newStock.expiryDate} onChange={e => setNewStock({...newStock, expiryDate: e.target.value})} />
                               </div>
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity to Add</label>
                               <input type="number" className="w-full p-3 border border-slate-300 rounded-lg font-bold text-lg" placeholder="0" value={newStock.quantity} onChange={e => setNewStock({...newStock, quantity: e.target.value})} />
                           </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
                      <button 
                        onClick={handleSaveStock}
                        disabled={!newStock.quantity || (!newStock.isNewProduct && !newStock.productId) || (newStock.isNewProduct && !newStock.name)}
                        className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                          <Save size={18} /> Save to Inventory
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
           <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-lg font-bold text-slate-900">Adjust Stock</h3>
                          <p className="text-slate-500 text-xs">{selectedItem.name}</p>
                      </div>
                      <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="bg-slate-50 p-4 rounded-xl text-center">
                          <p className="text-xs text-slate-500 uppercase font-bold">Current Stock</p>
                          <p className="text-3xl font-bold text-slate-800">{selectedItem.totalStock} <span className="text-sm font-normal text-slate-400">{selectedItem.unit}s</span></p>
                      </div>

                      <div className="flex gap-2">
                          <button 
                            onClick={() => setAdjustment({...adjustment, type: 'ADD'})}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 ${adjustment.type === 'ADD' ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' : 'bg-slate-100 text-slate-500'}`}
                          >
                              <Plus size={16} /> Add Stock
                          </button>
                          <button 
                            onClick={() => setAdjustment({...adjustment, type: 'REMOVE'})}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 ${adjustment.type === 'REMOVE' ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500' : 'bg-slate-100 text-slate-500'}`}
                          >
                              <X size={16} /> Remove / Damage
                          </button>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                          <input type="number" className="w-full p-3 border border-slate-300 rounded-lg text-lg font-bold" placeholder="0" value={adjustment.quantity} onChange={e => setAdjustment({...adjustment, quantity: e.target.value})} />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason</label>
                          <select className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={adjustment.reason} onChange={e => setAdjustment({...adjustment, reason: e.target.value})}>
                              <option>Restock / Purchase</option>
                              <option>Stock Taking Correction</option>
                              <option>Damaged / Expired</option>
                              <option>Internal Use</option>
                          </select>
                      </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => setShowAdjustModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
                      <button onClick={handleAdjustStock} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-600/20">
                          Confirm Adjustment
                      </button>
                  </div>
               </div>
           </div>
      )}
    </div>
  );
};

export default Inventory;
