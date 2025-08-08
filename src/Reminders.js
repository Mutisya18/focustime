// src/Reminders.js
import React, { useState } from 'react';

export default function Reminders({ reminders, addReminder, updateReminder, removeReminder }) {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const create = () => {
    if (!text.trim()) return;
    const r = {
      id: Date.now(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      dueDate: date || null,
      dueTime: time || null,
      completed: false
    };
    addReminder(r);
    setText(''); setDate(''); setTime('');
  };

  const toggle = (id) => updateReminder(id, r => ({ completed: !r.completed }));
  const del = (id) => removeReminder(id);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <h2 style={{margin:0}}>Reminders</h2>

      <div style={{display:'flex',gap:8}}>
        <input placeholder="What to remind?" value={text} onChange={e=>setText(e.target.value)} />
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input type="time" value={time} onChange={e=>setTime(e.target.value)} />
        <button onClick={create}>Add</button>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {(!reminders || reminders.length===0) ? <div style={{color:'#6b7280'}}>No reminders yet.</div> :
          reminders.slice().sort((a,b)=>a.completed - b.completed).map(r=>(
            <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:8,borderRadius:8,background:r.completed?'#f3f4f6':'transparent'}}>
              <div>
                <div style={{textDecoration:r.completed?'line-through':'none'}}>{r.text}</div>
                {(r.dueDate || r.dueTime) && <div style={{fontSize:12,color:'#6b7280'}}>{r.dueDate || ''} {r.dueTime || ''}</div>}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>updateReminder(r.id, {...r, completed: !r.completed})}>{r.completed ? 'Undo' : 'Done'}</button>
                <button onClick={()=>del(r.id)}>Delete</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
