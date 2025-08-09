import React, { useState } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { getThemeClasses } from '../constants/colors';

const SessionManager = ({ 
  sessions, 
  currentSessionId, 
  onSessionSwitch, 
  onSessionCreate, 
  onSessionEdit, 
  onSessionDelete,
  darkMode 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  
  // New session form state
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState(25);
  
  // Edit session form state
  const [editName, setEditName] = useState('');
  const [editDuration, setEditDuration] = useState(25);

  const theme = getThemeClasses(darkMode);
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const handleCreateSession = () => {
    if (!newName.trim() || !newDuration) return;
    
    onSessionCreate(newName.trim(), newDuration);
    setNewName('');
    setNewDuration(25);
    setShowNewForm(false);
  };

  const handleStartEdit = (session) => {
    setEditingSession(session.id);
    setEditName(session.name);
    setEditDuration(Math.round(session.duration / 60));
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editDuration) return;
    
    onSessionEdit(editingSession, editName.trim(), editDuration);
    setEditingSession(null);
    setEditName('');
    setEditDuration(25);
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditName('');
    setEditDuration(25);
  };

  const handleSessionSwitch = (sessionId) => {
    onSessionSwitch(sessionId);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${theme.input} hover:border-gray-400 transition-colors`}
      >
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: currentSession.color }}
        />
        <span>{currentSession.name}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className={`absolute top-full left-0 mt-2 w-80 ${theme.card} border rounded-lg shadow-lg z-50`}>
            <div className="p-2">
              {sessions.map((session) => (
                <div key={session.id} className="group">
                  {editingSession === session.id ? (
                    <div className="p-3 space-y-3 bg-gray-50 dark:bg-gray-700 rounded-lg m-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${theme.input}`}
                        placeholder="Session name"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={editDuration}
                          onChange={(e) => setEditDuration(parseInt(e.target.value))}
                          className={`flex-1 px-3 py-2 rounded-md border ${theme.input}`}
                          placeholder="Minutes"
                          min="1"
                          max="1440"
                        />
                        <button
                          onClick={handleSaveEdit}
                          disabled={!editName.trim() || !editDuration}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleSessionSwitch(session.id)}
                        className={`flex-1 flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          session.id === currentSessionId ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: session.color }}
                        />
                        <span className="flex-1 text-left">{session.name}</span>
                        <span className="text-sm text-gray-500">{Math.round(session.duration / 60)}m</span>
                      </button>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(session)}
                          className="p-1 hover:text-blue-500 transition-colors"
                          title="Edit session"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onSessionDelete(session.id)}
                          disabled={sessions.length === 1}
                          className="p-1 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={sessions.length === 1 ? "Cannot delete the last session" : "Delete session"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              
              {showNewForm ? (
                <div className="p-3 space-y-3">
                  <input
                    type="text"
                    placeholder="Session name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border ${theme.input}`}
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Minutes"
                      min="1"
                      max="1440"
                      value={newDuration}
                      onChange={(e) => setNewDuration(parseInt(e.target.value))}
                      className={`flex-1 px-3 py-2 rounded-md border ${theme.input}`}
                    />
                    <button
                      onClick={handleCreateSession}
                      disabled={!newName.trim() || !newDuration}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="w-full text-center text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewForm(true)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Session</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionManager;