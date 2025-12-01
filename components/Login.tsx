
import React, { useState } from 'react';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Staff, UserRole } from '../types';
import { STAFF_LIST } from '../data/mockData';

interface LoginProps {
  onLogin: (user: Staff) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const user = STAFF_LIST.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (user) {
        if (user.status === 'INACTIVE') {
          setError('Your account is inactive. Please contact your administrator.');
        } else {
          onLogin(user);
        }
      } else {
        setError('Invalid username or password. Try "admin" / "123".');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col md:flex-row">
        {/* Login Form */}
        <div className="w-full p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-teal-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-teal-600/20">
              <Lock className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">PMS Login</h1>
            <p className="text-slate-500 text-sm mt-1">Pharmacy Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                  placeholder="Enter your username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-4 bg-teal-800 text-white font-bold rounded-xl hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Technical Support: +255 700 123 456
              <br />
              v2.5.0 (Build 20231027)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
