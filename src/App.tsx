import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginRegister from './components/LoginRegister';
import DashboardView from './components/DashboardView';
import NoticeBoardView from './components/NoticeBoardView';
import TimetableExamsView from './components/TimetableExamsView';
import ChatbotView from './components/ChatbotView';
import PlacementsView from './components/PlacementsView';
import StudyHubView from './components/StudyHubView';
import ProfileView from './components/ProfileView';
import AdminConsoleView from './components/AdminConsoleView';
import CampusDirectoryView from './components/CampusDirectoryView';
import { Student } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('campus_token'));
  const [user, setUser] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [fetchingProfile, setFetchingProfile] = useState(false);

  // Authenticate user on mount or token change
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    async function loadProfile() {
      setFetchingProfile(true);
      try {
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const profileData = await res.json();
          setUser(profileData);
        } else {
          // Token expired or invalid
          localStorage.removeItem('campus_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        // offline fallback or clear
      } finally {
        setFetchingProfile(false);
      }
    }

    loadProfile();
  }, [token]);

  const handleAuthSuccess = (newToken: string, newUser: Student) => {
    localStorage.setItem('campus_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('campus_token');
    setToken(null);
    setUser(null);
  };

  const handleProfileUpdate = (updatedUser: Student) => {
    setUser(updatedUser);
  };

  if (fetchingProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-mono mt-4 uppercase tracking-widest">Validating Academic Credentials...</p>
        </div>
      </div>
    );
  }

  // Render Login page if not authenticated
  if (!token || !user) {
    return <LoginRegister onAuthSuccess={handleAuthSuccess} />;
  }

  // Main Authenticated Portal Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased overflow-x-hidden">
      
      {/* Interactive Sidebar Panel */}
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      {/* Primary Dynamic Workspace View */}
      <main className="flex-1 overflow-y-auto max-h-screen relative bg-slate-950">
        
        {activeTab === 'dashboard' && (
          <DashboardView user={user} token={token} />
        )}

        {activeTab === 'notices' && (
          <NoticeBoardView user={user} token={token} />
        )}

        {activeTab === 'timetable' && (
          <TimetableExamsView user={user} token={token} />
        )}

        {activeTab === 'chatbot' && (
          <ChatbotView user={user} token={token} />
        )}

        {activeTab === 'placements' && (
          <PlacementsView user={user} token={token} />
        )}

        {activeTab === 'materials' && (
          <StudyHubView user={user} token={token} />
        )}

        {activeTab === 'directory' && (
          <CampusDirectoryView user={user} token={token} />
        )}

        {activeTab === 'profile' && (
          <ProfileView user={user} token={token} onProfileUpdate={handleProfileUpdate} />
        )}

        {activeTab === 'admin' && user.role === 'admin' && (
          <AdminConsoleView user={user} token={token} />
        )}

      </main>
    </div>
  );
}
