
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
import { WEEKLY_SALES_DATA, BRANCH_FINANCE_STATS, BRANCHES } from '../data/mockData';

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

const Dashboard: React.FC<{currentBranchId: string}> = ({ currentBranchId }) => {
  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';
  
  // Dynamic Data Selection based on Branch Context
  const stats = (BRANCH_FINANCE_STATS as any)[currentBranchId] || BRANCH_FINANCE_STATS['HEAD_OFFICE'];
  const chartData = (WEEKLY_SALES_DATA as any)[currentBranchId] || (WEEKLY_SALES_DATA as any)['BR001']; // Fallback for minor branches to generic data for demo

  const activeBranchName = BRANCHES.find(b => b.id === currentBranchId)?.name;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">{isHeadOffice ? 'Head Office Overview' : `${activeBranchName} Overview`}</h2>
        <p className="text-slate-500 mt-1">
          {isHeadOffice 
            ? 'Real-time aggregated insights across all 4 branches.' 
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
          value={isHeadOffice ? "24 Items" : "5 Items"} 
          subtext="Low Stock / Expiring" 
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
             {isHeadOffice ? 'Critical Stock Alerts (All Branches)' : 'Branch Stock Alerts'}
          </h3>
          <button className="text-teal-600 text-sm font-medium hover:underline">View All Inventory</button>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Batch No.</th>
              <th className="px-6 py-4">Branch</th>
              <th className="px-6 py-4">Expiry Date</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-800">Amoxicillin 500mg</td>
              <td className="px-6 py-4">B-2901</td>
              <td className="px-6 py-4">Kariakoo</td>
              <td className="px-6 py-4 text-red-600 font-medium">Oct 15, 2023</td>
              <td className="px-6 py-4">45 Boxes</td>
              <td className="px-6 py-4 text-teal-600 hover:text-teal-800 cursor-pointer">Reorder</td>
            </tr>
            {(isHeadOffice || currentBranchId === 'BR002') && (
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-800">Cipro 500mg</td>
              <td className="px-6 py-4">B-4402</td>
              <td className="px-6 py-4">Masaki</td>
              <td className="px-6 py-4 text-amber-600 font-medium">Nov 01, 2023</td>
              <td className="px-6 py-4">12 Boxes</td>
              <td className="px-6 py-4 text-teal-600 hover:text-teal-800 cursor-pointer">Transfer</td>
            </tr>
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
