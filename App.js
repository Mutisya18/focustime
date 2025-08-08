// App.js
import React, { useEffect, useState, useCallback } from 'react';
import Timer from './src/Timer';
import Notes from './src/Notes';
import Reminders from './src/Reminders';
import Analytics from './src/Analytics';
import { Clock, Sun, Moon } from 'lucide-react';

/*
  App centralizes state and persistence.
  All persisted data lives in localStorage under keys defined below.
*/

const STORAGE_KEYS = {
  sessions: 'focus_sessions_v1',
  notes: 'focus_notes_v1',
  reminders: 'focus_reminders_v1',
  analytics: 'focus_analytics_v1',
  ui: 'focus_ui_v1'
};

const defaultSessions = [
  { id: 'work', name: 'Work', duration: 25 * 60, color: '#2563eb', isDefault: true },
  { id: 'shortBreak', name: 'Short Break', duration: 5 * 60, color: '#059669', isDefault: true },
  { id: 'longBreak', name: 'Long Break', duration: 15 * 60, color: '#d97706', isDefault: true }
];

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn('Failed to load', key, err);
    return fallback;
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save', key, err);
  }
}

export default function App() {
  // load persisted state on first render
  const [sessions, setSessions] = useState(() => load(STORAGE_KEYS.sessions, defaultSessions));
  const [notes, setNotes] = useState(() => load(STORAGE_KEYS.notes, ''));
  const [reminders, setReminders] = useState(() => load(STORAGE_KEYS.reminders, []));
  const [analytics, setAnalytics] = useState(() => load(STORAGE_KEYS.analytics, {
    totalSessions: 0,
    totalFocusTime: 0,
    todaySessions: 0,
    todayFocusTime: 0
  }));
  const [ui, setUi] = useState(() => load(STORAGE_KEYS.ui, {
    activeTab: 'timer',
    darkMode: false,
    currentSessionId: 'work'
  }));

  // Persistors
  useEffect(() => save(STORAGE_KEYS.sessions, sessions), [sessions]);
  useEffect(() => save(STORAGE_KEYS.notes, notes), [notes]);
  useEffect(() => save(STORAGE_KEYS.reminders, reminders), [reminders]);
  useEffect(() => save(STORAGE_KEYS.analytics, analytics), [analytics]);
  useEffect(() => save(STORAGE_KEYS.ui, ui), [ui]);

  // Show keyboard shortcuts: space start/pause, esc reset handled inside Timer.

  // Helpers to mutate persisted state (pass to children)
  const addSession = (session) => setSessions(s => [...s, session]);
  const updateSession = (id, patch) => setSessions(s => s.map(x => x.id === id ? { ...x, ...patch } : x));
  const removeSession = (id) => setSessions(s => s.filter(x => x.id !== id));

  const addReminder = (r) => setReminders(list => [...list, r]);
  const updateReminder = (id, patch) => setReminders(list => list.map(r => r.id === id ? { ...r, ...patch } : r));
  const removeReminder = (id) => setReminders(list => list.filter(r => r.id !== id));

  const updateAnalytics = (fn) => setAnalytics(prev => {
    const next = typeof fn === 'function' ? fn(prev) : { ...prev, ...fn };
    return next;
  });

  // UI controls
  const setActiveTab = (tab) => setUi(u => ({ ...u, activeTab: tab }));
  const toggleDark = () => setUi(u => ({ ...u, darkMode: !u.darkMode }));
  const setCurrentSessionId = (id) => setUi(u => ({ ...u, currentSessionId: id }));

  // For convenience: ensure currentSession exists
  useEffect(() => {
    if (!sessions.find(s => s.id === ui.currentSessionId)) {
      setUi(u => ({ ...u, currentSessionId: sessions[0]?.id ?? 'work' }));
    }
  }, [sessions, ui.currentSessionId]);

  // Sync theme root variables
  useEffect(() => {
    if (ui.darkMode) {
      document.documentElement.style.setProperty('--bg', '#0f172a');
      document.documentElement.style.setProperty('--card', '#0b1220');
      document.documentElement.style.setProperty('--text', '#f8fafc');
    } else {
      document.documentElement.style.setProperty('--bg', '#f9fafb');
      document.documentElement.style.setProperty('--card', '#ffffff');
      document.documentElement.style.setProperty('--text', '#111827');
    }
  }, [ui.darkMode]);

  return (
    <div className="container">
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Clock size={20} />
          <h1 style={{margin:0}}>Focus</h1>
        </div>

        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{fontSize:13,color:'#6b7280'}}>Sessions: {analytics.totalSessions}</div>
          <button onClick={toggleDark} style={{padding:8,borderRadius:8,border:'none',background:'transparent'}}>
            {ui.darkMode ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
        </div>
      </header>

      <nav style={{display:'flex',gap:8,marginBottom:18}}>
        {[
          { id: 'timer', label: 'Timer' },
          { id: 'notes', label: 'Notes' },
          { id: 'reminders', label: 'Reminders' },
          { id: 'analytics', label: 'Analytics' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: ui.activeTab === t.id ? '1px solid #2563eb' : '1px solid transparent',
              background: ui.activeTab === t.id ? 'rgba(37,99,235,0.08)' : 'transparent'
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        <div className="card">
          {ui.activeTab === 'timer' && (
            <Timer
              sessions={sessions}
              currentSessionId={ui.currentSessionId}
              setCurrentSessionId={setCurrentSessionId}
              addSession={addSession}
              updateSession={updateSession}
              removeSession={removeSession}
              analytics={analytics}
              updateAnalytics={updateAnalytics}
            />
          )}

          {ui.activeTab === 'notes' && <Notes notes={notes} setNotes={setNotes} />}

          {ui.activeTab === 'reminders' && (
            <Reminders
              reminders={reminders}
              addReminder={addReminder}
              updateReminder={updateReminder}
              removeReminder={removeReminder}
            />
          )}

          {ui.activeTab === 'analytics' && <Analytics analytics={analytics} />}
        </div>
      </main>
    </div>
  );
}
