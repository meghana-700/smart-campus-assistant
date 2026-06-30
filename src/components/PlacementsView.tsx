import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Calendar, Landmark, CheckCircle2, Award, FileSpreadsheet, ArrowUpRight, Eye, X, DollarSign, Building } from 'lucide-react';
import { PlacementUpdate, Student } from '../types';

interface PlacementsViewProps {
  user: Student;
  token: string;
}

export default function PlacementsView({ user, token }: PlacementsViewProps) {
  const [placements, setPlacements] = useState<PlacementUpdate[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'job' | 'internship'>('all');
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Success trigger notifications
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementUpdate | null>(null);

  useEffect(() => {
    async function loadPlacements() {
      try {
        const res = await fetch('/api/placements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setPlacements(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPlacements();
  }, [token]);

  const handleApply = async (placementId: string, company: string, role: string) => {
    setApplyingId(placementId);
    setAppliedNotice(null);

    try {
      const res = await fetch(`/api/placements/${placementId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const updatedPlacement = await res.json();
        setPlacements(prev => prev.map(p => p.id === placementId ? updatedPlacement : p));
        setAppliedNotice(`Congratulations! You applied successfully for the ${role} position at ${company}.`);
        setTimeout(() => setAppliedNotice(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingId(null);
    }
  };

  const filteredPlacements = placements.filter(p => {
    const matchesSearch = p.company.toLowerCase().includes(search.toLowerCase()) || 
                          p.role.toLowerCase().includes(search.toLowerCase()) ||
                          p.eligibility.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-mono mt-3 uppercase tracking-widest">Accessing Placement Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header banner */}
      <div className="pb-6 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Placement & Internship Drives</h2>
          <p className="text-sm text-slate-400 mt-1">Submit resumes, secure interviews, and explore active corporate hiring programs.</p>
        </div>
      </div>

      {/* Applied Success Toast */}
      {appliedNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium rounded-xl flex items-center space-x-2.5 animate-scale-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="md:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drives by company name, technology stack, eligibility..."
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
          />
        </div>

        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          
          <button
            onClick={() => setTypeFilter('job')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'job' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Full-time Job
          </button>

          <button
            onClick={() => setTypeFilter('internship')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'internship' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Internship
          </button>
        </div>
      </div>

      {/* Corporate Drives Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlacements.length > 0 ? (
          filteredPlacements.map((drive) => {
            const hasApplied = drive.appliedStudents.includes(user.id);
            return (
              <div 
                key={drive.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                      drive.type === 'job' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {drive.type === 'job' ? 'Full-Time Job' : 'Internship Drive'}
                    </span>

                    <span className="text-[11px] font-mono font-semibold text-amber-400">
                      Package: {drive.salaryPackage}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3.5 mt-4">
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl shrink-0 text-slate-400">
                      <Landmark className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{drive.role}</h3>
                      <p className="text-xs text-slate-400 font-medium">{drive.company}</p>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs mt-4 leading-relaxed line-clamp-3">
                    {drive.description}
                  </p>

                  <div className="mt-5 space-y-1.5 p-3.5 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-400">
                    <p><span className="text-slate-500">Eligibility Criteria:</span> <strong className="text-slate-300">{drive.eligibility}</strong></p>
                    <p className="flex items-center space-x-1.5 mt-1 font-mono text-[11px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Registration Deadline: <strong className="text-rose-400">{drive.deadline}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Bottom Row Controls */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPlacement(drive)}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center space-x-1.5 cursor-pointer py-2 px-3 hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-700"
                  >
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span>View Specifications</span>
                  </button>

                  <button
                    onClick={() => handleApply(drive.id, drive.company, drive.role)}
                    disabled={hasApplied || applyingId === drive.id}
                    className={`px-4.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      hasApplied 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/10'
                    }`}
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Registered ✓</span>
                      </>
                    ) : (
                      <>
                        <span>{applyingId === drive.id ? 'Applying...' : 'Register Candidate'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 lg:col-span-2 text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mt-4">No matching placement updates found.</p>
          </div>
        )}
      </div>

      {/* Placements Details Modal */}
      {selectedPlacement && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-2xl w-full shadow-2xl relative animate-scale-up my-8">
            <button
              onClick={() => setSelectedPlacement(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-5">
              <div className="p-3 bg-blue-600/10 border border-blue-500/25 rounded-xl text-blue-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                  selectedPlacement.type === 'job' 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {selectedPlacement.type === 'job' ? 'Full-Time Employment' : 'Summer Internship'}
                </span>
                <h3 className="font-bold text-xl text-white mt-1.5 leading-snug">{selectedPlacement.role}</h3>
                <p className="text-xs text-slate-400 font-medium">{selectedPlacement.company}</p>
              </div>
            </div>

            <div className="space-y-6 mt-6">
              {/* Financial & Deadline Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Salary / Stipend package</p>
                  <p className="text-sm font-mono font-bold text-amber-400 mt-1 flex items-center">
                    <DollarSign className="w-4 h-4 text-amber-500 mr-1 shrink-0" />
                    <span>{selectedPlacement.salaryPackage}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Registration Deadline</p>
                  <p className="text-sm font-mono font-bold text-rose-400 mt-1 flex items-center">
                    <Calendar className="w-4 h-4 text-rose-500 mr-1 shrink-0" />
                    <span>{selectedPlacement.deadline}</span>
                  </p>
                </div>
              </div>

              {/* Eligibility Section */}
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                  <Award className="w-4 h-4 text-blue-400 mr-1.5 shrink-0" />
                  <span>Academic Eligibility & Criteria</span>
                </p>
                <p className="text-xs text-slate-200 font-medium mt-1 leading-relaxed pl-5">
                  {selectedPlacement.eligibility}
                </p>
              </div>

              {/* Full Job description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comprehensive Job Specifications</h4>
                <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-850">
                  {selectedPlacement.description}
                </p>
              </div>

              {/* Enrolled applicants directory list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Candidates From Campus ({selectedPlacement.appliedStudents.length})</h4>
                {selectedPlacement.appliedStudents.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedPlacement.appliedStudents.map(studentId => (
                      <span key={studentId} className="text-[10px] px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 font-medium">
                        Student ID: {studentId}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic pl-1">No student candidates registered for this drive yet.</p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Status: <strong className="text-emerald-400 font-bold uppercase">{selectedPlacement.status}</strong></span>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedPlacement(null)}
                  className="px-4.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close Details
                </button>

                <button
                  onClick={() => {
                    handleApply(selectedPlacement.id, selectedPlacement.company, selectedPlacement.role);
                    setSelectedPlacement(null);
                  }}
                  disabled={selectedPlacement.appliedStudents.includes(user.id)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    selectedPlacement.appliedStudents.includes(user.id)
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/10'
                  }`}
                >
                  {selectedPlacement.appliedStudents.includes(user.id) ? 'Registered ✓' : 'Register Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
