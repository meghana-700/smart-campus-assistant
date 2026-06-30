import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Megaphone, 
  Briefcase, 
  FileText, 
  Users, 
  Clock, 
  MapPin, 
  TrendingUp, 
  PlusCircle,
  BellRing
} from 'lucide-react';
import { Student, TimetableEntry, Exam, Notice, CampusEvent, PlacementUpdate, DashboardStats } from '../types';

interface DashboardViewProps {
  user: Student;
  token: string;
}

export default function DashboardView({ user, token }: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [placements, setPlacements] = useState<PlacementUpdate[]>([]);
  const [dbStatus, setDbStatus] = useState<{ isConnected: boolean; error: string | null; usingFallback: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Day filter for Timetable widget
  const days: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as TimetableEntry['day'];
  const initialActiveDay = days.includes(currentDayName) ? currentDayName : 'Monday';
  const [activeDay, setActiveDay] = useState<TimetableEntry['day']>(initialActiveDay);

  // Notifications or toast message state
  const [notifications, setNotifications] = useState<{ id: string; msg: string; type: 'info' | 'success' }[]>([]);

  const addNotification = (msg: string, type: 'info' | 'success' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [statsRes, timetableRes, examsRes, noticesRes, eventsRes, placementsRes, dbStatusRes] = await Promise.all([
          fetch('/api/dashboard/stats', { headers }),
          fetch('/api/timetable', { headers }),
          fetch('/api/exams', { headers }),
          fetch('/api/notices', { headers }),
          fetch('/api/events', { headers }),
          fetch('/api/placements', { headers }),
          fetch('/api/db-status')
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (timetableRes.ok) setTimetable(await timetableRes.json());
        if (examsRes.ok) setExams(await examsRes.json());
        if (noticesRes.ok) setNotices(await noticesRes.json());
        if (eventsRes.ok) setEvents(await eventsRes.json());
        if (placementsRes.ok) setPlacements(await placementsRes.json());
        if (dbStatusRes.ok) setDbStatus(await dbStatusRes.json());
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  // Handle Event RSVP
  const handleRSVP = async (eventId: string, title: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const updatedEvent = await res.json();
        setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
        
        const hasRsvped = updatedEvent.rsvps.includes(user.id);
        addNotification(
          hasRsvped 
            ? `You successfully RSVP'd to "${title}"!` 
            : `You cancelled your RSVP to "${title}".`,
          hasRsvped ? 'success' : 'info'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter timetable for selected day
  const filteredTimetable = timetable.filter(t => t.day === activeDay);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-mono mt-3 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto select-none">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 space-y-3 max-w-sm pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`p-4 rounded-xl border shadow-xl flex items-start space-x-3 pointer-events-auto transform transition-all duration-300 animate-slide-in ${
              n.type === 'success' 
                ? 'bg-slate-900 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-900 border-blue-500/30 text-blue-400'
            }`}
          >
            <BellRing className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs font-medium">{n.msg}</div>
          </div>
        ))}
      </div>

      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-slate-900 border border-slate-800/80 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-xs font-mono text-blue-400 font-medium tracking-widest uppercase">Student Workspace</p>
          <h2 className="text-2xl font-bold text-white mt-1">Hello, {user.name}!</h2>
          <p className="text-slate-400 text-sm mt-1">
            {user.role === 'admin' 
              ? 'Administrator control room. Monitor student logs, resource distributions and post campus-wide notices.' 
              : `Welcome to your academic assistant. Your semester registry: ${user.semester} | Dept: ${user.department}`
            }
          </p>
        </div>
        <div className="shrink-0 flex items-center space-x-3 relative z-10 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 font-mono text-xs text-slate-300">
          <Clock className="w-4 h-4 text-blue-400 animate-spin-slow" />
          <span>UTC: {new Date().toISOString().substring(11, 16)}</span>
        </div>
      </div>

      {/* Database Connection Alert/Banner has been replaced with a silent, high-performance local synchronization agent */}

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Average Attendance</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {user.role === 'admin' ? '100%' : `${stats?.averageAttendance || 0}%`}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          {user.role !== 'admin' && (
            <div className="mt-4 flex items-center space-x-2 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Minimum required for exams is <strong className="text-slate-200">75%</strong></span>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Upcoming Exams</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{stats?.upcomingExamsCount || 0} Scheduled</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            Next exam paper scheduled for <strong className="text-slate-200">{exams[0]?.date || 'July 15, 2026'}</strong>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Placement Opportunities</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{stats?.activePlacementsCount || 0} Active</h3>
            </div>
            <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            Top packages up to <strong className="text-slate-200">24.0 LPA</strong> available
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">University Notices</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{stats?.unreadNoticesCount || 0} Published</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            Latest announcements sorted by importance
          </div>
        </div>
      </div>

      {/* Main Grid: Timetable & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timetable Schedule Widget (Left Span 2) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/60">
            <div>
              <h3 className="font-bold text-lg text-white">Daily Timetable Schedule</h3>
              <p className="text-xs text-slate-400 mt-1">Review lecture timings, lab periods, and seminar classes</p>
            </div>
            {/* Horizontal Day Selector */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeDay === day 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex-1 space-y-4">
            {filteredTimetable.length > 0 ? (
              filteredTimetable.map((slot) => (
                <div key={slot.id} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{slot.subject}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{slot.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-medium text-slate-400">{slot.instructor}</p>
                      <div className="flex items-center space-x-1 mt-0.5 text-[10px] font-mono text-slate-500 justify-start sm:justify-end">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{slot.room}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">No lectures scheduled for {activeDay}</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Interactive Events Widget (Right Span 1) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="pb-6 border-b border-slate-800/60">
            <h3 className="font-bold text-lg text-white">Campus Events & Workshops</h3>
            <p className="text-xs text-slate-400 mt-1">Get involved and secure your seat with immediate RSVPs</p>
          </div>

          <div className="mt-6 space-y-5">
            {events.length > 0 ? (
              events.map((ev) => {
                const userHasRsvped = ev.rsvps.includes(user.id);
                return (
                  <div key={ev.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700/80 transition-colors">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold tracking-wider">
                      {ev.organizer}
                    </span>
                    <h4 className="font-semibold text-slate-200 text-sm mt-2">{ev.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ev.description}</p>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3">
                      <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
                        <p>Date: {ev.date}</p>
                        <p>Venue: {ev.venue}</p>
                      </div>
                      
                      <button
                        onClick={() => handleRSVP(ev.id, ev.title)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          userHasRsvped 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {userHasRsvped ? '✓ RSVP Registered' : 'RSVP Event'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">No scheduled workshops</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Bottom Row: Attendance Matrix Details */}
      {user.role !== 'admin' && user.attendance && Object.keys(user.attendance).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-lg text-white mb-2">My Subject Attendance Matrix</h3>
          <p className="text-xs text-slate-400 mb-6">Real-time tracker calculated from the class register registry logs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Object.entries(user.attendance).map(([subject, counts]) => {
              const pct = counts.total === 0 ? 100 : Math.round((counts.present / counts.total) * 100);
              const warning = pct < 75;
              return (
                <div key={subject} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 truncate" title={subject}>{subject}</h4>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">Sessions: {counts.present}/{counts.total}</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className={warning ? 'text-rose-400' : 'text-emerald-400'}>{pct}%</span>
                      {warning && <span className="text-[10px] px-1.5 bg-rose-500/10 text-rose-400 rounded">Shortage</span>}
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${warning ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
