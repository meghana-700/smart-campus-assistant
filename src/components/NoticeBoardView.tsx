import React, { useState, useEffect } from 'react';
import { Megaphone, Search, AlertTriangle, Calendar, User, Eye, ArrowUpDown } from 'lucide-react';
import { Notice, Student } from '../types';

interface NoticeBoardViewProps {
  user: Student;
  token: string;
}

export default function NoticeBoardView({ user, token }: NoticeBoardViewProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    async function loadNotices() {
      try {
        const res = await fetch('/api/notices', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setNotices(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, [token]);

  // Handle Notice Search and Filter Logic
  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.content.toLowerCase().includes(search.toLowerCase()) ||
                          n.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Notices' },
    { value: 'academic', label: 'Academic' },
    { value: 'placement', label: 'Placements' },
    { value: 'event', label: 'Events' },
    { value: 'general', label: 'General' }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-mono mt-3 uppercase tracking-widest">Accessing Bulletin Board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <h2 className="text-2xl font-bold text-white">Bulletin & Notice Board</h2>
          <p className="text-sm text-slate-400 mt-1">Stay updated with official academic, curricular, and professional circulars.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bulletins by title, context, or author..."
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
          />
        </div>

        {/* Category Pill select */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors text-sm appearance-none"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-slate-900 text-white">{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div 
              key={notice.id} 
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                notice.important 
                  ? 'bg-slate-900/60 border-amber-500/20 hover:border-amber-500/40 shadow-lg shadow-amber-500/5' 
                  : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                      notice.category === 'academic' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      notice.category === 'placement' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                      notice.category === 'event' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {notice.category}
                    </span>

                    {notice.important && (
                      <span className="flex items-center space-x-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>IMPORTANT</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(notice.date).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-100 mt-4 leading-snug line-clamp-2">
                  {notice.title}
                </h3>

                <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                  {notice.content}
                </p>
              </div>

              {/* Bottom Details panel */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-500 truncate max-w-[70%]">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">By: {notice.author}</span>
                </div>

                <button
                  onClick={() => setSelectedNotice(notice)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Read Notice</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
            <Megaphone className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mt-4">No matching announcements or notices found.</p>
          </div>
        )}
      </div>

      {/* Notice Read Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-2xl w-full shadow-2xl relative animate-scale-up">
            
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                  selectedNotice.category === 'academic' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  selectedNotice.category === 'placement' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                  selectedNotice.category === 'event' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {selectedNotice.category}
                </span>

                {selectedNotice.important && (
                  <span className="flex items-center space-x-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>IMPORTANT</span>
                  </span>
                )}
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(selectedNotice.date).toLocaleDateString()} {new Date(selectedNotice.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h3 className="font-bold text-xl text-white mt-5 leading-snug">
              {selectedNotice.title}
            </h3>

            <div className="text-slate-300 text-sm mt-4 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto pr-2">
              {selectedNotice.content}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Published by: <strong>{selectedNotice.author}</strong></span>
              
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
