import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  Megaphone, 
  Briefcase, 
  User, 
  MessageSquare, 
  ShieldAlert, 
  LogOut, 
  GraduationCap,
  Users
} from 'lucide-react';
import { Student } from '../types';

interface SidebarProps {
  user: Student | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout }: SidebarProps) {
  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notices', label: 'Notice Board', icon: Megaphone },
    { id: 'timetable', label: 'Timetable & Exams', icon: CalendarDays },
    { id: 'chatbot', label: 'AI Chatbot Advisor', icon: MessageSquare },
    { id: 'placements', label: 'Placement Drives', icon: Briefcase },
    { id: 'materials', label: 'Study Hub', icon: BookOpen },
    { id: 'directory', label: 'Campus Directory', icon: Users },
    { id: 'profile', label: 'Student Profile', icon: User },
  ];

  // Insert Admin Panel only if user is Admin
  if (user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Console', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2.5 bg-blue-600 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg leading-tight tracking-tight text-white">Smart Campus</h1>
          <p className="font-mono text-[10px] text-blue-400 font-medium tracking-widest uppercase">Assistant Hub</p>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-sm uppercase">
            {user.name.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-medium text-sm text-slate-100 truncate">{user.name}</h3>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                user.role === 'admin' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {user.role === 'admin' ? 'Administrator' : 'Student'}
              </span>
            </div>
          </div>
        </div>
        {user.role !== 'admin' && (
          <div className="mt-3 text-[11px] text-slate-400 font-medium">
            <p className="truncate"><span className="text-slate-500">Dept:</span> {user.department}</p>
            <p className="mt-0.5"><span className="text-slate-500">Reg:</span> {user.enrollmentNo}</p>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
