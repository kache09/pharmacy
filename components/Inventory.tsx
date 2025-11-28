import React from 'react';
import { Package, AlertTriangle, Calendar, RefreshCcw } from 'lucide-react';
import { Product } from '../types';

const MOCK_INVENTORY: Product[] = [
  { 
      id: '1', name: 'Panadol Extra', genericName: 'Paracetamol', category: 'Painkiller', price: 5000, unit: 'Strip', minStockLevel: 50, totalStock: 120, requiresPrescription: false, 
      batches: [
          { batchNumber: 'PANA-001', expiryDate: '2025-06-01', quantity: 80 },
          { batchNumber: 'PANA-002', expiryDate: '2024-01-15', quantity: 40 } // Expiring soon
      ] 
  },
  { 
      id: '2', name: 'Augmentin 625mg', genericName: 'Amox/Clav', category: 'Antibiotic', price: 15000, unit: 'Box', minStockLevel: 20, totalStock: 15, requiresPrescription: true, 
      batches: [
          { batchNumber: 'AUG-992', expiryDate: '2024-12-01', quantity: 15 } // Low Stock
      ] 
  },
  { 
      id: '3', name: 'Metformin 500mg', genericName: 'Metformin', category: 'Diabetes', price: 8000, unit: 'Box', minStockLevel: 10, totalStock: 200, requiresPrescription: true, 
      batches: [
          { batchNumber: 'MET-101', expiryDate: '2026-01-01', quantity: 200 }
      ] 
  }
];

const Inventory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
          <p className="text-slate-500">Real-time stock across Kariakoo Branch (Current)</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm">
             <RefreshCcw size={16} /> Sync MSD
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm shadow-md shadow-teal-600/20">
             <Package size={16} /> Receive Stock (GRN)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_INVENTORY.map((product) => {
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
                       <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>{product.totalStock} {product.unit}s</span>
                       {isLowStock && <AlertTriangle size={14} className="text-red-500" />}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {product.batches.map((batch) => {
                         const expiry = new Date(batch.expiryDate);
                         const isExpiring = expiry.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days
                         return (
                            <div key={batch.batchNumber} className="flex items-center gap-2 text-xs">
                               <span className="font-mono text-slate-500">{batch.batchNumber}</span>
                               <span className={`flex items-center gap-1 ${isExpiring ? 'text-amber-600 font-bold' : 'text-emerald-600'}`}>
                                 <Calendar size={10} />
                                 {batch.expiryDate}
                               </span>
                               <span className="text-slate-400">({batch.quantity})</span>
                            </div>
                         )
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-teal-600 font-medium hover:text-teal-800">Edit</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
