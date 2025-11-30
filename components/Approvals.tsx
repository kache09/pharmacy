
import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Package, 
  Calendar, 
  MapPin,
  AlertOctagon,
  ArrowRight,
  Filter
} from 'lucide-react';
import { INITIAL_EXPENSES, MOCK_REQUISITIONS, BRANCHES } from '../data/mockData';
import { Expense, StockRequisition } from '../types';

const Approvals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'stock'>('expenses');
  
  // Local state to simulate approvals/rejections
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [requisitions, setRequisitions] = useState<StockRequisition[]>(MOCK_REQUISITIONS);

  const pendingExpenses = expenses.filter(e => e.status === 'Pending');
  const pendingRequisitions = requisitions.filter(r => r.status === 'PENDING');

  const handleExpenseAction = (id: number, action: 'Approved' | 'Rejected') => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: action } : e));
  };

  const handleRequisitionAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    if (action === 'APPROVED') {
        alert("Requisition Approved! The system will now open the Shipment Creation wizard pre-filled with these items.");
        // In a real app, this would redirect to Inventory > New Shipment with data
    }
  };

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
                <DollarSign size={16} /> Expense Requests
                {pendingExpenses.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingExpenses.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'stock' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Package size={16} /> Stock Requisitions
                {pendingRequisitions.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequisitions.length}</span>}
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
                                          {BRANCHES.find(b => b.id === expense.branchId)?.name}
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
                                            onClick={() => handleExpenseAction(expense.id, 'Approved')}
                                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors" title="Approve"
                                          >
                                              <CheckCircle size={18} />
                                          </button>
                                          <button 
                                            onClick={() => handleExpenseAction(expense.id, 'Rejected')}
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
                                                  {BRANCHES.find(b => b.id === req.branchId)?.name}
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
                                            onClick={() => handleRequisitionAction(req.id, 'REJECTED')}
                                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-medium text-sm"
                                          >
                                              Reject
                                          </button>
                                          <button 
                                            onClick={() => handleRequisitionAction(req.id, 'APPROVED')}
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
      </div>
    </div>
  );
};

export default Approvals;
