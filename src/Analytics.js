// src/Analytics.js
import React from 'react';

export default function Analytics({ analytics }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>
      <div style={{padding:12,borderRadius:8,background:'#eff6ff'}}>
        <div style={{fontSize:22,fontWeight:700}}>{analytics.totalSessions}</div>
        <div style={{fontSize:12,color:'#6b7280'}}>Total Sessions</div>
      </div>

      <div style={{padding:12,borderRadius:8,background:'#ecfdf5'}}>
        <div style={{fontSize:22,fontWeight:700}}>{Math.round(analytics.totalFocusTime/3600)}h</div>
        <div style={{fontSize:12,color:'#6b7280'}}>Total Focus Time</div>
      </div>

      <div style={{padding:12,borderRadius:8,background:'#fffbeb'}}>
        <div style={{fontSize:22,fontWeight:700}}>{analytics.todaySessions}</div>
        <div style={{fontSize:12,color:'#6b7280'}}>Today's Sessions</div>
      </div>

      <div style={{padding:12,borderRadius:8,background:'#f5f3ff'}}>
        <div style={{fontSize:22,fontWeight:700}}>
          {analytics.totalSessions > 0 ? Math.round(analytics.totalFocusTime / analytics.totalSessions / 60) : 0}m
        </div>
        <div style={{fontSize:12,color:'#6b7280'}}>Avg Session</div>
      </div>
    </div>
  );
}
