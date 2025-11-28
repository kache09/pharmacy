import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, Receipt, CreditCard,
  FileText, Plus, Download, Filter, Wallet, Building
} from 'lucide-react';

const INCOME_VS_EXPENSE_DATA = [
  { name: 'Mon', income: 1200000, expense: 300000 },
  { name: 'Tue', income: 1500000, expense: 250000 },
  { name: 'Wed', income: 980000, expense: 450000 },
  { name: 'Thu', income: 1700000, expense: 320000 },
  { name: 'Fri', income: 2100000, expense: 500000 },
  { name: 'Sat', income: 2400000, expense: 600000 },
  { name: 'Sun', income: 1100000, expense: 200000 },
];

const PAYMENT_METHODS_DATA = [
  { name: 'Cash', value: 4500000 },
  { name: 'M-Pesa / Tigo', value: 3500000 },
  { name: 'Insurance (NHIF/AAR)', value: 2500000 },
  { name: 'Credit', value: 500000 },
];

const EXPENSES_LIST = [
  { id: 1, category: 'Utilities', description: 'Electricity Bill (Luku)', amount: 150000, date: '2023-10-25', status: 'Approved' },
  { id: 2, category: 'Supplies', description: 'Packaging Bags', amount: 45000, date: '2023-10-24', status: 'Pending' },
  { id: 3, category: 'Maintenance', description: 'AC Repair', amount: 80000, date: '2023-10-23', status: 'Approved' },
  { id: 4, category: 'Transport', description: 'Staff Transport Allowance', amount: 25000, date: '2023-10-23', status: 'Approved' },
];

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#64748b'];

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'tax'>('overview');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Finance & Accounting</h2>
          <p className="text-slate-500 mt-1">Manage cash flow, expenses, and TRA tax compliance.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'overview' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
           >
             Overview
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

      {activeTab === 'overview' && <OverviewSection />}
      {activeTab === 'expenses' && <ExpensesSection />}
      {activeTab === 'tax' && <TaxSection />}
    </div>
  );
};

const OverviewSection = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
     {/* KPI Cards */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Gross Revenue" value="TZS 10.9M" subtext="This Month" icon={DollarSign} color="bg-emerald-600" />
        <StatCard title="Net Profit" value="TZS 3.2M" subtext="After Tax & Exp" icon={TrendingUp} color="bg-teal-600" />
        <StatCard title="Total Expenses" value="TZS 2.1M" subtext="23 Transactions" icon={TrendingDown} color="bg-rose-500" />
        <StatCard title="Pending Insurance" value="TZS 2.5M" subtext="NHIF / Jubilee" icon={Wallet} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income vs Expense Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800">Income vs Expenses (Weekly)</h3>
             <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-1 outline-none">
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
             </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INCOME_VS_EXPENSE_DATA} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`TZS ${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="income" name="Income" fill="#0d9488" radius={[4, 4, 0, 0]} />
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
                 <span className="text-2xl font-bold text-slate-800">11M</span>
                 <p className="text-xs text-slate-500 uppercase">Total</p>
               </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {PAYMENT_METHODS_DATA.map((method, index) => (
              <div key={method.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-slate-600">{method.name}</span>
                </div>
                <span className="font-medium text-slate-900">{Math.round((method.value / 11000000) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
  </div>
);

const ExpensesSection = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Operational Expenses</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium text-sm shadow-md shadow-rose-600/20">
                <Plus size={16} /> Record Expense
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {EXPENSES_LIST.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-800">{exp.description}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{exp.category}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{exp.date}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">TZS {exp.amount.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {exp.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const TaxSection = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building size={24} className="text-teal-600" />
                        TRA VAT Report
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Tax Identification Number (TIN): 123-456-789</p>
                    <p className="text-slate-500 text-sm">VRN: 40-123456-Q</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm">
                    <Download size={16} /> Export EFD Report
                </button>
            </div>

            <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600 font-medium">Total Taxable Value (A)</span>
                        <span className="font-bold text-slate-900">TZS 9,237,288</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600 font-medium">VAT Amount (18%) (B)</span>
                        <span className="font-bold text-slate-900">TZS 1,662,712</span>
                    </div>
                    <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center">
                         <span className="text-teal-900 font-bold text-lg">Total Sales (A+B)</span>
                         <span className="text-teal-900 font-bold text-lg">TZS 10,900,000</span>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-800 mb-4">Daily Tax Breakdown</h4>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="p-3 rounded-l-lg">Date</th>
                                <th className="p-3">Gross Sales</th>
                                <th className="p-3">VAT (18%)</th>
                                <th className="p-3 rounded-r-lg">Net Sales</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="p-3">25 Oct 2023</td>
                                <td className="p-3">2,400,000</td>
                                <td className="p-3 text-slate-500">366,101</td>
                                <td className="p-3 font-medium">2,033,899</td>
                            </tr>
                            <tr>
                                <td className="p-3">24 Oct 2023</td>
                                <td className="p-3">2,100,000</td>
                                <td className="p-3 text-slate-500">320,338</td>
                                <td className="p-3 font-medium">1,779,662</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-teal-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="font-medium text-teal-200 mb-1">Estimated VAT Payable</h4>
                    <h2 className="text-3xl font-bold mb-4">TZS 1.66M</h2>
                    <p className="text-xs text-teal-300 mb-6">Due by: 30 Oct 2023</p>
                    <button className="w-full py-3 bg-white text-teal-900 font-bold rounded-lg hover:bg-teal-50 transition-colors">
                        File Return Now
                    </button>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Building size={120} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all group">
                         <span className="text-sm font-medium text-slate-600 group-hover:text-teal-700">Add Supplier Invoice</span>
                         <Plus size={16} className="text-slate-400 group-hover:text-teal-600"/>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all group">
                         <span className="text-sm font-medium text-slate-600 group-hover:text-teal-700">Generate EFD Report</span>
                         <Receipt size={16} className="text-slate-400 group-hover:text-teal-600"/>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

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