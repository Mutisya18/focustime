// src/Notes.js
import React, { useEffect, useState } from 'react';

/*
  Notes component reads/writes the same storage key as App.
  It listens for custom 'notes-updated' events dispatched by Timer QuickNote
  so edits made in one component will update others without a page reload.
*/

const KEY = 'focus_notes_v1';

export default function Notes({ notes: incomingNotes, setNotes: setNotesFromApp }) {
  const [text, setText] = useState(() => {
    try { return localStorage.getItem(KEY) || ''; } catch (e) { return incomingNotes || ''; }
  });

  useEffect(() => {
    // when App has new notes prop (on load), sync
    if (incomingNotes !== undefined && incomingNotes !== null) {
      setText(incomingNotes);
    }
  }, [incomingNotes]);

  useEffect(() => {
    const handler = (e) => { setText(e.detail); setNotesFromApp && setNotesFromApp(e.detail); };
    window.addEventListener('notes-updated', handler);
    return () => window.removeEventListener('notes-updated', handler);
  }, [setNotesFromApp]);

  const save = () => {
    try {
      localStorage.setItem(KEY, text);
      setNotesFromApp && setNotesFromApp(text);
      window.dispatchEvent(new CustomEvent('notes-updated', { detail: text }));
    } catch (err) {
      console.warn('Failed to save notes', err);
    }
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <h2 style={{margin:0}}>Notes</h2>
      <textarea rows={14} value={text} onChange={(e)=>setText(e.target.value)} />
      <div style={{display:'flex',gap:8}}>
        <button onClick={save}>Save</button>
        <button onClick={()=>{ setText(''); localStorage.removeItem(KEY); setNotesFromApp && setNotesFromApp(''); }}>Clear</button>
      </div>
    </div>
  );
}
