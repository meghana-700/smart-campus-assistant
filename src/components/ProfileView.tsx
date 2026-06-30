import React, { useState } from 'react';
import { User, Key, Mail, Calendar, GraduationCap, CheckCircle2, ShieldCheck, Save } from 'lucide-react';
import { Student } from '../types';

interface ProfileViewProps {
  user: Student;
  token: string;
  onProfileUpdate: (updatedUser: Student) => void;
}

export default function ProfileView({ user, token, onProfileUpdate }: ProfileViewProps) {
  const [enrollmentNo, setEnrollmentNo] = useState(user.enrollmentNo);
  const [department, setDepartment] = useState(user.department);
  const [semester, setSemester] = useState(user.semester);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
    '8th Semester',
    'N/A'
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enrollmentNo, department, semester })
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Failed to sync modifications.');
      }

      onProfileUpdate(updated);
      setSuccess('Profile records updated successfully!');
      setTimeout(() => setSuccess(''), 4000);

    } catch (err: any) {
      setError(err.message || 'System error saving credentials.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 select-none">
      
      {/* Tab Header */}
      <div className="pb-6 border-b border-slate-800/60">
        <h2 className="text-2xl font-bold text-white">My Academic Profile</h2>
        <p className="text-sm text-slate-400 mt-1">Manage and update your central registry credentials and academic streams.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-xl flex items-center space-x-2.5 animate-scale-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold rounded-xl flex items-center space-x-2.5">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Card: Student badge */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl relative">
            {user.name.substring(0, 2).toUpperCase()}
            <div className="absolute bottom-0 right-1.5 p-1.5 bg-blue-600 rounded-full border-2 border-slate-900 text-white shadow-md">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>

          <h3 className="font-bold text-lg text-slate-100 mt-5">{user.name}</h3>
          
          <div className="mt-2 flex items-center space-x-1.5 justify-center">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              user.role === 'admin' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {user.role === 'admin' ? 'Administrator' : 'Student'}
            </span>
          </div>

          <div className="mt-6 w-full pt-6 border-t border-slate-800/60 text-xs text-slate-400 space-y-3.5 text-left font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Registry ID:</span>
              <span className="text-slate-300 font-semibold truncate max-w-[60%]">{user.id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-500">Registered:</span>
              <span className="text-slate-300 font-semibold">{new Date(user.joinedAt).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Authorization:</span>
              <span className="text-blue-400 font-semibold uppercase">{user.role} tier</span>
            </div>
          </div>
        </div>

        {/* Right Card: Editable credentials */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="font-bold text-base text-white mb-6">Central registry records</h3>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Registered Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user.name}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-500 text-xs focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user.email}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-500 text-xs focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">University Enrollment ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  placeholder="e.g., CST-2026-089"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>

            {user.role !== 'admin' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Semester Registry</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-xs focus:outline-none transition-colors"
                  >
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Department Stream</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-xs focus:outline-none transition-colors"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800/60 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md shadow-blue-600/10"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{saving ? 'Saving...' : 'Update credentials'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
