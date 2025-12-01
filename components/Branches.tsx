
import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle,
  Building,
  RefreshCcw,
  Edit,
  Power,
  Save,
  X
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';
import { Branch } from '../types';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(BRANCHES.filter(b => b.id !== 'HEAD_OFFICE'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // State for editing
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({});

  // Stats
  const activeBranches = branches.filter(b => b.status === 'ACTIVE').length;
  const totalStaff = 34; // Mock

  const handleEditClick = (branch: Branch) => {
    setCurrentBranch(branch);
    setFormData(branch);
    setShowEditModal(true);
  };

  const handleToggleStatus = (id: string) => {
    setBranches(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, status: b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
      }
      return b;
    }));
  };

  const handleSaveEdit = () => {
    if (!currentBranch || !formData.name) return;
    
    setBranches(prev => prev.map(b => 
      b.id === currentBranch.id ? { ...b, ...formData } as Branch : b
    ));
    setShowEditModal(false);
    setCurrentBranch(null);
  };

  const handleAddBranch = () => {
     // Mock addition
     const newId = `BR00${branches.length + 5}`;
     const newBranch: Branch = {
         id: newId,
         name: formData.name || 'New Branch',
         location: formData.location || 'Unknown',
         manager: formData.manager || 'Unassigned',
         status: 'ACTIVE'
     };
     setBranches([...branches, newBranch]);
     setShowAddModal(false);
     setFormData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Branch Management</h2>
          <p className="text-slate-500 mt-1">Configure locations, managers, and operational status.</p>
        </div>
        <button 
          onClick={() => { setFormData({}); setShowAddModal(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-600/20 transition-all"
        >
          <Plus size={20} /> Add New Branch
        </button>
      </div>

      {/* Branch Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="p-4 rounded-full bg-teal-50 text-teal-600">
             <Building size={24} />
           </div>
           <div>
             <h3 className="text-2xl font-bold text-slate-900">{branches.length}</h3>
             <p className="text-sm text-slate-500">Total Locations</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="p-4 rounded-full bg-emerald-50 text-emerald-600">
             <CheckCircle size={24} />
           </div>
           <div>
             <h3 className="text-2xl font-bold text-slate-900">{activeBranches}</h3>
             <p className="text-sm text-slate-500">Operational</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="p-4 rounded-full bg-blue-50 text-blue-600">
             <Users size={24} />
           </div>
           <div>
             <h3 className="text-2xl font-bold text-slate-900">{totalStaff}</h3>
             <p className="text-sm text-slate-500">Total Staff</p>
           </div>
        </div>
      </div>

      {/* Branch List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
           <h3 className="font-bold text-slate-800 text-lg">All Branches</h3>
           <button className="text-slate-500 hover:text-teal-600 flex items-center gap-1 text-sm">
             <RefreshCcw size={14} /> Refresh Status
           </button>
        </div>
        <table className="w-full text-left">
           <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Branch Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Manager</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Sync</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-slate-50">
                   <td className="px-6 py-4">
                     <div className="font-bold text-slate-800">{branch.name}</div>
                     <div className="text-xs text-slate-400">ID: {branch.id}</div>
                   </td>
                   <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                     <MapPin size={14} className="text-slate-400" />
                     {branch.location}
                   </td>
                   <td className="px-6 py-4 text-sm font-medium text-slate-700">
                     {branch.manager}
                   </td>
                   <td className="px-6 py-4">
                      {branch.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                           <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                           <XCircle size={12} /> Inactive
                        </span>
                      )}
                   </td>
                   <td className="px-6 py-4 text-xs text-slate-500">
                     2 mins ago
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditClick(branch)}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-colors"
                          title="Edit Details"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(branch.id)}
                          className={`p-2 bg-white border border-slate-200 rounded-lg transition-colors ${
                              branch.status === 'ACTIVE' 
                              ? 'text-rose-500 hover:bg-rose-50 hover:border-rose-200' 
                              : 'text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200'
                          }`}
                          title={branch.status === 'ACTIVE' ? "Deactivate Branch" : "Activate Branch"}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>

      {/* Add/Edit Branch Modal */}
      {(showAddModal || showEditModal) && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{showEditModal ? 'Edit Branch' : 'Add New Branch'}</h3>
                    <p className="text-slate-500 text-sm">{showEditModal ? `Update details for ${currentBranch?.name}` : 'Create a new location'}</p>
                  </div>
                  <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                  </button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      placeholder="e.g. Arusha City Center"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location / Address</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      placeholder="Street, District, Region"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Manager</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      value={formData.manager || ''}
                      onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    >
                       <option value="">Select Staff Member</option>
                       <option value="John Doe">John Doe</option>
                       <option value="Jane Smith">Jane Smith</option>
                       <option value="Juma M">Juma M</option>
                       <option value="Sarah K">Sarah K</option>
                    </select>
                  </div>
               </div>
               <div className="p-6 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
                  <button 
                    onClick={showEditModal ? handleSaveEdit : handleAddBranch} 
                    className="px-4 py-2 bg-teal-600 text-white font-medium hover:bg-teal-700 rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <Save size={18} /> {showEditModal ? 'Save Changes' : 'Create Branch'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Branches;
