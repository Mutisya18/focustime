// src/Timer.js
import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus, X, Check, ChevronDown } from 'lucide-react';

/*
  Timer focuses on:
  - local countdown
  - start/pause/reset
  - session switching and editing (calls back to App via provided props)
  - when a session completes, the timer informs analytics via updateAnalytics callback
*/

export default function Timer({
  sessions,
  currentSessionId,
  setCurrentSessionId,
  addSession,
  updateSession,
  removeSession,
  analytics,
  updateAnalytics
}) {
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const [timeLeft, setTimeLeft] = useState(currentSession ? currentSession.duration : 1500);
  const [isActive, setIsActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Editing UI for sessions
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMinutes, setNewMinutes] = useState(25);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMinutes, setEditMinutes] = useState(25);

  const intervalRef = useRef(null);

  // Keep timeLeft in sync when session changes
  useEffect(() => {
    if (currentSession) {
      setTimeLeft(currentSession.duration);
      setIsActive(false);
    }
  }, [currentSessionId, currentSession?.duration]);

  // Timer tick
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Update analytics: increment sessions and focus time
      updateAnalytics(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalFocusTime: prev.totalFocusTime + (currentSession?.duration || 0),
        todaySessions: prev.todaySessions + 1,
        todayFocusTime: prev.todayFocusTime + (currentSession?.duration || 0)
      }));

      // send notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Session Complete!', { body: `${currentSession?.name} finished` });
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft, updateAnalytics, currentSession]);

  // keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsActive(a => !a);
      }
      if (e.code === 'Escape') {
        setIsActive(false);
        setTimeLeft(currentSession?.duration || 0);
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyN') {
        setShowNewForm(true);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [currentSession]);

  // Request notification permission early
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(()=>{});
    }
  }, []);

  const formatTime = (s) => {
    const hrs = Math.floor(s/3600);
    const mins = Math.floor((s%3600)/60);
    const secs = s%60;
    if (hrs>0) return `${hrs}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  };

  // session controls
  const createSession = () => {
    if (!newName.trim() || !newMinutes) return;
    const id = Date.now().toString();
    addSession({ id, name: newName.trim(), duration: newMinutes*60, color: '#2563eb' });
    setNewName('');
    setNewMinutes(25);
    setShowNewForm(false);
  };

  const startPause = () => setIsActive(a => !a);
  const reset = () => { setIsActive(false); setTimeLeft(currentSession?.duration || 0); };
  const skip = () => { setIsActive(false); setTimeLeft(currentSession?.duration || 0); };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditMinutes(Math.round(s.duration/60));
  };

  const saveEdit = () => {
    if (!editName.trim() || !editMinutes) return;
    updateSession(editingId, { name: editName.trim(), duration: editMinutes*60 });
    if (editingId === currentSessionId) {
      setTimeLeft(editMinutes*60);
      setIsActive(false);
    }
    setEditingId(null);
  };

  return (
    <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
      <div style={{flex:'1 1 600px',minWidth:320}}>
        <div style={{padding:18,borderRadius:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:10,height:10,borderRadius:6,background:currentSession?.color}}/>
              <strong>{currentSession?.name}</strong>
            </div>

            <div style={{display:'flex',gap:8}}>
              <button onClick={() => setShowDropdown(d => !d)} aria-expanded={showDropdown}>Sessions ▾</button>
            </div>
          </div>

          {showDropdown && (
            <div style={{border:'1px solid #e5e7eb',padding:12,borderRadius:8,marginBottom:10}}>
              {sessions.map(s => (
                <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 4px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <button onClick={() => { setCurrentSessionId(s.id); setShowDropdown(false); }}>{s.name} ({Math.round(s.duration/60)}m)</button>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={() => startEdit(s)} title="edit">✎</button>
                    <button onClick={() => removeSession(s.id)} disabled={sessions.length<=1} title="delete">🗑</button>
                  </div>
                </div>
              ))}

              <div style={{borderTop:'1px solid #e5e7eb',marginTop:8,paddingTop:8}}>
                {showNewForm ? (
                  <>
                    <input placeholder="name" value={newName} onChange={e=>setNewName(e.target.value)} />
                    <input type="number" min="1" max="1440" value={newMinutes} onChange={e=>setNewMinutes(Number(e.target.value))} />
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={createSession}>Add</button>
                      <button onClick={()=>setShowNewForm(false)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <button onClick={()=>setShowNewForm(true)}>+ Add session</button>
                )}
              </div>
            </div>
          )}

          {editingId && (
            <div style={{marginBottom:12,padding:8,border:'1px dashed #9ca3af',borderRadius:8}}>
              <input value={editName} onChange={e=>setEditName(e.target.value)} />
              <input type="number" min="1" max="1440" value={editMinutes} onChange={e=>setEditMinutes(Number(e.target.value))} />
              <div style={{display:'flex',gap:6}}>
                <button onClick={saveEdit}>Save</button>
                <button onClick={()=>setEditingId(null)}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:48,fontWeight:300}}>{formatTime(timeLeft)}</div>
            <div style={{color:'#6b7280',marginTop:6}}>{isActive ? 'Running' : 'Paused'}</div>

            <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:18}}>
              <button onClick={startPause} style={{padding:12,borderRadius:999,background:currentSession?.color,color:'#fff',border:'none'}}>
                {isActive ? <Pause /> : <Play />}
              </button>
              <button onClick={reset} title="reset"><RotateCcw /></button>
              <button onClick={skip} title="skip"><SkipForward /></button>
            </div>

            <div style={{marginTop:10,fontSize:12,color:'#6b7280'}}>Space to play/pause • Esc to reset • Ctrl/Cmd+N add session</div>
          </div>
        </div>
      </div>

      <div style={{width:320,minWidth:260}}>
        <div style={{padding:12,borderRadius:10}}>
          <h4 style={{margin:'0 0 8px 0'}}>Quick Note</h4>
          {/* a small quick note input that writes to localStorage via custom event:
              keep simple — Notes component owns main notes; here we dispatch a custom event */}
          <QuickNote />
        </div>

        <div style={{padding:12,marginTop:12,borderRadius:10}}>
          <h4 style={{margin:'0 0 8px 0'}}>Stats</h4>
          <div>Sessions: {analytics.todaySessions}</div>
          <div>Focus time: {Math.round(analytics.todayFocusTime/60)}m</div>
        </div>
      </div>
    </div>
  );
}

/* QuickNote is intentionally small and writes to same localStorage key used by Notes component so data stays in-sync. */
function QuickNote(){
  const [text,setText]=React.useState('');
  const submit=()=>{
    if(!text.trim())return;
    try{
      const key='focus_notes_v1';
      const existing=localStorage.getItem(key) || '';
      const ts = new Date().toLocaleString();
      const newNote = existing ? existing + '\n\n' + `[${ts}] ${text}` : `[${ts}] ${text}`;
      localStorage.setItem(key, newNote);
      // also dispatch a storage event-like custom event so Notes listens if needed
      window.dispatchEvent(new CustomEvent('notes-updated', { detail: newNote }));
      setText('');
    }catch(e){console.warn(e)}
  };
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      <textarea rows="4" value={text} onChange={e=>setText(e.target.value)} placeholder="Jot a quick thought..."/>
      <button onClick={submit}>Add to notes</button>
    </div>
  );
}
