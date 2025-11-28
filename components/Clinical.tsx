
import React, { useState } from 'react';
import { 
  Stethoscope, 
  Users, 
  FileText, 
  Calculator, 
  Search, 
  UserPlus, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  Brain
} from 'lucide-react';
import { MOCK_PATIENTS, MOCK_PRESCRIPTIONS, BRANCHES } from '../data/mockData';
import { Patient, Prescription } from '../types';
import { digitizePrescription } from '../services/geminiService';

const Clinical: React.FC<{currentBranchId: string}> = ({ currentBranchId }) => {
  const [activeTab, setActiveTab] = useState<'patients' | 'rx' | 'tools'>('patients');
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rx Processing State
  const [rxImage, setRxImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Calculator State
  const [calcInput, setCalcInput] = useState({ weight: '', doseMgPerKg: '', concentrationMgPerMl: '' });
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';
  const branchName = BRANCHES.find(b => b.id === currentBranchId)?.name;

  const filteredPatients = patients.filter(p => 
    (isHeadOffice || p.branchId === currentBranchId) && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCalculate = () => {
    const w = parseFloat(calcInput.weight);
    const d = parseFloat(calcInput.doseMgPerKg);
    const c = parseFloat(calcInput.concentrationMgPerMl);

    if (w && d && c) {
      const totalMg = w * d;
      const ml = totalMg / c;
      setCalcResult(`${ml.toFixed(2)} ml`);
    }
  };

  const handleRxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRxImage(reader.result as string);
        setAnalysisResult(null); // Reset previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeRx = async () => {
    if (!rxImage) return;
    setIsAnalyzing(true);
    // Simulate AI delay for UX
    setTimeout(async () => {
        const result = await digitizePrescription(rxImage.split(',')[1]);
        setAnalysisResult(result);
        setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Clinical & Rx</h2>
          <p className="text-slate-500 mt-1">
             {isHeadOffice ? 'Centralized Patient & Prescription Records' : `Clinical Services at ${branchName}`}
          </p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('patients')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'patients' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Users size={16} /> Patients (EMR)
            </button>
            <button 
                onClick={() => setActiveTab('rx')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'rx' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Brain size={16} /> Smart Rx Scan
            </button>
            <button 
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'tools' ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Calculator size={16} /> Dosage Calc
            </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'patients' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search Patient Name or ID..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {!isHeadOffice && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm shadow-md">
                        <UserPlus size={18} /> New Patient
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Age / Gender</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Allergies</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Last Visit</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredPatients.map(patient => (
                            <tr key={patient.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{patient.name}</div>
                                    <div className="text-xs text-slate-400">ID: {patient.id}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {patient.age} yrs / {patient.gender}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {patient.phone}
                                </td>
                                <td className="px-6 py-4">
                                    {patient.allergies.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {patient.allergies.map(alg => (
                                                <span key={alg} className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-xs font-bold">{alg}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs italic">None Recorded</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {patient.lastVisit}
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-teal-600 font-medium text-sm hover:underline">View History</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'rx' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
                 {!rxImage ? (
                     <div className="text-center w-full">
                         <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                             <Upload size={32} className="text-teal-600" />
                         </div>
                         <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Prescription Image</h3>
                         <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                             Drag and drop a prescription photo or scan here. Our AI will digitize the medicines and dosage instructions.
                         </p>
                         <label className="cursor-pointer bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 inline-block">
                             Select Image
                             <input type="file" accept="image/*" className="hidden" onChange={handleRxUpload} />
                         </label>
                     </div>
                 ) : (
                     <div className="w-full h-full flex flex-col">
                         <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-4 group">
                             <img src={rxImage} alt="Prescription" className="w-full h-full object-contain" />
                             <button 
                                onClick={() => setRxImage(null)} 
                                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-rose-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <AlertTriangle size={18} />
                             </button>
                         </div>
                         <button 
                            onClick={handleAnalyzeRx}
                            disabled={isAnalyzing}
                            className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                         >
                            {isAnalyzing ? (
                                <>Analyzing <Activity className="animate-spin" /></>
                            ) : (
                                <>Digitize with AI <Brain /></>
                            )}
                         </button>
                     </div>
                 )}
            </div>

            {/* Results Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <FileText className="text-teal-600" /> 
                    Extraction Results
                </h3>
                
                {analysisResult ? (
                    <div className="space-y-6 flex-1">
                        {analysisResult.error ? (
                            <div className="p-4 bg-rose-50 text-rose-700 rounded-lg">
                                Error: {analysisResult.error}
                            </div>
                        ) : (
                            <>
                                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                                    <h4 className="font-bold text-teal-800 text-sm uppercase mb-2">Patient Details</h4>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-teal-600" />
                                        <span className="text-slate-700 font-medium">{analysisResult.patientName || 'Not Detected'}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-500 text-sm uppercase mb-3">Identified Medicines</h4>
                                    <div className="space-y-3">
                                        {analysisResult.medicines?.map((med: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-teal-200 transition-colors">
                                                <div>
                                                    <div className="font-bold text-slate-800">{med.name}</div>
                                                    <div className="text-xs text-slate-500">{med.dosage} • {med.frequency}</div>
                                                </div>
                                                <button className="text-teal-600 hover:bg-teal-50 p-2 rounded-full">
                                                    <CheckCircle size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-6">
                                    <button className="w-full py-3 border border-teal-600 text-teal-600 font-bold rounded-xl hover:bg-teal-50 transition-all">
                                        Add to Patient Record
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 text-center p-8">
                        <Activity size={48} className="mb-4 opacity-20" />
                        <p>Upload and analyze a prescription to see the digitized details here.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                 <div className="bg-slate-900 p-6 text-white">
                     <h3 className="text-xl font-bold flex items-center gap-2">
                         <Calculator className="text-teal-400" /> Pediatric Dosage Calculator
                     </h3>
                     <p className="text-slate-400 text-sm mt-1">Calculate safe liquid dosage volume based on weight.</p>
                 </div>
                 <div className="p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-2">Patient Weight (kg)</label>
                             <input 
                               type="number" 
                               className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                               placeholder="e.g. 12"
                               value={calcInput.weight}
                               onChange={(e) => setCalcInput({...calcInput, weight: e.target.value})}
                             />
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-2">Target Dose (mg/kg)</label>
                             <input 
                               type="number" 
                               className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                               placeholder="e.g. 15 (Paracetamol)"
                               value={calcInput.doseMgPerKg}
                               onChange={(e) => setCalcInput({...calcInput, doseMgPerKg: e.target.value})}
                             />
                         </div>
                     </div>
                     <div>
                         <label className="block text-sm font-bold text-slate-700 mb-2">Drug Concentration (mg/ml)</label>
                         <input 
                           type="number" 
                           className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                           placeholder="e.g. 24 (120mg/5ml)"
                           value={calcInput.concentrationMgPerMl}
                           onChange={(e) => setCalcInput({...calcInput, concentrationMgPerMl: e.target.value})}
                         />
                     </div>

                     <div className="flex items-center gap-4 pt-4">
                         <button 
                            onClick={handleCalculate}
                            className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20"
                         >
                             Calculate
                         </button>
                         {calcResult && (
                             <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
                                 <ArrowRight className="text-slate-400" />
                                 <div className="text-2xl font-bold text-teal-700">
                                     {calcResult} <span className="text-sm text-slate-500 font-normal">to be administered</span>
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
                 <div className="bg-slate-50 p-4 text-xs text-slate-500 text-center border-t border-slate-100">
                     <strong>Disclaimer:</strong> This tool is for estimation only. Always verify calculations against standard medical guidelines.
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Clinical;
