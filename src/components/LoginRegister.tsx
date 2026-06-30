import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, User, BookOpen, KeyRound, ArrowRight } from 'lucide-react';
import { Student } from '../types';

interface LoginRegisterProps {
  onAuthSuccess: (token: string, user: Student) => void;
}

export default function LoginRegister({ onAuthSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific fields
  const [name, setName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [department, setDepartment] = useState('Computer Science & Technology (CST)');
  const [semester, setSemester] = useState('6th Semester');
  const [signupCode, setSignupCode] = useState(''); // Secret code for admin access
  const [showDemo, setShowDemo] = useState(false); // Collapsible demo credentials helper

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const departments = [
    'Computer Science & Technology (CST)',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering'
  ];

  const semesters = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { name, email, password, enrollmentNo, department, semester, signupCode };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong during authorization.');
      }

      setSuccess(isLogin ? 'Welcome back! Redirecting...' : 'Account successfully registered!');
      
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
      }, 800);

    } catch (err: any) {
      setError(err.message || 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Visual background patterns */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="p-3.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/15 flex items-center justify-center">
            <GraduationCap className="w-9 h-9 text-white animate-pulse" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Smart Campus Assistant
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {isLogin ? 'Manage your academic life seamlessly' : 'Join your university digital student portal'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Meghana Bezawada"
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Enrollment Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <KeyRound className="w-5 h-5" />
                      </span>
                      <input
                        type="text"
                        required
                        value={enrollmentNo}
                        onChange={(e) => setEnrollmentNo(e.target.value)}
                        placeholder="CST-2026-089"
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Semester
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <BookOpen className="w-5 h-5" />
                      </span>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none transition-colors text-sm appearance-none"
                      >
                        {semesters.map((sem) => (
                          <option key={sem} value={sem} className="bg-slate-900 text-white">{sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Department Branch
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors text-sm"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept} className="bg-slate-900 text-white">{dept}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Admin Registration Passcode <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={signupCode}
                  onChange={(e) => setSignupCode(e.target.value)}
                  placeholder="Enter token for administration access"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
                />
                <p className="mt-1.5 text-[10px] text-slate-500">
                  Provide <code className="text-slate-400">CAMPUSADMIN2026</code> to register as a staff controller.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Please wait...' : (isLogin ? 'Sign In Securely' : 'Complete Registration')}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Access Box (Collapsible for cleaner visual appearance) */}
          <div className="mt-6 pt-5 border-t border-slate-800/60 text-center">
            {!showDemo ? (
              <button
                type="button"
                onClick={() => setShowDemo(true)}
                className="text-[10px] font-semibold tracking-wider font-mono uppercase text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer py-1 px-3 bg-slate-900/40 border border-slate-800/50 hover:border-slate-800 rounded-lg"
              >
                <span>💡 Click here to show Demo Accounts</span>
              </button>
            ) : (
              <div className="space-y-3.5 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    ⚡ Campus Live Portal Demo Access
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDemo(false)}
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    [ Hide ]
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('meghanabezawada161@gmail.com');
                      setPassword('password123');
                      setIsLogin(true);
                      setError('');
                      setSuccess('Filled demo student credentials! Click "Sign In Securely" to enter.');
                    }}
                    className="p-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/35 rounded-xl text-left cursor-pointer transition-all group"
                  >
                    <span className="block text-[11px] font-bold text-blue-400 group-hover:text-blue-300 transition-colors">Meghana (Student)</span>
                    <span className="block text-[9px] text-slate-500 font-mono mt-0.5">Quick fill profile & lab logs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@campus.edu');
                      setPassword('admin123');
                      setIsLogin(true);
                      setError('');
                      setSuccess('Filled staff administrator credentials! Click "Sign In Securely" to enter.');
                    }}
                    className="p-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/35 rounded-xl text-left cursor-pointer transition-all group"
                  >
                    <span className="block text-[11px] font-bold text-amber-400 group-hover:text-amber-300 transition-colors">Staff Admin</span>
                    <span className="block text-[9px] text-slate-500 font-mono mt-0.5">Quick fill portal control panel</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800/60 flex items-center justify-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer focus:outline-none"
            >
              {isLogin 
                ? "Don't have an account yet? Register here" 
                : "Already registered with us? Log in here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
