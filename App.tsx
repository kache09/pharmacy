
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Finance from './components/Finance';
import Branches from './components/Branches';
import Staff from './components/Staff';
import Clinical from './components/Clinical';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { BRANCHES } from './data/mockData';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBranchId, setCurrentBranchId] = useState('HEAD_OFFICE');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard currentBranchId={currentBranchId} />;
      case 'pos':
        return <POS currentBranchId={currentBranchId} />;
      case 'inventory':
        return <Inventory currentBranchId={currentBranchId} />;
      case 'finance':
        return <Finance currentBranchId={currentBranchId} />;
      case 'staff':
        return <Staff currentBranchId={currentBranchId} />;
      case 'branches':
        return <Branches />;
      case 'clinical':
        return <Clinical currentBranchId={currentBranchId} />;
      case 'reports':
        return <Reports currentBranchId={currentBranchId} />;
      case 'settings':
        return <Settings currentBranchId={currentBranchId} />;
      default:
        return <Dashboard currentBranchId={currentBranchId} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      currentBranchId={currentBranchId}
      setCurrentBranchId={setCurrentBranchId}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
