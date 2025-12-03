
import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  ArrowRight,
  AlertTriangle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Staff } from '../types';
import { STAFF_LIST } from '../data/mockData';

interface LoginProps {
  onLogin: (user: Staff) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      // Find user in mock database
      const user = STAFF_LIST.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (user) {
        if (user.status === 'INACTIVE') {
          setError('Account is disabled. Contact Administrator.');
          setIsLoading(false);
          return;
        }

        setShowSuccess(true);
        setTimeout(() => {
            onLogin(user);
        }, 800);
      } else {
        setError('Invalid username or password.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-teal-900/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-[1000px] h-[1000px] bg-blue-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex overflow-hidden z-10 min-h-[600px]">
        
        {/* Left Side - Hero / Branding */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-teal-800 to-slate-900 p-12 flex-col justify-between text-white relative">
           <div className="relative z-10">
               <div className="inline-flex items-center gap-3 mb-6">
                   <div className="p-3 bg-teal-500/20 rounded-xl backdrop-blur-sm border border-teal-500/30">
                       <Shield size={32} className="text-teal-400" />
                   </div>
                   <h1 className="text-3xl font-bold tracking-tight">PMS<span className="text-teal-400">.</span></h1>
               </div>
               <h2 className="text-4xl font-bold leading-tight mb-6">
                   World-Class <br/> 
                   <span className="text-teal-400">Pharmacy</span> <br/>
                   Management.
               </h2>
               <p className="text-slate-300 text-lg leading-relaxed">
                   Secure, scalable, and intelligent system for multi-branch operations.
               </p>
           </div>
           
           <div className="relative z-10 space-y-4">
               <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                   <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                       AI
                   </div>
                   <div>
                       <p className="font-bold text-sm">Smart Clinical Alerts</p>
                       <p className="text-xs text-slate-400">Powered by Gemini AI</p>
                   </div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                   <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                       HO
                   </div>
                   <div>
                       <p className="font-bold text-sm">Centralized Control</p>
                       <p className="text-xs text-slate-400">Head Office Dashboard</p>
                   </div>
               </div>
           </div>

           {/* Decorative Grid */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
           <div className="max-w-sm mx-auto w-full">
               <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
               <p className="text-slate-500 mb-8">Please sign in to your account.</p>

               <form onSubmit={handleSubmit} className="space-y-5">
                   <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                       <div className="relative group">
                           <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                           <input 
                             type="text" 
                             className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all font-medium"
                             placeholder="Enter your username"
                             value={username}
                             onChange={(e) => setUsername(e.target.value)}
                             required
                           />
                       </div>
                   </div>

                   <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                       <div className="relative group">
                           <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                           <input 
                             type="password" 
                             className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all font-medium"
                             placeholder="••••••••"
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             required
                           />
                       </div>
                   </div>

                   {error && (
                       <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                           <AlertTriangle size={18} className="shrink-0" />
                           {error}
                       </div>
                   )}

                   <button 
                     type="submit" 
                     disabled={isLoading || showSuccess}
                     className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                        showSuccess 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                     }`}
                   >
                       {isLoading ? (
                           <Loader2 className="animate-spin" />
                       ) : showSuccess ? (
                           <> <CheckCircle className="animate-bounce" /> Success! </>
                       ) : (
                           <> Sign In <ArrowRight size={20} /> </>
                       )}
                   </button>
               </form>

               <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                   <p className="text-xs text-slate-400">
                       Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.
                   </p>
               </div>
               
               {/* Quick Tip for Demo Users */}
               <div className="mt-4 text-center">
                   <p className="text-xs text-slate-400 bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">
                       Demo: User <strong>admin</strong> | Pass <strong>123</strong>
                   </p>
               </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
