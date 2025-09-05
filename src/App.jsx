import React, { useState, useEffect, useCallback } from 'react';
import { Clock, StickyNote, Bell, Settings, Moon, Sun } from 'lucide-react';
import Timer from './components/Timer';
import SessionManager from './components/SessionManager';
import TabContent from './components/TabContent';
import { useLocalStorage, useAnalytics } from './hooks/useLocalStorage';
import { colors, getThemeClasses } from './constants/colors';

const PomodoroApp = () => {
  const [sessions, setSessions] = useLocalStorage('pomodoro_sessions', [
    { id: 'work', name: 'Work', duration: 25 * 60, color: colors.primary, isDefault: false },
    { id: 'shortBreak', name: 'Short Break', duration: 5 * 60, color: colors.success, isDefault: false },
    { id: 'longBreak', name: 'Long Break', duration: 15 * 60, color: colors.warning, isDefault: false },
  ]);

  const [currentSessionId, setCurrentSessionId] = useLocalStorage('pomodoro_current_session', 'work');
  const [reminders, setReminders] = useLocalStorage('pomodoro_reminders', []);
  const [notes, setNotes] = useLocalStorage('pomodoro_notes', '');
  const [settings, setSettings] = useLocalStorage('pomodoro_settings', {
    darkMode: false,
    soundEnabled: true,
    notificationsEnabled: true
  });

  const [analytics, addSession] = useAnalytics();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
    const [activeTab, setActiveTab] = useState('timer');
  const [quickNote, setQuickNote] = useState('');
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  useEffect(() => {
    if (currentSession && !isActive) {
      setTimeLeft(currentSession.duration);
    }
  }, [currentSession, isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      addSession(currentSession.duration);
      
      if ('Notification' in window && Notification.permission === 'granted' && settings.notificationsEnabled) {
        new Notification('Session Complete!', {
          body: `${currentSession.name} session finished`,
          icon: '/favicon.ico'
        });
      }

      setTimeLeft(currentSession.duration);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentSession, addSession, settings.notificationsEnabled]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        setIsActive(!isActive);
      }
      if (e.code === 'Escape') {
        setIsActive(false);
        setTimeLeft(currentSession.duration);
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.code === 'KeyN') {
          e.preventDefault();
        }
        if (e.code === 'KeyD') {
          e.preventDefault();
          setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, currentSession, setSettings]);

  const progress = ((currentSession.duration - timeLeft) / currentSession.duration) * 100;

  const startPause = useCallback(() => setIsActive(!isActive), [isActive]);
  
  const reset = useCallback(() => {
    setIsActive(false);
    setTimeLeft(currentSession.duration);
  }, [currentSession.duration]);

  const skip = useCallback(() => {
    setIsActive(false);
    setTimeLeft(currentSession.duration);
  }, [currentSession.duration]);

  const switchSession = useCallback((sessionId) => {
    setCurrentSessionId(sessionId);
    const session = sessions.find(s => s.id === sessionId);
    setTimeLeft(session.duration);
    setIsActive(false);
  }, [sessions, setCurrentSessionId]);

  const createSession = useCallback((name, duration) => {
    const newSession = {
      id: Date.now().toString(),
      name,
      duration: duration * 60,
      color: colors.primary,
      isDefault: false
    };
    setSessions(prev => [...prev, newSession]);
  }, [setSessions]);

  const editSession = useCallback((sessionId, name, duration) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId
        ? { ...session, name, duration: duration * 60 }
        : session
    ));
    
    if (currentSessionId === sessionId) {
      setTimeLeft(duration * 60);
      setIsActive(false);
    }
  }, [setSessions, currentSessionId]);

  const deleteSession = useCallback((sessionId) => {
    if (sessions.length === 1) return; // Prevent deleting the last session
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSession = sessions.find(s => s.id !== sessionId);
      setCurrentSessionId(remainingSession.id);
      setTimeLeft(remainingSession.duration);
      setIsActive(false);
    }
  }, [sessions, setSessions, currentSessionId, setCurrentSessionId]);

  const addQuickNote = useCallback(() => {
    if (!quickNote.trim()) return;
    
    const timestamp = new Date().toLocaleString();
    const sessionNote = `[${timestamp} - ${currentSession.name}] ${quickNote}`;
    setNotes(prev => prev ? `${prev}\n\n${sessionNote}` : sessionNote);
    setQuickNote('');
  }, [quickNote, currentSession.name, setNotes]);

  const addReminder = useCallback((text, dueDate, dueTime) => {
    const reminder = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate,
      dueTime
    };
    setReminders(prev => [...prev, reminder]);
  }, [setReminders]);

  const toggleReminder = useCallback((id) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    ));
  }, [setReminders]);

  const deleteReminder = useCallback((id) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  }, [setReminders]);

  const theme = getThemeClasses(settings.darkMode);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-200`}>
      {/* Header */}
      <div className={`${theme.card} border-b`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6" style={{ color: colors.primary }} />
                <h1 className="text-xl font-semibold">Focus</h1>
              </div>

              {/* Session Dropdown */}
              <SessionManager
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSessionSwitch={switchSession}
                onSessionCreate={createSession}
                onSessionEdit={editSession}
                onSessionDelete={deleteSession}
                darkMode={settings.darkMode}
              />

              {/* Navigation */}
              <nav className="flex space-x-1">
                {[
                  { id: 'timer', label: 'Timer', icon: Clock },
                  { id: 'notes', label: 'Notes', icon: StickyNote },
                  { id: 'reminders', label: 'Reminders', icon: Bell },
                  { id: 'analytics', label: 'Analytics', icon: Settings }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-blue-500 text-white' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Sessions: {analytics.totalSessions}
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {settings.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <TabContent
          activeTab={activeTab}
          timeLeft={timeLeft}
          isActive={isActive}
          currentSession={currentSession}
          progress={progress}
          onStartPause={startPause}
          onReset={reset}
          onSkip={skip}
          notes={notes}
          onNotesChange={setNotes}
          quickNote={quickNote}
          onQuickNoteChange={setQuickNote}
          onAddQuickNote={addQuickNote}
          reminders={reminders}
          onAddReminder={addReminder}
          onToggleReminder={toggleReminder}
          onDeleteReminder={deleteReminder}
          analytics={analytics}
          darkMode={settings.darkMode}
        />
      </div>
    </div>
  );
};

export default PomodoroApp;
