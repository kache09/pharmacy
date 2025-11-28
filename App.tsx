
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
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
            <p className="text-slate-500 max-w-md">
              The {activeTab} module includes features like System Configuration, 
              Backup Management, and Global Preferences in the full version.
            </p>
          </div>
        );
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
