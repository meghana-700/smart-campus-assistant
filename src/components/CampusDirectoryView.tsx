import React, { useState, useEffect } from 'react';
import { Users, Search, Building2, Calendar, Mail, ShieldAlert, GraduationCap, Award, Filter, ArrowUpDown } from 'lucide-react';
import { Student } from '../types';

interface CampusDirectoryViewProps {
  user: Student;
  token: string;
}

export default function CampusDirectoryView({ user, token }: CampusDirectoryViewProps) {
  const [directory, setDirectory] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'joined'>('name');

  useEffect(() => {
    async function fetchDirectory() {
      try {
        const res = await fetch('/api/campus/directory', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDirectory(data);
        }
      } catch (err) {
        console.error('Error fetching campus directory:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDirectory();
  }, [token]);

  // Extract unique departments for filter dropdown
  const departmentsList = Array.from(new Set(directory.map(s => s.department).filter(Boolean)));

  // Filter and sort directory
  const filteredDirectory = directory.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(search.toLowerCase()));
    
    const matchesDept = deptFilter === 'all' || s.department === deptFilter;
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;

    return matchesSearch && matchesDept && matchesRole;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    }
  });

  // Calculate stats
  const totalCount = directory.length;
  const studentCount = directory.filter(s => s.role === 'student').length;
  const adminCount = directory.filter(s => s.role === 'admin').length;
  const uniqueDeptsCount = departmentsList.length || 1;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-mono mt-3 uppercase tracking-widest font-semibold">Accessing Campus Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header section */}
      <div className="pb-6 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Campus Member Registry</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">Discover, search, and connect with registered student colleagues and administrators.</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl px-4 py-2 flex items-center space-x-3 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Database Live Sync Active</span>
        </div>
      </div>

      {/* Campus Stats Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 text-blue-500/10"><Users className="w-12 h-12" /></div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Total Citizens</p>
          <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Enrolled Registry accounts</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 text-emerald-500/10"><GraduationCap className="w-12 h-12" /></div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Active Students</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{studentCount}</p>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Pursuing degrees & labs</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 text-amber-500/10"><ShieldAlert className="w-12 h-12" /></div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Administrators</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{adminCount}</p>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Hub managers & moderators</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 text-indigo-500/10"><Building2 className="w-12 h-12" /></div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Streams Represented</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{uniqueDeptsCount}</p>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Undergraduate branches</div>
        </div>
      </div>

      {/* Search and Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, email, ID..."
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
          />
        </div>

        {/* Filter Department */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors text-sm appearance-none"
          >
            <option value="all" className="bg-slate-900">All Departments</option>
            {departmentsList.map(dept => (
              <option key={dept} value={dept} className="bg-slate-900">{dept}</option>
            ))}
          </select>
        </div>

        {/* Filter Role */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors text-sm appearance-none"
          >
            <option value="all" className="bg-slate-900">All Roles</option>
            <option value="student" className="bg-slate-900">Students Only</option>
            <option value="admin" className="bg-slate-900">Administrators Only</option>
          </select>
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <p>Showing <strong className="text-white font-semibold">{filteredDirectory.length}</strong> of {totalCount} registered accounts</p>
        
        <div className="flex items-center space-x-2.5">
          <span className="text-slate-500">Sort by:</span>
          <button 
            onClick={() => setSortBy(sortBy === 'name' ? 'joined' : 'name')}
            className="flex items-center space-x-1 py-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 font-semibold cursor-pointer transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortBy === 'name' ? 'Alphabetical' : 'Date Joined'}</span>
          </button>
        </div>
      </div>

      {/* Members Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDirectory.length > 0 ? (
          filteredDirectory.map((member) => {
            const isSelf = member.id === user.id;
            const initials = member.name.substring(0, 2).toUpperCase();
            
            return (
              <div 
                key={member.id}
                className={`bg-slate-900 border p-6 rounded-2xl flex flex-col justify-between transition-all ${
                  isSelf 
                    ? 'border-blue-500/40 shadow-lg shadow-blue-500/5 bg-slate-900/80' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    {/* Member Profile Avatar & details */}
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-sm uppercase shrink-0">
                        {initials}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-200 text-sm truncate flex items-center gap-1.5">
                          <span className="truncate">{member.name}</span>
                          {isSelf && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded-full font-bold tracking-wider font-mono">YOU</span>
                          )}
                        </h4>
                        
                        <p className="text-slate-500 text-[11px] font-mono flex items-center mt-0.5 truncate">
                          <Mail className="w-3 h-3 text-slate-500 mr-1 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Role badge */}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono shrink-0 ${
                      member.role === 'admin' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {member.role === 'admin' ? 'ADMIN' : 'STUDENT'}
                    </span>
                  </div>

                  {/* Academic specific info */}
                  {member.role !== 'admin' ? (
                    <div className="mt-5 space-y-1.5 p-3.5 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-400">
                      <p className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center"><Building2 className="w-3.5 h-3.5 mr-1 text-slate-500" /> Department:</span>
                        <strong className="text-slate-300 truncate max-w-[60%]">{member.department}</strong>
                      </p>
                      
                      <p className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center"><Award className="w-3.5 h-3.5 mr-1 text-slate-500" /> Enrollment No:</span>
                        <strong className="text-slate-300 font-mono text-[11px]">{member.enrollmentNo}</strong>
                      </p>

                      <p className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center"><GraduationCap className="w-3.5 h-3.5 mr-1 text-slate-500" /> Registered Sem:</span>
                        <strong className="text-slate-300 font-medium">{member.semester}</strong>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 text-xs text-slate-500 italic flex items-center justify-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500/80" />
                      <span>System Administrator Authority</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Joined Portal:</span>
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(member.joinedAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
            <Users className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
            <h4 className="text-white font-semibold mt-4 text-sm">No campus members match your filters</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1 leading-normal">Try adjusting your department filter, role query, or keywords inside the search bar.</p>
          </div>
        )}
      </div>

    </div>
  );
}
