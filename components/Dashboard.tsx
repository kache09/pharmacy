
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Users, Store } from 'lucide-react';
import { WEEKLY_SALES_DATA, BRANCH_FINANCE_STATS, BRANCHES, PRODUCTS } from '../data/mockData';
import { BranchInventoryItem } from '../types';

const branchPerformance = [
  { name: 'Kariakoo', value: 45000000 },
  { name: 'Masaki', value: 32000000 },
  { name: 'Mbezi Beach', value: 18000000 },
  { name: 'Dodoma', value: 12000000 },
];

const COLORS = ['#0f766e', '#14b8a6', '#5eead4', '#ccfbf1'];

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
      <span className="text-emerald-600 font-medium flex items-center">
        <TrendingUp size={14} className="mr-1" />
        {subtext}
      </span>
      <span className="text-slate-400 ml-2">vs last month</span>
    </div>
  </div>
);

const Dashboard: React.FC<{currentBranchId: string, inventory: Record<string, BranchInventoryItem[]>}> = ({ currentBranchId, inventory }) => {
  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';
  
  // Dynamic Data Selection based on Branch Context
  const stats = (BRANCH_FINANCE_STATS as any)[currentBranchId] || BRANCH_FINANCE_STATS['HEAD_OFFICE'];
  const chartData = (WEEKLY_SALES_DATA as any)[currentBranchId] || (WEEKLY_SALES_DATA as any)['BR001']; 

  const activeBranchName = BRANCHES.find(b => b.id === currentBranchId)?.name;

  // Calculate Low Stock Alerts using Prop Inventory
  let lowStockCount = 0;
  const criticalItems: {name: string, stock: number, branch: string}[] = [];

  const branchesToCheck = isHeadOffice ? Object.keys(inventory) : [currentBranchId];
  
  branchesToCheck.forEach(bId => {
      const stockList = inventory[bId] || [];
      stockList.forEach(item => {
          const productDef = PRODUCTS.find(p => p.id === item.productId);
          if (productDef && item.quantity <= productDef.minStockLevel) {
              lowStockCount++;
              if (criticalItems.length < 5) {
                  criticalItems.push({
                      name: productDef.name,
                      stock: item.quantity,
                      branch: BRANCHES.find(b => b.id === bId)?.name || bId
                  });
              }
          }
      });
  });


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">{isHeadOffice ? 'Head Office Overview' : `${activeBranchName} Overview`}</h2>
        <p className="text-slate-500 mt-1">
          {isHeadOffice 
            ? 'Real-time aggregated insights across all branches.' 
            : `Monitoring performance for ${activeBranchName} only.`
          }
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue (Monthly)" 
          value={`TZS ${(stats.revenue / 1000000).toFixed(1)}M`} 
          subtext="+12.5%" 
          icon={DollarSign} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Transactions" 
          value={isHeadOffice ? "3,420" : "850"} 
          subtext="+5.2%" 
          icon={Users} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Stock Alerts" 
          value={`${lowStockCount} Items`} 
          subtext="Low Stock Level" 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Net Profit" 
          value={`TZS ${(stats.profit / 1000000).toFixed(1)}M`} 
          subtext="+8.1%" 
          icon={TrendingUp} 
          color="bg-teal-600" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
             {isHeadOffice ? 'Global Sales Analytics' : 'Branch Sales Analytics'}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChartComponent data={chartData} />
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Distribution (Only visible for Head Office) */}
        {isHeadOffice ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue by Branch</h3>
          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {branchPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `TZS ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-3xl font-bold text-teal-800">4</span>
                <p className="text-xs text-slate-500 uppercase">Branches</p>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {branchPerformance.map((branch, index) => (
              <div key={branch.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-slate-600">{branch.name}</span>
                </div>
                <span className="font-medium text-slate-900">{(branch.value / 1000000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
             <div className="p-4 bg-teal-50 rounded-full mb-4">
               <Store size={40} className="text-teal-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">{activeBranchName}</h3>
             <p className="text-slate-500 mb-6">Performance is good. You are 12% above the target for this month.</p>
             <button className="text-teal-600 font-bold hover:underline">View Detailed Report</button>
          </div>
        )}
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
             {isHeadOffice ? 'Critical Stock Alerts (Real-time)' : 'Branch Stock Alerts'}
          </h3>
          <button className="text-teal-600 text-sm font-medium hover:underline">View All Inventory</button>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Branch</th>
              <th className="px-6 py-4">Current Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {criticalItems.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No low stock items detected.</td>
                </tr>
            ) : (
                criticalItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                      <td className="px-6 py-4">{item.branch}</td>
                      <td className="px-6 py-4 text-red-600 font-bold">{item.stock} Units</td>
                      <td className="px-6 py-4"><span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">LOW</span></td>
                      <td className="px-6 py-4 text-teal-600 hover:text-teal-800 cursor-pointer">Reorder</td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper for chart
const AreaChartComponent = ({ data }: { data: any[] }) => {
    return (
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f766e', fontWeight: 600 }}
                formatter={(value: number) => [`TZS ${value.toLocaleString()}`, 'Sales']}
            />
            <Line type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={3} activeDot={{ r: 8 }} dot={false} />
            <Line type="monotone" dataKey="revenue" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
        </LineChart>
    );
};

export default Dashboard;
