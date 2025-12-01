
import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Download, 
  Filter, 
  Calendar,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  FileBarChart
} from 'lucide-react';
import { 
  BRANCHES, 
  WEEKLY_SALES_DATA, 
  BRANCH_FINANCE_STATS, 
  MOCK_AUDIT_LOGS,
  CATEGORY_PERFORMANCE,
  PRODUCTS
} from '../data/mockData';
import { AuditLog, BranchInventoryItem } from '../types';

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#f43f5e', '#64748b'];

interface ReportsProps {
  currentBranchId: string;
  inventory: Record<string, BranchInventoryItem[]>;
}

const Reports: React.FC<ReportsProps> = ({ currentBranchId, inventory }) => {
  const [activeTab, setActiveTab] = useState<'finance' | 'inventory' | 'audit'>('finance');
  const [auditFilter, setAuditFilter] = useState('');
  
  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';
  const branchName = BRANCHES.find(b => b.id === currentBranchId)?.name;

  // Data Filtering
  const salesData = (WEEKLY_SALES_DATA as any)[currentBranchId] || (WEEKLY_SALES_DATA as any)['BR001'];
  const financeStats = (BRANCH_FINANCE_STATS as any)[currentBranchId] || BRANCH_FINANCE_STATS['HEAD_OFFICE'];
  
  const filteredAuditLogs = MOCK_AUDIT_LOGS.filter(log => {
      const matchBranch = isHeadOffice ? true : log.branchId === currentBranchId;
      const matchSearch = log.details.toLowerCase().includes(auditFilter.toLowerCase()) || 
                          log.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
                          log.userName.toLowerCase().includes(auditFilter.toLowerCase());
      return matchBranch && matchSearch;
  });

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        const value = row[fieldName];
        // Handle strings that might contain commas
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : JSON.stringify(value, (_, v) => v === null ? '' : v);
      }).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExport = (format: string) => {
    if (format === 'PDF') {
        window.print();
        return;
    }

    let dataToExport: any[] = [];
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `PMS_${activeTab}_Report_${branchName?.replace(/\s+/g, '_')}_${dateStr}.csv`;

    if (activeTab === 'finance') {
        dataToExport = salesData.map((d: any) => ({
            Date: dateStr, 
            Day: d.name,
            Sales_Count: d.sales / 1000, // Mock calculation
            Revenue_TZS: d.revenue,
            Branch: branchName
        }));
        // Append summary row
        dataToExport.push({});
        dataToExport.push({
            Day: 'TOTAL_SUMMARY',
            Revenue_TZS: financeStats.revenue,
            Profit_TZS: financeStats.profit,
            Expenses_TZS: financeStats.expenses
        });
    } else if (activeTab === 'inventory') {
        // Build flat inventory list from props
        const branchesToExport = isHeadOffice ? Object.keys(inventory) : [currentBranchId];
        
        branchesToExport.forEach(bId => {
             const bName = BRANCHES.find(b => b.id === bId)?.name;
             const items = inventory[bId] || [];
             items.forEach(item => {
                 const product = PRODUCTS.find(p => p.id === item.productId);
                 if (product) {
                     dataToExport.push({
                         Branch: bName,
                         Product_ID: product.id,
                         Product_Name: product.name,
                         Generic_Name: product.genericName,
                         Category: product.category,
                         Quantity: item.quantity,
                         Unit: product.unit,
                         Selling_Price: item.customPrice || product.price,
                         Total_Value: item.quantity * (item.customPrice || product.price),
                         Batches: item.batches.map(b => `${b.batchNumber}(${b.expiryDate})`).join('; ')
                     });
                 }
             });
        });
    } else if (activeTab === 'audit') {
        dataToExport = filteredAuditLogs.map(log => ({
            ID: log.id,
            Timestamp: log.timestamp,
            User: log.userName,
            Action: log.action,
            Details: log.details,
            Branch: BRANCHES.find(b => b.id === log.branchId)?.name || log.branchId,
            Severity: log.severity
        }));
    }

    downloadCSV(dataToExport, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-slate-500 mt-1">
             {isHeadOffice ? 'Global Intelligence Hub' : `Performance Reports for ${branchName}`}
          </p>
        </div>
        <div className="flex gap-2 no-print">
            <button 
                onClick={() => handleExport('PDF')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm transition-colors"
            >
                <Download size={16} /> Export PDF
            </button>
            <button 
                onClick={() => handleExport('Excel')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm transition-colors"
            >
                <FileBarChart size={16} /> Export Excel
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit no-print">
          <button 
              onClick={() => setActiveTab('finance')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'finance' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
              <TrendingUp size={16} /> Financials
          </button>
          <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
              <Activity size={16} /> Inventory Health
          </button>
          <button 
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
              <ShieldAlert size={16} /> Audit Trail
          </button>
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* FINANCIAL TAB */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-slate-800">{(financeStats.revenue/1000000).toFixed(1)}M <span className="text-sm text-slate-400 font-normal">TZS</span></h3>
                        <div className="mt-2 text-xs text-emerald-600 font-bold bg-emerald-50 inline-block px-2 py-1 rounded">+12% vs last month</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500 mb-1">Gross Profit</p>
                        <h3 className="text-3xl font-bold text-slate-800">{(financeStats.profit/1000000).toFixed(1)}M <span className="text-sm text-slate-400 font-normal">TZS</span></h3>
                        <div className="mt-2 text-xs text-emerald-600 font-bold bg-emerald-50 inline-block px-2 py-1 rounded">Margin: {((financeStats.profit/financeStats.revenue)*100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500 mb-1">Op. Expenses</p>
                        <h3 className="text-3xl font-bold text-slate-800">{(financeStats.expenses/1000000).toFixed(1)}M <span className="text-sm text-slate-400 font-normal">TZS</span></h3>
                        <div className="mt-2 text-xs text-rose-600 font-bold bg-rose-50 inline-block px-2 py-1 rounded">+5% increase</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid">
                        <h4 className="font-bold text-slate-800 mb-6">Revenue Trend (7 Days)</h4>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val: number) => `TZS ${val.toLocaleString()}`}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#0d9488" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Performance */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid">
                        <h4 className="font-bold text-slate-800 mb-6">Sales by Category</h4>
                        <div className="h-72 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={CATEGORY_PERFORMANCE}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {CATEGORY_PERFORMANCE.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                             <AlertTriangle size={20} className="text-amber-500" /> Expiry Risk Forecast
                        </h4>
                        <p className="text-sm text-slate-500 mb-6">Items expiring within the next 90 days.</p>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Batch</th>
                                    <th className="px-4 py-3">Expiry</th>
                                    <th className="px-4 py-3">Est. Loss</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-4 py-3 font-medium">Augmentin 625mg</td>
                                    <td className="px-4 py-3 text-slate-500 font-mono">AUG-992</td>
                                    <td className="px-4 py-3 text-rose-600 font-bold">Dec 2023</td>
                                    <td className="px-4 py-3">225,000 TZS</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Cipro 500mg</td>
                                    <td className="px-4 py-3 text-slate-500 font-mono">CIP-001</td>
                                    <td className="px-4 py-3 text-amber-600 font-bold">Jan 2024</td>
                                    <td className="px-4 py-3">120,000 TZS</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid">
                         <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                             <TrendingUp size={20} className="text-teal-600" /> Valuation Summary
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-sm text-slate-500">Total Stock Value</p>
                                    <p className="text-xl font-bold text-slate-800">45,200,000 TZS</p>
                                </div>
                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-teal-600">
                                    <Activity size={20} />
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-sm text-slate-500">Dead Stock (Non-moving &gt; 6mo)</p>
                                    <p className="text-xl font-bold text-slate-800">1,200,000 TZS</p>
                                </div>
                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-rose-600">
                                    <XCircle size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* AUDIT TAB */}
          {activeTab === 'audit' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex gap-4 no-print">
                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input 
                            type="text" 
                            placeholder="Search audit logs..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={auditFilter}
                            onChange={(e) => setAuditFilter(e.target.value)}
                          />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                          <Calendar size={16} /> Last 30 Days
                      </div>
                  </div>
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                          <tr>
                              <th className="px-6 py-4">Timestamp</th>
                              <th className="px-6 py-4">User</th>
                              <th className="px-6 py-4">Action</th>
                              <th className="px-6 py-4">Details</th>
                              <th className="px-6 py-4">Branch</th>
                              <th className="px-6 py-4">Severity</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredAuditLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{log.timestamp}</td>
                                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                      {log.userName}
                                      <span className="block text-xs text-slate-400 font-normal">{log.userId}</span>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{log.action}</td>
                                  <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                                  <td className="px-6 py-4 text-xs text-slate-500">
                                      {BRANCHES.find(b => b.id === log.branchId)?.name || log.branchId}
                                  </td>
                                  <td className="px-6 py-4">
                                      {log.severity === 'CRITICAL' && (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-100 text-rose-700 text-xs font-bold">
                                              <ShieldAlert size={12} /> CRITICAL
                                          </span>
                                      )}
                                      {log.severity === 'WARNING' && (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-bold">
                                              <AlertTriangle size={12} /> WARNING
                                          </span>
                                      )}
                                      {log.severity === 'INFO' && (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">
                                              <CheckCircle size={12} /> INFO
                                          </span>
                                      )}
                                  </td>
                              </tr>
                          ))}
                          {filteredAuditLogs.length === 0 && (
                              <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">No logs found matching your criteria.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};

export default Reports;
