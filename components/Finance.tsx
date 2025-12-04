
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, Receipt,
  FileText, Plus, X, Printer, Store, Wallet, Building, CheckCircle, FilePlus, User, Eye
} from 'lucide-react';
import { Invoice, PaymentMethod, Expense, Sale, Branch } from '../types';

const PAYMENT_METHODS_DATA = [
  { name: 'Cash', value: 4500000 },
  { name: 'M-Pesa / Tigo', value: 3500000 },
  { name: 'Insurance (NHIF/AAR)', value: 2500000 },
  { name: 'Credit', value: 500000 },
];

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#64748b'];

interface FinanceProps {
    currentBranchId: string;
    invoices: Invoice[];
    expenses: Expense[];
    sales: Sale[];
    onProcessPayment: (invoice: Invoice) => void;
    onCreateExpense: (expense: Expense) => void;
    branches?: Branch[];
}

const Finance: React.FC<FinanceProps> = ({ currentBranchId, invoices, expenses, sales, onProcessPayment, onCreateExpense, branches = [] }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses' | 'tax'>('overview');
  
  // Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false); // New Preview Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form States
  const [newInvoice, setNewInvoice] = useState({ customer: '', amount: '', description: '', due: '' });
  const [newPayment, setNewPayment] = useState({ amount: '', receipt: '', method: PaymentMethod.CASH });
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Utilities',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';

  // Filter Data Logic
  const filteredInvoices = isHeadOffice ? invoices : invoices.filter(i => i.branchId === currentBranchId);
  const filteredExpenses = isHeadOffice ? expenses : expenses.filter(e => e.branchId === currentBranchId);
  const filteredSales = isHeadOffice ? sales : sales.filter(s => s.branchId === currentBranchId);

  // DYNAMIC CALCULATIONS
  const stats = useMemo(() => {
    const revenue = filteredSales.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const profit = filteredSales.reduce((acc, curr) => acc + curr.profit, 0);
    const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = profit - totalExpenses;
    const receivables = filteredInvoices.reduce((acc, i) => acc + (i.totalAmount - i.paidAmount), 0);

    return { revenue, netProfit, totalExpenses, receivables };
  }, [filteredSales, filteredExpenses, filteredInvoices]);

  // Income Vs Expense Chart Data
  const incomeVsExpenseData = useMemo(() => {
      const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
      });

      return last7Days.map(dateStr => {
          const daySales = filteredSales.filter(s => s.date.startsWith(dateStr));
          const dayExpenses = filteredExpenses.filter(e => e.date === dateStr);
          
          return {
              name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
              sales: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
              expense: dayExpenses.reduce((sum, e) => sum + e.amount, 0)
          };
      });
  }, [filteredSales, filteredExpenses]);

  const handleCreateInvoice = () => {
    if(!newInvoice.customer || !newInvoice.amount) return;
    
    const invoice: Invoice = {
      id: `INV-2023-${Math.floor(Math.random() * 1000)}`,
      branchId: isHeadOffice ? 'BR001' : currentBranchId, // Default to BR001 if HO creates
      customerName: newInvoice.customer,
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.due || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      totalAmount: parseFloat(newInvoice.amount),
      paidAmount: 0,
      status: 'UNPAID',
      description: newInvoice.description || 'General Supplies',
      source: 'MANUAL',
      items: [],
      payments: []
    };

    onProcessPayment(invoice); // Using shared handler to add to list
    setShowInvoiceModal(false);
    setNewInvoice({ customer: '', amount: '', description: '', due: '' });
  };

  const handleRecordPayment = () => {
    if(!selectedInvoice || !newPayment.amount || !newPayment.receipt) return;
    
    const amount = parseFloat(newPayment.amount);
    const newPaidAmount = selectedInvoice.paidAmount + amount;
    
    let newStatus: Invoice['status'] = 'PARTIAL';
    if(newPaidAmount >= selectedInvoice.totalAmount) newStatus = 'PAID';
    if(newPaidAmount === 0) newStatus = 'UNPAID';

    const updatedInvoice: Invoice = {
        ...selectedInvoice,
        paidAmount: newPaidAmount,
        status: newStatus,
        payments: [
            ...selectedInvoice.payments,
            {
                id: `PAY-${Date.now()}`,
                amount: amount,
                date: new Date().toISOString().split('T')[0],
                receiptNumber: newPayment.receipt,
                method: newPayment.method,
                recordedBy: 'Current User'
            }
        ]
    };

    onProcessPayment(updatedInvoice); // This triggers inventory deduction in App.tsx if fully paid
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setNewPayment({ amount: '', receipt: '', method: PaymentMethod.CASH });
  };

  const handleRecordExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;

    const expense: Expense = {
      id: Date.now(),
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      status: 'Pending', // Default status is Pending for new expenses
      branchId: currentBranchId
    };

    onCreateExpense(expense);
    setShowExpenseModal(false);
    setNewExpense({
      description: '',
      category: 'Utilities',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    alert("Expense recorded successfully! It has been sent to Head Office for approval.");
  };

  const handleViewInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPreviewModal(true);
  };

  const handlePrintInvoice = () => {
      window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Finance & Accounting</h2>
          <p className="text-slate-500 mt-1">
             {isHeadOffice ? 'Global Financial Overview' : `Financials for ${branches.find(b => b.id === currentBranchId)?.name}`}
          </p>
        </div>
        <div className="flex gap-2 no-print">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'overview' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
           >
             Overview
           </button>
           <button 
             onClick={() => setActiveTab('invoices')}
             className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'invoices' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
           >
             Invoicing & POS
           </button>
           <button 
             onClick={() => setActiveTab('expenses')}
             className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'expenses' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
           >
             Expenses
           </button>
           <button 
             onClick={() => setActiveTab('tax')}
             className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'tax' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
           >
             Tax & TRA
           </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* KPI Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Gross Revenue" value={`TZS ${(stats.revenue / 1000000).toFixed(2)}M`} subtext="All Time" icon={DollarSign} color="bg-emerald-600" />
              <StatCard title="Net Profit" value={`TZS ${(stats.netProfit / 1000000).toFixed(2)}M`} subtext="After Tax & Exp" icon={TrendingUp} color="bg-teal-600" />
              <StatCard title="Total Expenses" value={`TZS ${(stats.totalExpenses / 1000000).toFixed(2)}M`} subtext={`${filteredExpenses.length} Transactions`} icon={TrendingDown} color="bg-rose-500" />
              <StatCard title="Outstanding Invoices" value={`TZS ${(stats.receivables/1000000).toFixed(2)}M`} subtext="Receivables" icon={FileText} color="bg-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Income vs Expense Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-800">Income vs Expenses (7 Days)</h3>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeVsExpenseData} barGap={0}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip 
                          cursor={{fill: '#f1f5f9'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`TZS ${value.toLocaleString()}`, '']}
                      />
                      <Bar dataKey="sales" name="Income" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Payment Breakdown</h3>
                <div className="h-60 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PAYMENT_METHODS_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {PAYMENT_METHODS_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `TZS ${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="text-center">
                       <span className="text-2xl font-bold text-slate-800">100%</span>
                       <p className="text-xs text-slate-500 uppercase">Mix</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-center mb-6 no-print">
                <h3 className="text-lg font-bold text-slate-800">Invoices & Receivables</h3>
                <button 
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm shadow-md shadow-teal-600/20"
                >
                    <FilePlus size={16} /> Create Manual Invoice
                </button>
           </div>
           
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Invoice ID</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Origin</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total Amount</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Paid / Balance</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {filteredInvoices.map((inv) => {
                         const balance = inv.totalAmount - inv.paidAmount;
                         return (
                           <tr key={inv.id} className="hover:bg-slate-50">
                               <td className="px-6 py-4 font-mono text-sm text-slate-600">{inv.id}</td>
                               <td className="px-6 py-4">
                                   {inv.source === 'POS' ? (
                                       <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                           <Store size={10} /> POS
                                       </span>
                                   ) : (
                                       <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">
                                           <FileText size={10} /> Manual
                                       </span>
                                   )}
                               </td>
                               <td className="px-6 py-4">
                                   <div className="font-bold text-slate-800 text-sm">{inv.customerName}</div>
                                   <div className="text-xs text-slate-500">{inv.description}</div>
                               </td>
                               <td className="px-6 py-4 font-bold text-slate-800">TZS {inv.totalAmount.toLocaleString()}</td>
                               <td className="px-6 py-4 text-sm">
                                   <div className="flex flex-col">
                                       <span className="text-emerald-600 font-medium">{inv.paidAmount.toLocaleString()}</span>
                                       {balance > 0 && <span className="text-rose-500 text-xs">Bal: {balance.toLocaleString()}</span>}
                                   </div>
                               </td>
                               <td className="px-6 py-4">
                                   <span className={`px-2 py-1 rounded text-xs font-bold ${
                                       inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                       inv.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                                       'bg-rose-100 text-rose-700'
                                   }`}>
                                       {inv.status}
                                   </span>
                               </td>
                               <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleViewInvoice(inv)}
                                            className="text-slate-500 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded" 
                                            title="View Invoice"
                                        >
                                            <Eye size={16} />
                                        </button>
                                       {inv.status !== 'PAID' ? (
                                         <button 
                                           onClick={() => { setSelectedInvoice(inv); setShowPaymentModal(true); }}
                                           className="text-teal-600 hover:text-teal-800 font-bold text-xs bg-teal-50 px-2 py-1 rounded hover:bg-teal-100 flex items-center gap-1 transition-colors"
                                         >
                                            <Wallet size={12} /> Pay Now
                                         </button>
                                       ) : (
                                          <span className="text-slate-400 text-xs flex items-center gap-1 px-2">
                                              <CheckCircle size={12} /> Paid
                                          </span>
                                       )}
                                   </div>
                               </td>
                           </tr>
                         )
                       })}
                   </tbody>
               </table>
           </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6 no-print">
                <h3 className="text-lg font-bold text-slate-800">Operational Expenses</h3>
                {!isHeadOffice && (
                <button 
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium text-sm shadow-md shadow-rose-600/20"
                >
                    <Plus size={16} /> Record Expense
                </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Branch</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredExpenses.map((exp) => (
                            <tr key={exp.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800">{exp.description}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{exp.category}</td>
                                <td className="px-6 py-4 text-xs text-slate-500">{branches.find(b => b.id === exp.branchId)?.name}</td>
                                <td className="px-6 py-4 font-bold text-slate-800">TZS {exp.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                                      exp.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>
                                        {exp.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredExpenses.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">No expenses recorded for this view.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building size={24} className="text-teal-600" />
                        TRA VAT Report {isHeadOffice && '(Consolidated)'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Tax Identification Number (TIN): 123-456-789</p>
                </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600 font-medium">Total Taxable Value</span>
                    <span className="font-bold text-slate-900">TZS {(stats.revenue * 0.82).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600 font-medium">VAT Amount (18%)</span>
                    <span className="font-bold text-slate-900">TZS {(stats.revenue * 0.18).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
            </div>
           </div>
        </div>
      )}

      {/* Invoice Modal (New) */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Invoice</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Customer Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                              type="text" 
                              className="w-full pl-9 p-2 border border-slate-300 rounded-lg" 
                              placeholder="e.g. Aga Khan Hospital"
                              value={newInvoice.customer}
                              onChange={e => setNewInvoice({...newInvoice, customer: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-slate-300 rounded-lg" 
                          placeholder="Items Summary"
                          value={newInvoice.description}
                          onChange={e => setNewInvoice({...newInvoice, description: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Total Amount</label>
                            <input 
                              type="number" 
                              className="w-full p-2 border border-slate-300 rounded-lg" 
                              placeholder="0.00"
                              value={newInvoice.amount}
                              onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Due Date</label>
                            <input 
                              type="date" 
                              className="w-full p-2 border border-slate-300 rounded-lg"
                              value={newInvoice.due}
                              onChange={e => setNewInvoice({...newInvoice, due: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                    <button onClick={handleCreateInvoice} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Create Invoice</button>
                </div>
            </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Record Payment</h3>
                <p className="text-sm text-slate-500 mb-4">For Invoice #{selectedInvoice.id}</p>
                <div className="p-3 bg-slate-50 rounded-lg mb-4 text-sm">
                    <div className="flex justify-between mb-1">
                        <span>Total Due:</span>
                        <span className="font-bold">{selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                        <span>Remaining Balance:</span>
                        <span className="font-bold">{(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Receipt Number (TRA)</label>
                        <div className="relative">
                            <Receipt size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                              type="text" 
                              className="w-full pl-9 p-2 border border-slate-300 rounded-lg" 
                              placeholder="e.g. REC-12345678"
                              value={newPayment.receipt}
                              onChange={e => setNewPayment({...newPayment, receipt: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Payment Amount</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                              type="number" 
                              className="w-full pl-9 p-2 border border-slate-300 rounded-lg" 
                              placeholder="0.00"
                              value={newPayment.amount}
                              onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                         <label className="text-sm font-medium text-slate-700">Payment Method</label>
                         <select 
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            value={newPayment.method}
                            onChange={(e) => setNewPayment({...newPayment, method: e.target.value as PaymentMethod})}
                         >
                            <option value={PaymentMethod.CASH}>Cash</option>
                            <option value={PaymentMethod.MOBILE_MONEY}>Mobile Money</option>
                            <option value={PaymentMethod.INSURANCE}>Insurance</option>
                         </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                    <button onClick={handleRecordPayment} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Save Payment</button>
                </div>
            </div>
        </div>
      )}

      {/* Preview Invoice Modal (New) */}
      {showPreviewModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 no-print">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
                       <h3 className="font-bold flex items-center gap-2">
                           <FileText size={18} className="text-blue-400"/> Invoice Preview
                       </h3>
                       <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-white">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                       <div className="bg-white border border-slate-200 p-8 shadow-sm text-sm">
                           {/* Invoice Header */}
                           <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                               <div>
                                   <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">
                                       {selectedInvoice.status === 'PAID' ? 'Tax Invoice' : 'Proforma Invoice'}
                                   </h1>
                                   <p className="text-slate-500 mt-1">Invoice #: {selectedInvoice.id}</p>
                                   <p className="text-slate-500">Date: {selectedInvoice.dateIssued}</p>
                                   <p className="text-slate-500">Due Date: {selectedInvoice.dueDate}</p>
                                   <span className={`inline-block px-2 py-0.5 mt-2 rounded text-xs font-bold ${
                                       selectedInvoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                   }`}>
                                       {selectedInvoice.status}
                                   </span>
                               </div>
                               <div className="text-right">
                                   <h2 className="font-bold text-slate-900 text-lg">PMS Pharmacy</h2>
                                   <p className="text-slate-500">TIN: 123-456-789</p>
                                   <p className="text-slate-500">VRN: 40-001234</p>
                                   <p className="text-slate-500 mt-2">Bill To:</p>
                                   <p className="font-bold text-slate-800 text-lg">{selectedInvoice.customerName}</p>
                               </div>
                           </div>
                           
                           {/* Items Table */}
                           <table className="w-full text-left mb-6">
                               <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                   <tr>
                                       <th className="py-2 pl-2">Item Description</th>
                                       <th className="py-2 text-center">Qty</th>
                                       <th className="py-2 text-right">Unit Price</th>
                                       <th className="py-2 text-right pr-2">Total</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                   {selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items.map((item, idx) => (
                                       <tr key={idx}>
                                           <td className="py-3 pl-2 font-medium">{item.name}</td>
                                           <td className="py-3 text-center">{item.quantity}</td>
                                           <td className="py-3 text-right">{item.price.toLocaleString()}</td>
                                           <td className="py-3 text-right pr-2">{(item.price * item.quantity).toLocaleString()}</td>
                                       </tr>
                                   )) : (
                                       <tr>
                                           <td colSpan={4} className="py-4 pl-2 text-slate-500 italic">
                                               {selectedInvoice.description || 'Consolidated Invoice Items'}
                                           </td>
                                       </tr>
                                   )}
                               </tbody>
                           </table>
                           
                           {/* Totals */}
                           <div className="flex justify-end">
                               <div className="w-64 space-y-2">
                                   <div className="flex justify-between text-slate-500">
                                       <span>Subtotal:</span>
                                       <span>{(selectedInvoice.totalAmount / 1.18).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                   </div>
                                   <div className="flex justify-between text-slate-500">
                                       <span>VAT (18%):</span>
                                       <span>{(selectedInvoice.totalAmount - (selectedInvoice.totalAmount / 1.18)).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                   </div>
                                   <div className="flex justify-between font-bold text-xl text-slate-900 border-t border-slate-200 pt-3">
                                       <span>Grand Total:</span>
                                       <span>{selectedInvoice.totalAmount.toLocaleString()} TZS</span>
                                   </div>
                                   <div className="flex justify-between text-emerald-600 font-medium pt-1">
                                       <span>Amount Paid:</span>
                                       <span>- {selectedInvoice.paidAmount.toLocaleString()}</span>
                                   </div>
                                   <div className="flex justify-between text-rose-600 font-bold border-t border-slate-100 pt-2">
                                       <span>Balance Due:</span>
                                       <span>{(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()} TZS</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>

                   <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3">
                       <button 
                           onClick={() => setShowPreviewModal(false)}
                           className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg border border-slate-200"
                       >
                          Close
                       </button>
                       <button 
                           onClick={handlePrintInvoice}
                           className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 flex items-center gap-2"
                       >
                          <Printer size={16} /> Print
                       </button>
                       {selectedInvoice.status !== 'PAID' && (
                           <button 
                               onClick={() => { setShowPreviewModal(false); setShowPaymentModal(true); }}
                               className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-md flex items-center gap-2"
                           >
                              <Wallet size={16} /> Process Payment
                           </button>
                       )}
                   </div>
              </div>
          </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Record Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-slate-300 rounded-lg" 
                  placeholder="e.g. Office Cleaning"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-medium text-slate-700">Category</label>
                   <select 
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      value={newExpense.category}
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                   >
                      <option>Utilities</option>
                      <option>Supplies</option>
                      <option>Maintenance</option>
                      <option>Transport</option>
                      <option>Salary/Wages</option>
                      <option>Other</option>
                   </select>
                </div>
                <div>
                   <label className="text-sm font-medium text-slate-700">Amount (TZS)</label>
                   <input 
                      type="number" 
                      className="w-full p-2 border border-slate-300 rounded-lg" 
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                   />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                <button 
                  onClick={handleRecordExpense} 
                  disabled={!newExpense.amount || !newExpense.description}
                  className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit for Approval
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Print View Hidden on Screen - Visible only during print via CSS class */}
      <div className="print-only">
           <div className="max-w-xl mx-auto border border-black p-8 text-black">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold uppercase">PMS Pharmacy</h1>
                    <p>TIN: 123-456-789 | VRN: 40-001234</p>
                    <p>Bagamoyo Road, Dar es Salaam</p>
                    <p>Tel: +255 700 123 456</p>
                </div>
                <hr className="border-black my-4"/>
                <div className="flex justify-between font-bold text-lg mb-2">
                    <span>{selectedInvoice?.status === 'PAID' ? 'TAX INVOICE' : 'PROFORMA INVOICE'}</span>
                </div>
                <p>Invoice #: {selectedInvoice?.id || '---'}</p>
                <p>Date: {selectedInvoice?.dateIssued || new Date().toISOString().split('T')[0]}</p>
                <p>Customer: {selectedInvoice?.customerName}</p>
                <hr className="border-black my-4"/>
                <table className="w-full text-left mb-6">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="py-2">Item</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Price</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedInvoice?.items?.map((item, idx) => (
                             <tr key={idx}>
                                 <td className="py-2">{item.name}</td>
                                 <td className="py-2 text-right">{item.quantity}</td>
                                 <td className="py-2 text-right">{item.price.toLocaleString()}</td>
                                 <td className="py-2 text-right">{(item.price * item.quantity).toLocaleString()}</td>
                             </tr>
                        )) || (
                            <tr>
                                <td colSpan={4} className="py-4 text-center">Consolidated Invoice Service</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <hr className="border-black my-4"/>
                <div className="flex justify-between font-bold text-xl">
                    <span>TOTAL</span>
                    <span>{selectedInvoice?.totalAmount.toLocaleString()} TZS</span>
                </div>
                {selectedInvoice?.status === 'PAID' && (
                     <div className="mt-2 text-center border border-black p-2 font-bold">PAID IN FULL</div>
                )}
                <div className="mt-8 text-center text-sm">
                    <p>Thank you for your business!</p>
                </div>
           </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-slate-400">{subtext}</span>
    </div>
  </div>
);

export default Finance;
