import React, { useState, useEffect } from 'react';
import { ShieldCheck, Megaphone, Calendar, Briefcase, PlusCircle, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Notice, CampusEvent, PlacementUpdate, Student } from '../types';

interface AdminConsoleViewProps {
  user: Student;
  token: string;
}

export default function AdminConsoleView({ user, token }: AdminConsoleViewProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [placements, setPlacements] = useState<PlacementUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // Status alerts
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Active form Tab
  const [activeForm, setActiveForm] = useState<'notice' | 'event' | 'placement'>('notice');

  // --- Form States ---
  // Notice Form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'academic' | 'placement' | 'event' | 'general'>('general');
  const [noticeImportant, setNoticeImportant] = useState(false);

  // Event Form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');

  // Placement Form
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState<'job' | 'internship'>('job');
  const [eligibility, setEligibility] = useState('');
  const [packageCTC, setPackageCTC] = useState('');
  const [deadline, setDeadline] = useState('');
  const [placementDesc, setPlacementDesc] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [nRes, eRes, pRes] = await Promise.all([
          fetch('/api/notices', { headers }),
          fetch('/api/events', { headers }),
          fetch('/api/placements', { headers }),
        ]);

        if (nRes.ok) setNotices(await nRes.json());
        if (eRes.ok) setEvents(await eRes.json());
        if (pRes.ok) setPlacements(await pRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [token]);

  // Submit Notice
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const payload = { 
      title: noticeTitle, 
      content: noticeContent, 
      category: noticeCategory, 
      important: noticeImportant 
    };

    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotices(prev => [data, ...prev]);
      setSuccess('Official notice announcement published successfully!');
      
      // Reset Notice
      setNoticeTitle('');
      setNoticeContent('');
      setNoticeImportant(false);
    } catch (err: any) {
      setError(err.message || 'Failed to post notice.');
    }
  };

  // Submit Event
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const payload = {
      title: eventTitle,
      description: eventDesc,
      date: eventDate,
      time: eventTime,
      venue: eventVenue
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEvents(prev => [data, ...prev]);
      setSuccess('New campus workshop scheduled successfully!');
      
      // Reset Event
      setEventTitle('');
      setEventDesc('');
      setEventDate('');
      setEventTime('');
      setEventVenue('');
    } catch (err: any) {
      setError(err.message || 'Failed to post campus event.');
    }
  };

  // Submit Placement Drive
  const handlePlacementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const payload = {
      company,
      role,
      type,
      eligibility,
      salaryPackage: packageCTC,
      deadline,
      description: placementDesc
    };

    try {
      const res = await fetch('/api/placements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPlacements(prev => [data, ...prev]);
      setSuccess('Corporate drive and candidate registration details listed!');

      // Reset Placement
      setCompany('');
      setRole('');
      setEligibility('');
      setPackageCTC('');
      setDeadline('');
      setPlacementDesc('');
    } catch (err: any) {
      setError(err.message || 'Failed to list corporate drive.');
    }
  };

  // Delete Handlers
  const deleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to remove this notice bulletin?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotices(prev => prev.filter(n => n.id !== id));
        setSuccess('Announcement pruned successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled workshop event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
        setSuccess('Event removed from university calendar.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePlacement = async (id: string) => {
    if (!confirm('Prune this active placement registry?')) return;
    try {
      const res = await fetch(`/api/placements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPlacements(prev => prev.filter(p => p.id !== id));
        setSuccess('Corporate drive entry archived and pruned.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-mono mt-3 uppercase tracking-widest font-bold">Unlocking Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-4">
        <div className="p-3 bg-blue-600 rounded-xl flex items-center justify-center text-white">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Admin Console</h2>
          <p className="text-sm text-slate-400 mt-0.5">Publish circulars, organize academic forums, and post verified placement notifications.</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-xl flex items-center space-x-2 animate-scale-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Span 1: Resource Management Selection forms */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-6">
          <div>
            <h3 className="font-bold text-base text-white">Console Command Actions</h3>
            <p className="text-xs text-slate-400 mt-1">Select action category to push updates into campus databases.</p>
          </div>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveForm('notice')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeForm === 'notice' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0" />
              <span>Broadcast Official Notice</span>
            </button>

            <button
              onClick={() => setActiveForm('event')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeForm === 'event' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Host Workshop Event</span>
            </button>

            <button
              onClick={() => setActiveForm('placement')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeForm === 'placement' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>List Corporate Hiring Drive</span>
            </button>
          </div>
        </div>

        {/* Right Span 2: Active Dynamic Forms and live state lists */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* NOTICE BOARD BROADCASTER FORM */}
          {activeForm === 'notice' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
              <h3 className="font-bold text-lg text-white">Broadcast New Bulletin</h3>
              
              <form onSubmit={handleNoticeSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Bulletin Title</label>
                  <input
                    type="text"
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g., Odd Semester Exams Registrations Open"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Department Category</label>
                    <select
                      value={noticeCategory}
                      onChange={(e) => setNoticeCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    >
                      <option value="general">General Campus</option>
                      <option value="academic">Academic Board</option>
                      <option value="placement">Placements cell</option>
                      <option value="event">Student activities</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3 mt-8">
                    <input
                      type="checkbox"
                      id="noticeImportant"
                      checked={noticeImportant}
                      onChange={(e) => setNoticeImportant(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-950 border-slate-800 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="noticeImportant" className="text-xs font-semibold text-amber-400 cursor-pointer uppercase tracking-wider">
                      Flag as Critical Urgent Notice
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Notice Circular details</label>
                  <textarea
                    required
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Include deadlines, registration paths and requirements..."
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md shadow-blue-600/10"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>Publish Announcement</span>
                  </button>
                </div>
              </form>

              {/* Notice Management Lists */}
              <div className="pt-8 border-t border-slate-800/60">
                <h4 className="font-bold text-sm text-slate-300 mb-4">Active Notices Registry</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {notices.map(notice => (
                    <div key={notice.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 truncate">{notice.title}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">{notice.category} | Published: {new Date(notice.date).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CAMPUS EVENT WORKSHOP FORM */}
          {activeForm === 'event' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
              <h3 className="font-bold text-lg text-white">Schedule New Workshop Event</h3>

              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Workshop Name</label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g., Deep Dive into Generative AI Networks"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Scheduled Date</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Class Timings</label>
                    <input
                      type="text"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="e.g., 10:00 AM - 04:00 PM"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Venue Location</label>
                    <input
                      type="text"
                      required
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      placeholder="e.g., LH-301 or Audi-B"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Brief Workshop details</label>
                  <textarea
                    required
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="Overview of the hands-on sessions and speakers..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md shadow-blue-600/10"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>Schedule Event</span>
                  </button>
                </div>
              </form>

              {/* Event lists */}
              <div className="pt-8 border-t border-slate-800/60">
                <h4 className="font-bold text-sm text-slate-300 mb-4">Active Events Registry</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {events.map(ev => (
                    <div key={ev.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 truncate">{ev.title}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">Date: {ev.date} | RSVP: {ev.rsvpCount}</p>
                      </div>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CORPORATE HIRING DRIVE FORM */}
          {activeForm === 'placement' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
              <h3 className="font-bold text-lg text-white">Create New Corporate Hiring Drive</h3>

              <form onSubmit={handlePlacementSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Company Name</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Microsoft India"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Designation / Role</label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g., Software Development Engineer Intern"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Drive Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    >
                      <option value="job">Full-time Job</option>
                      <option value="internship">Internship Program</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Eligibility Criteria</label>
                    <input
                      type="text"
                      required
                      value={eligibility}
                      onChange={(e) => setEligibility(e.target.value)}
                      placeholder="e.g., B.Tech CSE / IT CGPA >= 8.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Salary / Package CTC</label>
                    <input
                      type="text"
                      required
                      value={packageCTC}
                      onChange={(e) => setPackageCTC(e.target.value)}
                      placeholder="e.g., ₹18,50,000 LPA"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Candidate Registration Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Brief Role details</label>
                  <textarea
                    required
                    value={placementDesc}
                    onChange={(e) => setPlacementDesc(e.target.value)}
                    placeholder="Brief description of skills required and responsibilities..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md shadow-blue-600/10"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>Create Hiring Drive</span>
                  </button>
                </div>
              </form>

              {/* Placement drive list */}
              <div className="pt-8 border-t border-slate-800/60">
                <h4 className="font-bold text-sm text-slate-300 mb-4">Active Placement Drives Registry</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {placements.map(pl => (
                    <div key={pl.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 truncate">{pl.company} - {pl.role}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">Stipend: {pl.salaryPackage} | Registered: {pl.appliedStudents.length}</p>
                      </div>
                      <button
                        onClick={() => deletePlacement(pl.id)}
                        className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
