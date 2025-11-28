import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Finance from './components/Finance';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POS />;
      case 'inventory':
        return <Inventory />;
      case 'finance':
        return <Finance />;
      case 'clinical':
      case 'reports':
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
            <p className="text-slate-500 max-w-md">
              The {activeTab} module includes features like Doctor Prescription Upload (AI-Powered), 
              advanced User Management, and Auditing Logs in the full version.
            </p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;