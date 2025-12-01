
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Finance from './components/Finance';
import Branches from './components/Branches';
import Staff from './components/Staff';
import Clinical from './components/Clinical';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Approvals from './components/Approvals';
import { Staff as StaffType, UserRole, BranchInventoryItem, StockTransfer, Sale } from './types';
import { BRANCH_INVENTORY, STOCK_TRANSFERS } from './data/mockData';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<StaffType | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBranchId, setCurrentBranchId] = useState('HEAD_OFFICE');

  // Global State for Data Consistency
  const [inventory, setInventory] = useState<Record<string, BranchInventoryItem[]>>(BRANCH_INVENTORY);
  const [transfers, setTransfers] = useState<StockTransfer[]>(STOCK_TRANSFERS);
  const [sales, setSales] = useState<Sale[]>([]);

  // Handle Login
  const handleLogin = (user: StaffType) => {
    setCurrentUser(user);
    // Determine initial branch context
    if (user.role === UserRole.SUPER_ADMIN) {
        setCurrentBranchId('HEAD_OFFICE');
    } else {
        setCurrentBranchId(user.branchId);
    }
    // Set default active tab based on role
    if (user.role === UserRole.CASHIER) setActiveTab('pos');
    else if (user.role === UserRole.PHARMACIST) setActiveTab('clinical');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleSale = (newSale: Sale) => {
    setSales(prev => [newSale, ...prev]);
    // Also update inventory for each item sold
    // Note: This is a backup for the POS local update, ensuring global state stays in sync
    // In a real app, the API would handle this transactionally
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard currentBranchId={currentBranchId} inventory={inventory} onViewInventory={() => setActiveTab('inventory')} />;
      case 'approvals':
        return <Approvals />;
      case 'pos':
        return (
          <POS 
            currentBranchId={currentBranchId} 
            inventory={inventory} 
            setInventory={setInventory}
            onRecordSale={handleSale}
          />
        );
      case 'inventory':
        return (
          <Inventory 
            currentBranchId={currentBranchId} 
            inventory={inventory}
            setInventory={setInventory}
            transfers={transfers}
            setTransfers={setTransfers}
          />
        );
      case 'finance':
        return <Finance currentBranchId={currentBranchId} />;
      case 'staff':
        return <Staff currentBranchId={currentBranchId} />;
      case 'branches':
        return <Branches />;
      case 'clinical':
        return <Clinical currentBranchId={currentBranchId} />;
      case 'reports':
        return <Reports currentBranchId={currentBranchId} inventory={inventory} />;
      case 'settings':
        return <Settings currentBranchId={currentBranchId} />;
      default:
        return <Dashboard currentBranchId={currentBranchId} inventory={inventory} onViewInventory={() => setActiveTab('inventory')} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      currentBranchId={currentBranchId}
      setCurrentBranchId={setCurrentBranchId}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
