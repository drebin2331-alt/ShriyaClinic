import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from '../../types';

function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
}

export function ScheduleBook({ mode, appointments, onSelect }: {
  mode: 'calendar' | 'weekly';
  appointments: Appointment[];
  onSelect: (appointment: Appointment) => void;
}) {
  const [selected, setSelected] = useState(() => new Date());
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const weekStart = selected.getDate() - (selected.getDay() + 6) % 7;
  const weekly = mode === 'weekly';
  const days = Array.from({length: weekly ? 7 : new Date(year, month + 1, 0).getDate()}, (_, i) =>
    new Date(year, month, weekly ? weekStart + i : 1 + i));
  const records = new Map<string, Appointment[]>();
  for (const appointment of appointments) {
    const group = records.get(appointment.date) || [];
    group.push(appointment);
    records.set(appointment.date, group);
  }
  const move = (step: number) => setSelected(weekly ? new Date(year, month, selected.getDate() + step * 7) : new Date(year, month + step, 1));
  const showRows = (date: Date) => {
    const group = records.get(dateKey(date)) || [];
    return group.length ? <ul className="schedule-rows">{group.map(appointment => <li key={appointment.id}>
      <button onClick={() => onSelect(appointment)}><time>{appointment.timeSlot}</time><span>{appointment.patientName}<small>{appointment.doctorName}</small></span><ChevronRight size={16}/></button>
    </li>)}</ul> : <p className="schedule-empty">No appointments.</p>;
  };
  return <section className="schedule-book">
    <header><h2>{weekly ? 'Week of ' + days[0].toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : selected.toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</h2>
      <div><button aria-label="Previous period" onClick={() => move(-1)}><ChevronLeft size={18}/></button><button onClick={() => setSelected(new Date())}>Today</button><button aria-label="Next period" onClick={() => move(1)}><ChevronRight size={18}/></button></div>
    </header>
    {weekly ? <div className="schedule-week">{days.map(date=><section key={dateKey(date)}><h3>{date.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</h3>{showRows(date)}</section>)}</div> : <>
      <div className="schedule-month">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=><span key={day}>{day}</span>)}
        {days.map((date,i)=>{const key = dateKey(date); const count = records.get(key)?.length || 0;
          return <button key={key} style={i===0 ? {gridColumnStart:date.getDay()+1} : undefined} aria-pressed={key===dateKey(selected)} aria-label={key + ', ' + count + ' appointments'} onClick={()=>setSelected(date)}>
            {date.getDate()}{count>0 && <small>{count}</small>}
          </button>;})}
      </div>
      <h3>{selected.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</h3>{showRows(selected)}
    </>}
  </section>;
}
