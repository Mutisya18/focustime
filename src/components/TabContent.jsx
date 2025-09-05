import React, { useState } from 'react';
import { StickyNote, Bell, Settings, Plus, Check, Trash2, X } from 'lucide-react';
import { getThemeClasses } from '../constants/colors';
import Timer from './Timer';

const TabContent = ({ 
  activeTab,
  timeLeft,
  isActive,
  currentSession,
  progress,
  onStartPause,
  onReset,
  onSkip,
  notes,
  onNotesChange,
  quickNote,
  onQuickNoteChange,
  onAddQuickNote,
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  analytics,
  darkMode 
}) => {
  const theme = getThemeClasses(darkMode);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const handleAddReminder = () => {
    if (!newReminderText.trim()) return;
    
    onAddReminder(newReminderText, newReminderDate, newReminderTime);
    setNewReminderText('');
    setNewReminderDate('');
    setNewReminderTime('');
  };

  if (activeTab === 'timer') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <div className={`${theme.card} border rounded-xl p-8`}>
            <Timer
              timeLeft={timeLeft}
              isActive={isActive}
              currentSession={currentSession}
              progress={progress}
              onStartPause={onStartPause}
              onReset={onReset}
              onSkip={onSkip}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Note */}
          <div className={`${theme.card} border rounded-xl p-6`}>
            <h3 className="text-lg font-semibold mb-4">Quick Note</h3>
            <div className="space-y-4">
              <textarea
                value={quickNote}
                onChange={(e) => onQuickNoteChange(e.target.value)}
                placeholder="Jot down a quick thought..."
                className={`w-full p-3 rounded-lg border resize-none ${theme.input}`}
                rows={4}
              />
              <button
                onClick={onAddQuickNote}
                disabled={!quickNote.trim()}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add to Notes
              </button>
            </div>
          </div>

          {/* Session Stats */}
          <div className={`${theme.card} border rounded-xl p-6`}>
            <h3 className="text-lg font-semibold mb-4">Today's Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Sessions</span>
                <span className="font-medium">{analytics.todaySessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Focus Time</span>
                <span className="font-medium">{Math.round(analytics.todayFocusTime / 60)}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'notes') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Write your notes here..."
            className={`w-full p-4 rounded-lg border resize-none ${theme.input}`}
            rows={20}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'reminders') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4">Reminders</h3>
          
          {/* Add Reminder Form */}
          <div className="mb-6 space-y-4">
            <input
              type="text"
              value={newReminderText}
              onChange={(e) => setNewReminderText(e.target.value)}
              placeholder="What do you need to remember?"
              className={`w-full p-3 rounded-lg border ${theme.input}`}
            />
            <div className="flex space-x-4">
              <input
                type="date"
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
                className={`flex-1 p-3 rounded-lg border ${theme.input}`}
              />
              <input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className={`flex-1 p-3 rounded-lg border ${theme.input}`}
              />
              <button
                onClick={handleAddReminder}
                disabled={!newReminderText.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Reminders List */}
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  reminder.completed ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onToggleReminder(reminder.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                      reminder.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {reminder.completed && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span className={reminder.completed ? 'line-through text-gray-500' : ''}>
                    {reminder.text}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {reminder.dueDate} {reminder.dueTime}
                  </span>
                  <button
                    onClick={() => onDeleteReminder(reminder.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'analytics') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Stats */}
          <div className={`${theme.card} border rounded-xl p-6`}>
            <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Sessions Completed</span>
                  <span>{analytics.todaySessions}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min((analytics.todaySessions / 8) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Focus Time</span>
                  <span>{Math.round(analytics.todayFocusTime / 60)}m</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${Math.min((analytics.todayFocusTime / (4 * 60 * 60)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* All-time Stats */}
          <div className={`${theme.card} border rounded-xl p-6`}>
            <h3 className="text-lg font-semibold mb-4">All-time Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Sessions</span>
                <span className="text-2xl font-light">{analytics.totalSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Focus Time</span>
                <span className="text-2xl font-light">
                  {Math.round(analytics.totalFocusTime / 3600)}h {Math.round((analytics.totalFocusTime % 3600) / 60)}m
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TabContent;
