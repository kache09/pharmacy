import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Activity, 
  Settings, 
  LogOut, 
  Menu,
  Stethoscope,
  Banknote
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'clinical', label: 'Clinical & Rx', icon: Stethoscope },
    { id: 'finance', label: 'Finance', icon: Banknote },
    { id: 'reports', label: 'Reports', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-teal-900 text-white shadow-xl">
        <div className="p-6 border-b border-teal-800">
          <h1 className="text-2xl font-bold tracking-tight">AfyaTrack<span className="text-teal-400">.</span></h1>
          <p className="text-xs text-teal-300 mt-1">Pharmacy Management</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-teal-700 text-white shadow-md transform scale-[1.02]' 
                  : 'text-teal-100 hover:bg-teal-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-teal-800">
          <div className="flex items-center gap-3 px-4 py-2 text-teal-100">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Dr. Amani</p>
              <p className="text-xs text-teal-400 truncate">Super Admin</p>
            </div>
            <LogOut size={18} className="cursor-pointer hover:text-white" />
          </div>
        </div>
      </aside>

      {/* Mobile Header & Overlay */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-teal-900 text-white shadow-md z-20">
          <h1 className="text-xl font-bold">AfyaTrack</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-30 bg-teal-900/95 backdrop-blur-sm p-6 animate-in fade-in slide-in-from-top-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <LogOut size={24} className="rotate-180" />
              </button>
            </div>
            <nav className="space-y-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-4 rounded-xl text-lg ${
                    activeTab === item.id ? 'bg-teal-700 text-white' : 'text-teal-100'
                  }`}
                >
                  <item.icon size={24} className="mr-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;