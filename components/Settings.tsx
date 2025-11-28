
import React, { useState } from 'react';
import { 
  Save, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  Lock, 
  Server, 
  RefreshCw, 
  CheckCircle, 
  Building,
  Mail,
  ToggleLeft,
  ToggleRight,
  Cloud,
  Download
} from 'lucide-react';

const Settings: React.FC<{ currentBranchId: string }> = ({ currentBranchId }) => {
  const [activeSection, setActiveSection] = useState<'general' | 'security' | 'notifications' | 'integrations' | 'backup'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Mock State
  const [general, setGeneral] = useState({
    companyName: 'AfyaTrack Pharmacy Ltd',
    tinNumber: '123-456-789',
    vrnNumber: '400-999-111',
    address: 'Plot 45, Bagamoyo Road, Dar es Salaam',
    currency: 'TZS',
    timezone: 'Africa/Dar_es_Salaam',
    language: 'English'
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: '15',
    passwordExpiry: '90',
    enforceStrongPasswords: true
  });

  const [notifications, setNotifications] = useState({
    lowStockEmail: true,
    expiryAlertSms: true,
    dailyReportSms: false,
    systemUpdates: true,
    emailRecipients: 'admin@afyatrack.co.tz, manager@afyatrack.co.tz'
  });

  const [integrations, setIntegrations] = useState({
    traPortalUrl: 'https://vfd.tra.go.tz/api',
    msdSyncEnabled: true,
    smsGateway: 'Twilio',
    nhifPortalId: 'HOSP-001-TZ'
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
        setIsSaving(false);
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    }, 1500);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
      <button onClick={() => onChange(!checked)} className={`transition-colors duration-200 ${checked ? 'text-teal-600' : 'text-slate-300'}`}>
          {checked ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
      </button>
  );

  const SectionButton = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => setActiveSection(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === id ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
      >
          <Icon size={20} />
          {label}
      </button>
  );

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">System Configuration</h2>
          <p className="text-slate-500 mt-1">Manage global preferences, security policies, and integrations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-600/20 transition-all disabled:opacity-70"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveMessage && (
          <div className="bg-emerald-100 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
              <CheckCircle size={20} />
              {saveMessage}
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
                  <SectionButton id="general" label="General Settings" icon={Building} />
                  <SectionButton id="security" label="Security & Access" icon={Shield} />
                  <SectionButton id="notifications" label="Notifications" icon={Bell} />
                  <SectionButton id="integrations" label="Integrations (TRA/MSD)" icon={Server} />
                  <SectionButton id="backup" label="Backup & Data" icon={Database} />
              </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
                  
                  {activeSection === 'general' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Company Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                                  <input 
                                    type="text" 
                                    value={general.companyName}
                                    onChange={(e) => setGeneral({...general, companyName: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                                  <input 
                                    type="text" 
                                    value={general.address}
                                    onChange={(e) => setGeneral({...general, address: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">TRA TIN Number</label>
                                  <input 
                                    type="text" 
                                    value={general.tinNumber}
                                    onChange={(e) => setGeneral({...general, tinNumber: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono" 
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">VAT Reg Number (VRN)</label>
                                  <input 
                                    type="text" 
                                    value={general.vrnNumber}
                                    onChange={(e) => setGeneral({...general, vrnNumber: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono" 
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">System Currency</label>
                                  <select 
                                    value={general.currency}
                                    onChange={(e) => setGeneral({...general, currency: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                                  >
                                      <option value="TZS">Tanzanian Shilling (TZS)</option>
                                      <option value="USD">US Dollar (USD)</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                                  <select 
                                    value={general.language}
                                    onChange={(e) => setGeneral({...general, language: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                                  >
                                      <option value="English">English</option>
                                      <option value="Swahili">Swahili (Kiswahili)</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeSection === 'security' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Security Policies</h3>
                          
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                              <div className="flex items-center gap-4">
                                  <div className="p-3 bg-white rounded-full text-teal-600 shadow-sm">
                                      <Lock size={24} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800">Two-Factor Authentication (2FA)</h4>
                                      <p className="text-sm text-slate-500">Require SMS/Email code for login</p>
                                  </div>
                              </div>
                              <Toggle checked={security.twoFactor} onChange={(v) => setSecurity({...security, twoFactor: v})} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (Minutes)</label>
                                  <select 
                                    value={security.sessionTimeout}
                                    onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                                  >
                                      <option value="5">5 Minutes</option>
                                      <option value="15">15 Minutes</option>
                                      <option value="30">30 Minutes</option>
                                      <option value="60">1 Hour</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Password Expiry (Days)</label>
                                  <select 
                                    value={security.passwordExpiry}
                                    onChange={(e) => setSecurity({...security, passwordExpiry: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                                  >
                                      <option value="30">30 Days</option>
                                      <option value="90">90 Days</option>
                                      <option value="180">6 Months</option>
                                      <option value="365">1 Year</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeSection === 'notifications' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Alert Preferences</h3>
                          
                          <div className="space-y-4">
                              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                  <div>
                                      <h4 className="font-medium text-slate-800">Low Stock Alerts (Email)</h4>
                                      <p className="text-xs text-slate-500">Receive emails when inventory hits minimum level</p>
                                  </div>
                                  <Toggle checked={notifications.lowStockEmail} onChange={(v) => setNotifications({...notifications, lowStockEmail: v})} />
                              </div>
                              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                  <div>
                                      <h4 className="font-medium text-slate-800">Expiry Warnings (SMS)</h4>
                                      <p className="text-xs text-slate-500">Receive SMS for batches expiring in &lt;30 days</p>
                                  </div>
                                  <Toggle checked={notifications.expiryAlertSms} onChange={(v) => setNotifications({...notifications, expiryAlertSms: v})} />
                              </div>
                              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                  <div>
                                      <h4 className="font-medium text-slate-800">Daily Sales Report (SMS)</h4>
                                      <p className="text-xs text-slate-500">End-of-day financial summary to managers</p>
                                  </div>
                                  <Toggle checked={notifications.dailyReportSms} onChange={(v) => setNotifications({...notifications, dailyReportSms: v})} />
                              </div>
                          </div>

                          <div className="mt-6">
                              <label className="block text-sm font-medium text-slate-700 mb-2">Alert Recipient Emails (comma separated)</label>
                              <div className="relative">
                                  <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                                  <input 
                                    type="text" 
                                    value={notifications.emailRecipients}
                                    onChange={(e) => setNotifications({...notifications, emailRecipients: e.target.value})}
                                    className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                                  />
                              </div>
                          </div>
                      </div>
                  )}

                  {activeSection === 'integrations' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">External Systems</h3>

                          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                               <div className="flex items-center gap-3 mb-4">
                                   <Globe className="text-teal-600" />
                                   <h4 className="font-bold text-slate-900">TRA VFD Integration</h4>
                               </div>
                               <div className="space-y-4">
                                   <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Endpoint</label>
                                       <input 
                                         type="text" 
                                         value={integrations.traPortalUrl}
                                         readOnly
                                         className="w-full p-2 bg-white border border-slate-200 rounded text-slate-600 text-sm font-mono"
                                       />
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                       <span className="text-sm font-medium text-emerald-700">Connected to TRA Production Env</span>
                                   </div>
                               </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">NHIF Portal ID</label>
                                  <input 
                                    type="text" 
                                    value={integrations.nhifPortalId}
                                    onChange={(e) => setIntegrations({...integrations, nhifPortalId: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">SMS Gateway Provider</label>
                                  <select 
                                    value={integrations.smsGateway}
                                    onChange={(e) => setIntegrations({...integrations, smsGateway: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                                  >
                                      <option value="Twilio">Twilio</option>
                                      <option value="Infobip">Infobip</option>
                                      <option value="Beem">Beem Africa</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeSection === 'backup' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Data Management</h3>

                          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start gap-4">
                               <Cloud className="text-blue-600 mt-1" size={24} />
                               <div className="flex-1">
                                   <h4 className="font-bold text-blue-900">Cloud Sync Active</h4>
                                   <p className="text-sm text-blue-700 mt-1">
                                       Your data is automatically synced to the cloud every 5 minutes. 
                                       Last sync was successful at 10:42 AM.
                                   </p>
                               </div>
                          </div>

                          <div className="border border-slate-200 rounded-xl p-6">
                              <h4 className="font-bold text-slate-800 mb-4">Manual Backup</h4>
                              <p className="text-sm text-slate-500 mb-6">
                                  Create a local backup of the entire database. This includes inventory, sales history, and patient records.
                              </p>
                              <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-bold shadow-lg transition-all">
                                  <Download size={20} /> Download Database Dump (.sql)
                              </button>
                          </div>
                      </div>
                  )}

              </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;
