
import React from 'react';
import { 
  Shield, 
  Store, 
  Stethoscope, 
  ShoppingCart, 
  Package, 
  ArrowRight,
  Unlock,
  Building,
  Users
} from 'lucide-react';
import { Staff, UserRole } from '../types';
import { STAFF_LIST, BRANCHES } from '../data/mockData';

interface LoginProps {
  onLogin: (user: Staff) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {

  const handleQuickLogin = (role: UserRole, branchId: string) => {
    // Find a matching user from the mock list
    const user = STAFF_LIST.find(u => u.role === role && u.branchId === branchId);
    
    if (user) {
      onLogin(user);
    } else {
      // Fallback if specific user not found in mock data
      const fallbackUser: Staff = {
          id: 'TEMP-USER',
          name: 'Demo User',
          role: role,
          branchId: branchId,
          email: 'demo@pms.co.tz',
          phone: '',
          status: 'ACTIVE',
          joinedDate: new Date().toISOString().split('T')[0],
          username: 'demo',
          password: ''
      };
      onLogin(fallbackUser);
    }
  };

  const PersonaCard = ({ title, role, branchId, icon: Icon, color, desc }: any) => {
      const branchName = BRANCHES.find(b => b.id === branchId)?.name || 'Head Office';
      return (
        <button 
          onClick={() => handleQuickLogin(role, branchId)}
          className="flex flex-col items-start text-left p-5 bg-white border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-md hover:shadow-teal-600/10 transition-all group w-full"
        >
          <div className={`p-3 rounded-full mb-3 ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wide mt-1 mb-2">
            {branchId === 'HEAD_OFFICE' ? <Building size={12} /> : <Store size={12} />}
            {branchName}
          </div>
          <p className="text-sm text-slate-500 leading-snug">{desc}</p>
          <div className="mt-4 flex items-center text-teal-600 text-sm font-bold group-hover:underline">
            Access System <ArrowRight size={16} className="ml-1" />
          </div>
        </button>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-teal-600 rounded-2xl shadow-lg shadow-teal-600/20 mb-4">
             <Unlock className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">PMS Quick Access</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Select a role below to enter the system. <br />
            <span className="text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">DEMO MODE ACTIVE</span> - No password required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Head Office / Admin */}
          <div className="lg:col-span-1">
             <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4 ml-1">Administration</h4>
             <PersonaCard 
               title="Super Admin"
               role={UserRole.SUPER_ADMIN}
               branchId="HEAD_OFFICE"
               icon={Shield}
               color="bg-purple-100 text-purple-600"
               desc="Full access to all branches, settings, reports, and approvals."
             />
          </div>

          {/* Branch Operations */}
          <div className="lg:col-span-2">
             <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4 ml-1">Branch Operations (Kariakoo & Masaki)</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <PersonaCard 
                  title="Branch Manager"
                  role={UserRole.BRANCH_MANAGER}
                  branchId="BR001"
                  icon={Store}
                  color="bg-blue-100 text-blue-600"
                  desc="Manage staff, stock, and oversee operations for Kariakoo branch."
                />
                <PersonaCard 
                  title="Pharmacist (Clinical)"
                  role={UserRole.PHARMACIST}
                  branchId="BR002"
                  icon={Stethoscope}
                  color="bg-teal-100 text-teal-600"
                  desc="Handle prescriptions, patient records, and clinical checks."
                />
                <PersonaCard 
                  title="Cashier (POS)"
                  role={UserRole.CASHIER}
                  branchId="BR001"
                  icon={ShoppingCart}
                  color="bg-emerald-100 text-emerald-600"
                  desc="Process sales, handle payments, and issue receipts."
                />
                <PersonaCard 
                  title="Inventory Controller"
                  role={UserRole.INVENTORY_CONTROLLER}
                  branchId="BR002"
                  icon={Package}
                  color="bg-amber-100 text-amber-600"
                  desc="Receive shipments, verify stock, and manage batch expiries."
                />
             </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-400 text-sm">
           <div className="flex items-center justify-center gap-2 mb-2">
              <Users size={16} />
              <span>Multi-User Session Simulation</span>
           </div>
           <p>Switching roles mimics logging out and logging back in as a different employee.</p>
        </div>

      </div>
    </div>
  );
};

export default Login;
