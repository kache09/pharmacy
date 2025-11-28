
import React, { useState } from 'react';
import { Package, AlertTriangle, Calendar, RefreshCcw, MapPin, Truck, CheckSquare, ClipboardCheck, ArrowRight, Clock } from 'lucide-react';
import { BRANCHES, PRODUCTS, BRANCH_INVENTORY, STOCK_TRANSFERS } from '../data/mockData';
import { StockTransfer, TransferStatus } from '../types';

const Inventory: React.FC<{currentBranchId: string}> = ({ currentBranchId }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'transfers'>('stock');
  const [transfers, setTransfers] = useState<StockTransfer[]>(STOCK_TRANSFERS);
  
  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';
  const activeBranchName = BRANCHES.find(b => b.id === currentBranchId)?.name;

  // Logic to merge Product Definitions with Branch Inventory Levels
  const displayedInventory = PRODUCTS.map(product => {
    let totalStock = 0;
    let batches: any[] = [];

    if (isHeadOffice) {
        Object.values(BRANCH_INVENTORY).forEach(branchStockList => {
            const item = branchStockList.find(i => i.productId === product.id);
            if (item) {
                totalStock += item.quantity;
                batches = [...batches, ...item.batches];
            }
        });
    } else {
        const branchStockList = BRANCH_INVENTORY[currentBranchId] || [];
        const item = branchStockList.find(i => i.productId === product.id);
        if (item) {
            totalStock = item.quantity;
            batches = item.batches;
        }
    }

    return { ...product, totalStock, batches };
  });

  // Filter transfers for current branch
  const branchTransfers = transfers.filter(t => 
    isHeadOffice ? true : t.targetBranchId === currentBranchId || t.sourceBranchId === currentBranchId
  );

  // --- Handlers for 2-Step Verification ---

  // Step 1: Store Keeper Confirms Physical Receipt
  const handleKeeperConfirm = (id: string) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'RECEIVED_KEEPER',
          workflow: {
            step: 'CONTROLLER_VERIFY',
            logs: [
              ...t.workflow.logs,
              { role: 'Store Keeper', action: 'Confirmed Receipt of Boxes', timestamp: new Date().toLocaleString(), user: 'Current User' }
            ]
          }
        } as StockTransfer;
      }
      return t;
    }));
  };

  // Step 2: Inventory Controller Verifies & Enters to System
  const handleControllerVerify = (id: string) => {
    // In a real app, this would make an API call to update the DB
    // Here we update local transfer state
    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'COMPLETED',
          workflow: {
            step: 'DONE',
            logs: [
              ...t.workflow.logs,
              { role: 'Inventory Controller', action: 'QA Verified & Stocked', timestamp: new Date().toLocaleString(), user: 'Current User' }
            ]
          }
        } as StockTransfer;
      }
      return t;
    }));
    
    // Simulate updating the inventory
    alert("Stock officially added to Branch Inventory System!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
             <MapPin size={16} />
             <span>{isHeadOffice ? 'Global Stock View (All Branches)' : `Stock at ${activeBranchName}`}</span>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'stock' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                Current Stock
            </button>
            <button 
                onClick={() => setActiveTab('transfers')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'transfers' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                Transfers / GRN
                {branchTransfers.filter(t => t.status !== 'COMPLETED').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {branchTransfers.filter(t => t.status !== 'COMPLETED').length}
                    </span>
                )}
            </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 border-b border-slate-100 flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 font-medium text-xs">
                    <RefreshCcw size={14} /> Sync MSD
                </button>
            </div>
            <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {displayedInventory.map((product) => {
                const isLowStock = product.totalStock <= product.minStockLevel;
                return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <div>
                        <h4 className="font-bold text-slate-800">{product.name}</h4>
                        <p className="text-xs text-slate-500">{product.genericName}</p>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                        <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                            {product.totalStock} {product.unit}s
                        </span>
                        {isLowStock && <AlertTriangle size={14} className="text-red-500" />}
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
                        <button className="text-teal-600 font-medium hover:text-teal-800">
                            {isHeadOffice ? 'View Details' : 'Edit'}
                        </button>
                    </td>
                    </tr>
                )
                })}
            </tbody>
            </table>
        </div>
      )}

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
                     // Determine UI State based on Status
                     const isComplete = transfer.status === 'COMPLETED';
                     const isReadyForKeeper = transfer.status === 'IN_TRANSIT';
                     const isReadyForController = transfer.status === 'RECEIVED_KEEPER';

                     return (
                         <div key={transfer.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                             {/* Transfer Header */}
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
                                 
                                 {/* Action Buttons for Workflow */}
                                 <div className="flex items-center gap-3">
                                     {!isHeadOffice && isReadyForKeeper && (
                                         <button 
                                            onClick={() => handleKeeperConfirm(transfer.id)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all"
                                         >
                                             <Package size={18} />
                                             <div className="text-left">
                                                 <div className="text-xs opacity-80 uppercase tracking-wide">Step 1: Store Keeper</div>
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

                                     {isComplete && (
                                         <div className="flex items-center gap-2 text-emerald-600 font-bold px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                             <CheckSquare size={18} /> All Steps Completed
                                         </div>
                                     )}
                                 </div>
                             </div>

                             {/* Items Table */}
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

                             {/* Workflow Timeline */}
                             <div className="bg-slate-50 p-6 border-t border-slate-100">
                                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Processing Timeline</h4>
                                 <div className="space-y-4">
                                     {transfer.workflow.logs.map((log, i) => (
                                         <div key={i} className="flex gap-4 relative">
                                             {/* Connector Line */}
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
                                     {/* Pending Steps Indicators */}
                                     {!isComplete && (
                                         <div className="flex gap-4 opacity-50">
                                             <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 bg-white"></div>
                                             <div className="text-slate-400 text-sm italic pt-0.5">
                                                 {transfer.status === 'IN_TRANSIT' ? 'Waiting for Receiver 1...' : 'Waiting for Receiver 2...'}
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>
                     )
                 })
             )}
        </div>
      )}
    </div>
  );
};

export default Inventory;
