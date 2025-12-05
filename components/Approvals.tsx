import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Package, 
  Calendar, 
  AlertOctagon,
  ArrowRight,
  Filter,
  Unlock,
  Trash2
} from 'lucide-react';
import { Expense, StockRequisition, StockReleaseRequest, DisposalRequest, Branch } from '../types';

interface ApprovalsProps {
    releaseRequests?: StockReleaseRequest[];
    onApproveRelease?: (req: StockReleaseRequest) => void;
    requisitions?: StockRequisition[];
    onActionRequisition?: (id: string, action: 'APPROVED' | 'REJECTED') => void;
    disposalRequests?: DisposalRequest[];
    onApproveDisposal?: (req: DisposalRequest) => void;
    expenses?: Expense[];
    onActionExpense?: (id: number, action: 'Approved' | 'Rejected') => void;
    branches?: Branch[];
}

const Approvals: React.FC<ApprovalsProps> = ({ 
    releaseRequests = [], 
    onApproveRelease,
    requisitions = [],
    onActionRequisition,
    disposalRequests = [],
    onApproveDisposal,
    expenses = [],
    onActionExpense,
    branches = []
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'stock' | 'release' | 'disposal'>('expenses');
  
  const pendingExpenses = expenses.filter(e => e.status === 'Pending');
  const pendingRequisitions = requisitions.filter(r => r.status === 'PENDING');
  const pendingRelease = releaseRequests.filter(r => r.status === 'PENDING');
  const pendingDisposal = disposalRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Approvals Hub</h2>
          <p className="text-slate-500 mt-1">Centralized authorization for branch operations.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('expenses')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'expenses' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <DollarSign size={16} /> Expense
                {pendingExpenses.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingExpenses.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'stock' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Package size={16} /> Requisitions
                {pendingRequisitions.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequisitions.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('release')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'release' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Unlock size={16} /> Release
                {pendingRelease.length > 0 && <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRelease.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('disposal')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'disposal' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Trash2 size={16} /> Disposals
                {pendingDisposal.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingDisposal.length}</span>}
            </button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'expenses' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <DollarSign size={18} className="text-teal-600" /> Pending Expenses
                      </h3>
                      <button className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Filter size={12} /> Filter
                      </button>
                  </div>
                  {pendingExpenses.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                          <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-teal-600" />
                          <p>All expenses have been reviewed. Good job!</p>
                      </div>
                  ) : (
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                              <tr>
                                  <th className="px-6 py-4">Request Date</th>
                                  <th className="px-6 py-4">Branch</th>
                                  <th className="px-6 py-4">Category</th>
                                  <th className="px-6 py-4">Description</th>
                                  <th className="px-6 py-4 text-right">Amount</th>
                                  <th className="px-6 py-4 text-center">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {pendingExpenses.map((expense) => (
                                  <tr key={expense.id} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 text-sm text-slate-500">
                                          <div className="flex items-center gap-2">
                                              <Calendar size={14} /> {expense.date}
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                          {branches.find(b => b.id === expense.branchId)?.name}
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{expense.category}</span>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                                          {expense.description}
                                      </td>
                                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                                          {expense.amount.toLocaleString()} TZS
                                      </td>
                                      <td className="px-6 py-4 flex justify-center gap-2">
                                          <button 
                                            onClick={() => onActionExpense && onActionExpense(expense.id, 'Approved')}
                                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors" title="Approve"
                                          >
                                              <CheckCircle size={18} />
                                          </button>
                                          <button 
                                            onClick={() => onActionExpense && onActionExpense(expense.id, 'Rejected')}
                                            className="p-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors" title="Reject"
                                          >
                                              <XCircle size={18} />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
              </div>
          )}

          {activeTab === 'stock' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                   <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Package size={18} className="text-teal-600" /> Pending Stock Requisitions
                      </h3>
                  </div>
                  {pendingRequisitions.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                          <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-teal-600" />
                          <p>No pending stock requests from branches.</p>
                      </div>
                  ) : (
                      <div className="divide-y divide-slate-100">
                          {pendingRequisitions.map(req => (
                              <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="flex items-center gap-4">
                                          <div className={`p-3 rounded-full ${req.priority === 'URGENT' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                              <AlertOctagon size={24} />
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                  {branches.find(b => b.id === req.branchId)?.name}
                                                  {req.priority === 'URGENT' && <span className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded animate-pulse">URGENT</span>}
                                              </h4>
                                              <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                  <Calendar size={14} /> {req.requestDate} 
                                                  <span className="text-slate-300">|</span>
                                                  Requested by <span className="font-medium text-slate-700">{req.requestedBy}</span>
                                              </p>
                                          </div>
                                      </div>
                                      <div className="flex gap-2">
                                          <button 
                                            onClick={() => onActionRequisition && onActionRequisition(req.id, 'REJECTED')}
                                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-medium text-sm"
                                          >
                                              Reject
                                          </button>
                                          <button 
                                            onClick={() => onActionRequisition && onActionRequisition(req.id, 'APPROVED')}
                                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold text-sm shadow-md flex items-center gap-2"
                                          >
                                              Approve & Ship <ArrowRight size={16} />
                                          </button>
                                      </div>
                                  </div>

                                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                      <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">Requested Items</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {req.items.map((item, i) => (
                                              <div key={i} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                                                  <div>
                                                      <div className="font-bold text-slate-700">{item.productName}</div>
                                                      <div className="text-xs text-slate-400">Current Stock: {item.currentStock}</div>
                                                  </div>
                                                  <div className="text-lg font-bold text-teal-600">
                                                      {item.requestedQty} <span className="text-xs text-slate-400 font-normal">units</span>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'release' && (
               <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Unlock size={18} className="text-amber-600" /> Pending Stock Release Requests
                      </h3>
                      <p className="text-xs text-slate-500">Authorize Quarantined Stock for Sale</p>
                  </div>
                  {pendingRelease.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                          <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-teal-600" />
                          <p>No release requests. All active stock is authorized.</p>
                      </div>
                  ) : (
                      <div className="divide-y divide-slate-100">
                           {pendingRelease.map(req => (
                               <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                                   <div className="flex justify-between items-start mb-4">
                                       <div>
                                            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                {branches.find(b => b.id === req.branchId)?.name}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1">Requested by {req.requestedBy} on {req.date}</p>
                                       </div>
                                       {onApproveRelease && (
                                           <button 
                                              onClick={() => onApproveRelease(req)}
                                              className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-md flex items-center gap-2"
                                           >
                                               <CheckCircle size={16} /> Approve Release
                                           </button>
                                       )}
                                   </div>
                                   <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                                       <table className="w-full text-left text-sm">
                                           <thead>
                                               <tr className="text-amber-900 border-b border-amber-200">
                                                   <th className="pb-2">Product Name</th>
                                                   <th className="pb-2">Batch Number</th>
                                                   <th className="pb-2 text-right">Qty to Release</th>
                                               </tr>
                                           </thead>
                                           <tbody>
                                               {req.items.map((item, i) => (
                                                   <tr key={i}>
                                                       <td className="py-2 text-amber-900 font-medium">{item.productName}</td>
                                                       <td className="py-2 text-amber-800 font-mono">{item.batchNumber}</td>
                                                       <td className="py-2 text-right font-bold text-amber-900">{item.quantity}</td>
                                                   </tr>
                                               ))}
                                           </tbody>
                                       </table>
                                   </div>
                               </div>
                           ))}
                      </div>
                  )}
               </div>
          )}

          {activeTab === 'disposal' && (
               <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-rose-50">
                      <h3 className="font-bold text-rose-800 flex items-center gap-2">
                          <Trash2 size={18} /> Pending Stock Disposal Requests
                      </h3>
                      <p className="text-xs text-rose-600">Authorize Permanent Removal of Stock</p>
                  </div>
                  {pendingDisposal.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                          <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-rose-600" />
                          <p>No disposal requests pending.</p>
                      </div>
                  ) : (
                      <div className="divide-y divide-slate-100">
                           {pendingDisposal.map(req => (
                               <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                                   <div className="flex justify-between items-start mb-4">
                                       <div>
                                            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                {branches.find(b => b.id === req.branchId)?.name}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1">Requested by {req.requestedBy} on {req.date}</p>
                                       </div>
                                       {onApproveDisposal && (
                                           <button 
                                              onClick={() => onApproveDisposal(req)}
                                              className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 shadow-md flex items-center gap-2"
                                           >
                                               <CheckCircle size={16} /> Authorize Destruction
                                           </button>
                                       )}
                                   </div>
                                   <div className="bg-rose-50 rounded-xl border border-rose-100 p-4">
                                       <table className="w-full text-left text-sm">
                                           <thead>
                                               <tr className="text-rose-900 border-b border-rose-200">
                                                   <th className="pb-2">Product Name</th>
                                                   <th className="pb-2">Batch Number</th>
                                                   <th className="pb-2">Reason</th>
                                                   <th className="pb-2 text-right">Qty</th>
                                               </tr>
                                           </thead>
                                           <tbody>
                                               {req.items.map((item, i) => (
                                                   <tr key={i}>
                                                       <td className="py-2 text-rose-900 font-medium">{item.productName}</td>
                                                       <td className="py-2 text-rose-800 font-mono">{item.batchNumber}</td>
                                                       <td className="py-2 text-rose-700">{item.reason}</td>
                                                       <td className="py-2 text-right font-bold text-rose-900">{item.quantity}</td>
                                                   </tr>
                                               ))}
                                           </tbody>
                                       </table>
                                   </div>
                               </div>
                           ))}
                      </div>
                  )}
               </div>
          )}
      </div>
    </div>
  );
};

export default Approvals;