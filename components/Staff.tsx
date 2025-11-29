
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  MapPin, 
  Shield, 
  Mail, 
  Phone,
  CheckCircle,
  XCircle,
  User,
  Edit,
  ArrowRightLeft,
  Save,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { BRANCHES, STAFF_LIST } from '../data/mockData';
import { Staff as StaffType, UserRole } from '../types';

const Staff: React.FC<{currentBranchId: string}> = ({ currentBranchId }) => {
  const [staff, setStaff] = useState<StaffType[]>(STAFF_LIST);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [newStaff, setNewStaff] = useState<Partial<StaffType>>({
    name: '',
    role: UserRole.CASHIER,
    branchId: currentBranchId === 'HEAD_OFFICE' ? 'BR001' : currentBranchId,
    email: '',
    phone: '',
    status: 'ACTIVE',
    username: '',
    password: ''
  });

  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);

  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';
  const branchName = BRANCHES.find(b => b.id === currentBranchId)?.name;

  // Filter Logic
  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = isHeadOffice ? true : s.branchId === currentBranchId;
    
    return matchesSearch && matchesBranch;
  });

  const handleAddStaff = () => {
    if(!newStaff.name || !newStaff.email || !newStaff.username || !newStaff.password) return;

    const staffMember: StaffType = {
        id: `ST-${Math.floor(Math.random() * 9000) + 1000}`,
        name: newStaff.name!,
        role: newStaff.role as UserRole,
        branchId: newStaff.branchId!,
        email: newStaff.email!,
        phone: newStaff.phone || '',
        status: 'ACTIVE',
        joinedDate: new Date().toISOString().split('T')[0],
        lastLogin: 'Never',
        username: newStaff.username!,
        password: newStaff.password!
    };

    setStaff([staffMember, ...staff]);
    setShowAddModal(false);
    setNewStaff({
        name: '',
        role: UserRole.CASHIER,
        branchId: currentBranchId === 'HEAD_OFFICE' ? 'BR001' : currentBranchId,
        email: '',
        phone: '',
        status: 'ACTIVE',
        username: '',
        password: ''
    });
  };

  const handleUpdateStaff = () => {
      if (!editingStaff) return;
      
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? editingStaff : s));
      setShowEditModal(false);
      setEditingStaff(null);
  };

  const openEditModal = (staffMember: StaffType) => {
      setEditingStaff({ ...staffMember });
      setShowEditModal(true);
  };

  const toggleStatus = (id: string) => {
      setStaff(prev => prev.map(s => {
          if(s.id === id) return { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
          return s;
      }));
  };

  const getRoleBadgeColor = (role: UserRole) => {
      switch(role) {
          case UserRole.SUPER_ADMIN: return 'bg-purple-100 text-purple-700';
          case UserRole.BRANCH_MANAGER: return 'bg-blue-100 text-blue-700';
          case UserRole.PHARMACIST: return 'bg-teal-100 text-teal-700';
          case UserRole.ACCOUNTANT: return 'bg-amber-100 text-amber-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  // Helper to generate a suggested username
  const generateUsername = (name: string) => {
    if(!name) return '';
    return name.toLowerCase().replace(/\s+/g, '').slice(0, 8) + Math.floor(Math.random() * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Staff Management</h2>
          <p className="text-slate-500 mt-1">
             {isHeadOffice 
                ? 'Manage all employees across every branch.' 
                : `Managing team members at ${branchName}.`
             }
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-600/20 transition-all"
        >
          <UserPlus size={20} /> Add New Staff
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search staff by name or email..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         {isHeadOffice && (
             <div className="hidden md:flex items-center text-sm text-slate-500 italic">
                 Showing all branches
             </div>
         )}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStaff.map(member => (
              <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl">
                                  {member.name.charAt(0)}
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-900">{member.name}</h3>
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide mt-1 ${getRoleBadgeColor(member.role)}`}>
                                      {member.role.replace('_', ' ')}
                                  </span>
                              </div>
                          </div>
                          {isHeadOffice && (
                              <button 
                                onClick={() => openEditModal(member)}
                                className="text-slate-400 hover:text-teal-600 hover:bg-teal-50 p-2 rounded-full transition-colors"
                                title="Edit & Transfer"
                              >
                                  <Edit size={18} />
                              </button>
                          )}
                      </div>

                      <div className="space-y-3 text-sm text-slate-600">
                          <div className="flex items-center gap-3">
                              <User size={16} className="text-slate-400" />
                              <span className="truncate text-slate-500">@{member.username}</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <Mail size={16} className="text-slate-400" />
                              <span className="truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <Phone size={16} className="text-slate-400" />
                              <span>{member.phone || 'No Phone'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <MapPin size={16} className="text-slate-400" />
                              <span className="text-teal-700 font-medium">
                                  {BRANCHES.find(b => b.id === member.branchId)?.name || 'Unknown Branch'}
                              </span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs">
                          {member.status === 'ACTIVE' ? (
                              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                  <CheckCircle size={14} /> Active
                              </span>
                          ) : (
                              <span className="flex items-center gap-1 text-slate-400 font-bold">
                                  <XCircle size={14} /> Inactive
                              </span>
                          )}
                          <span className="text-slate-400 mx-2">|</span>
                          <span className="text-slate-500">Joined: {member.joinedDate}</span>
                      </div>
                      <button 
                        onClick={() => toggleStatus(member.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                            member.status === 'ACTIVE' 
                            ? 'border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                            : 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700'
                        }`}
                      >
                          {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                  </div>
              </div>
          ))}
      </div>
      
      {filteredStaff.length === 0 && (
          <div className="text-center py-12 text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No staff members found matching your criteria.</p>
          </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
               <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900">Add Team Member</h3>
                  <p className="text-slate-500 text-sm">Create a new account & credentials for an employee.</p>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="text" 
                            className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                            placeholder="John Doe" 
                            value={newStaff.name}
                            onChange={(e) => {
                                setNewStaff({
                                    ...newStaff, 
                                    name: e.target.value,
                                    username: generateUsername(e.target.value)
                                })
                            }}
                        />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <div className="relative">
                            <Shield size={16} className="absolute left-3 top-3 text-slate-400" />
                            <select 
                                className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none"
                                value={newStaff.role}
                                onChange={(e) => setNewStaff({...newStaff, role: e.target.value as UserRole})}
                            >
                                {Object.values(UserRole).map(role => (
                                    <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                            <select 
                                className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none disabled:bg-slate-100"
                                value={newStaff.branchId}
                                disabled={!isHeadOffice}
                                onChange={(e) => setNewStaff({...newStaff, branchId: e.target.value})}
                            >
                                {BRANCHES.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="email" 
                            className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                            placeholder="employee@afyatrack.co.tz" 
                            value={newStaff.email}
                            onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                        <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="tel" 
                            className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                            placeholder="+255..." 
                            value={newStaff.phone}
                            onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                        />
                    </div>
                  </div>

                  <hr className="border-slate-100" />
                  
                  {/* Credentials Section */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <Lock size={16} className="text-teal-600" /> Login Credentials
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                               <input 
                                 type="text" 
                                 className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                                 value={newStaff.username}
                                 onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                               />
                          </div>
                          <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                               <div className="relative">
                                   <input 
                                     type={showPassword ? "text" : "password"}
                                     className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white pr-8"
                                     value={newStaff.password}
                                     onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                                   />
                                   <button 
                                     className="absolute right-2 top-2 text-slate-400 hover:text-teal-600"
                                     onClick={() => setShowPassword(!showPassword)}
                                     type="button"
                                   >
                                       {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                   </button>
                               </div>
                          </div>
                      </div>
                  </div>

               </div>
               <div className="p-6 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
                  <button onClick={handleAddStaff} className="px-4 py-2 bg-teal-600 text-white font-medium hover:bg-teal-700 rounded-lg shadow-sm">Create User</button>
               </div>
            </div>
         </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editingStaff && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Edit Staff Details</h3>
                    <p className="text-slate-500 text-sm">Update role, branch assignment, or contact info.</p>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-full">
                      <Edit size={20} className="text-slate-500" />
                  </div>
               </div>
               
               <div className="p-6 space-y-4">
                   {/* Name & Contact */}
                   <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                            value={editingStaff.name}
                            onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                        />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                             <input 
                                type="email" 
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm" 
                                value={editingStaff.email}
                                onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                             <input 
                                type="tel" 
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm" 
                                value={editingStaff.phone}
                                onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
                             />
                        </div>
                   </div>

                   <hr className="border-slate-100 my-2" />
                   
                   {/* Role & Branch Transfer */}
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                               <Shield size={14} /> System Role
                           </label>
                           <select 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                value={editingStaff.role}
                                onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value as UserRole})}
                            >
                                {Object.values(UserRole).map(role => (
                                    <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                ))}
                            </select>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                               <ArrowRightLeft size={14} /> Branch Assignment (Transfer)
                           </label>
                           <select 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                value={editingStaff.branchId}
                                onChange={(e) => setEditingStaff({...editingStaff, branchId: e.target.value})}
                            >
                                {BRANCHES.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
                                ))}
                            </select>
                            {editingStaff.branchId !== staff.find(s => s.id === editingStaff.id)?.branchId && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium">
                                    <ArrowRightLeft size={12} /> Staff will be transferred upon saving.
                                </p>
                            )}
                       </div>
                   </div>

                   {/* Password Reset (Optional - Simplified) */}
                   <div className="mt-4">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Reset Password</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                            placeholder="Enter new password to reset..."
                            value={editingStaff.password || ''}
                            onChange={(e) => setEditingStaff({...editingStaff, password: e.target.value})}
                        />
                   </div>
               </div>

               <div className="p-6 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
                  <button onClick={handleUpdateStaff} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-sm flex items-center gap-2">
                      <Save size={18} /> Save Changes
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Staff;
