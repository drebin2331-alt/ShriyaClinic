import React from 'react';

/** Two arches around the open centre, echoing the clinic's dental chart. */
export function ClinicMark() {
  return <svg className="clinic-mark" viewBox="0 0 40 40" aria-hidden="true">
    <rect width="40" height="40" rx="12" fill="#174e48" />
    <path d="M8 19c0-13 24-13 24 0M12 20c0-8 16-8 16 0M9 23c3 8 7 10 11 10s8-2 11-10" stroke="#ceeddc" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
  </svg>;
}
