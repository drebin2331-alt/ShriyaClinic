import React from 'react';

export interface ClinicPrescriptionData {
  id?: string;
  date: string;
  patientName: string;
  patientOpNumber?: string;
  patientAge?: number | string;
  patientGender?: string;
  patientPhone?: string;
  doctorName?: string;
  doctorRegNo?: string;
  doctorDegree?: string;
  diagnosis?: string;
  medicalHistoryConditions?: string[];
  medicalHistoryNotes?: string;
  allergies?: string[];
  currentMedications?: string[];
  items: Array<{
    id?: string;
    medicine: string;
    dosage?: string;
    route?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
  doctorNotes?: string;
  followUpDate?: string;
}

interface ClinicPrescriptionSheetProps {
  data: ClinicPrescriptionData;
  id?: string;
}

/**
 * High-fidelity print & PDF export handler for Shriya Multispeciality Dental Clinic
 * Ensures that both physical printing and "Save as PDF" retain the exact same pad layout,
 * colors, doctor box, two-column vertical divider, and table styling.
 */
export const printPrescriptionElement = (
  elementId: string = 'shriya-prescription-sheet',
  patientName?: string,
  opNumber?: string
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Create an isolated iframe for clean, background-free printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Collect all styles from the host document
  const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  // Format clean printable title for automatic PDF filename (e.g. "Prescription_Customer_1_OP-2026-00101")
  const safeName = (patientName || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeOp = opNumber ? `_${opNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
  const pageTitle = `Prescription_${safeName}${safeOp}_Shriya_Dental_Clinic`;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${pageTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap" rel="stylesheet">
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
            font-size: 11.5px !important;
            line-height: 1.35 !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          /* Full fidelity pad layout container */
          .shriya-pad-root {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 6px 10px !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box !important;
            min-height: calc(100vh - 12mm) !important;
            justify-content: space-between !important;
          }

          /* Explicit display table & flex rules */
          .shriya-header-box {
            text-align: center !important;
            border-bottom: 2.5px solid #1e3a8a !important;
            padding-bottom: 6px !important;
            margin-bottom: 6px !important;
          }
          .shriya-clinic-name {
            font-size: 24px !important;
            font-weight: 900 !important;
            color: #1e3a8a !important;
            text-transform: uppercase !important;
            letter-spacing: 0.04em !important;
            margin: 0 !important;
            line-height: 1.2 !important;
          }
          .shriya-clinic-address {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            margin: 3px 0 2px 0 !important;
          }
          .shriya-clinic-mob {
            font-size: 12px !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            margin: 0 0 6px 0 !important;
          }
          .shriya-sub-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            margin-top: 6px !important;
            font-size: 11px !important;
          }
          .shriya-doc-reg-box {
            border: 1.5px solid #1e3a8a !important;
            padding: 3px 12px !important;
            text-align: center !important;
            background-color: #eff6ff !important;
            border-radius: 3px !important;
          }
          .shriya-patient-bar {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 6px 4px !important;
            border-bottom: 1.5px solid #1e3a8a !important;
            font-size: 11.5px !important;
            font-weight: 600 !important;
            margin-bottom: 6px !important;
          }
          .shriya-two-col-body {
            display: flex !important;
            flex-direction: row !important;
            flex: 1 !important;
            min-height: 650px !important;
          }
          .shriya-left-column {
            width: 25% !important;
            min-width: 160px !important;
            max-width: 190px !important;
            padding-right: 12px !important;
            border-right: 2px solid #1e3a8a !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .shriya-right-column {
            width: 75% !important;
            flex: 1 !important;
            padding-left: 14px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .shriya-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 11px !important;
          }
          .shriya-table th {
            border-bottom: 2px solid #1e3a8a !important;
            background-color: #eff6ff !important;
            color: #172554 !important;
            padding: 6px 6px !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            text-align: left !important;
          }
          .shriya-table td {
            border-bottom: 1px solid #e2e8f0 !important;
            padding: 7px 6px !important;
            vertical-align: top !important;
          }
          .shriya-footer-box {
            border-top: 1.5px solid #1e3a8a !important;
            padding-top: 6px !important;
            margin-top: 10px !important;
            text-align: center !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            color: #334155 !important;
          }

          /* Prevent undesirable page breaks */
          table, tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Give styles and fonts brief calculation window then print
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2500);
  }, 350);
};

export const ClinicPrescriptionSheet: React.FC<ClinicPrescriptionSheetProps> = ({
  data,
  id = 'shriya-prescription-sheet'
}) => {
  const conditions = data.medicalHistoryConditions && data.medicalHistoryConditions.length > 0
    ? data.medicalHistoryConditions
    : [];

  const allergies = data.allergies && data.allergies.length > 0
    ? data.allergies
    : [];

  const currentMeds = data.currentMedications && data.currentMedications.length > 0
    ? data.currentMedications
    : [];

  const doctorDisplayName = data.doctorName || 'Dr. EBIN BRITTO. M.';
  const doctorDegree = data.doctorDegree || 'BDS';
  const doctorReg = data.doctorRegNo || '26719/KDC';

  return (
    <div
      id={id}
      className="shriya-pad-root bg-white text-slate-900 mx-auto w-full max-w-[800px] p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0"
      style={{
        width: '100%',
        maxWidth: '800px',
        minHeight: '980px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 24px'
      }}
    >
      {/* ========================================================= */}
      {/* EXACT CLINIC LETTERHEAD (Matching Shriya Dental Clinic)   */}
      {/* ========================================================= */}
      <div 
        className="shriya-header-box"
        style={{
          textAlign: 'center',
          paddingBottom: '8px',
          borderBottom: '2.5px solid #1e3a8a',
          marginBottom: '6px'
        }}
      >
        <h1 
          className="shriya-clinic-name"
          style={{
            fontSize: '25px',
            fontWeight: 900,
            color: '#1e3a8a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: 0,
            lineHeight: 1.2
          }}
        >
          SHRIYA MULTISPECIALITY DENTAL CLINIC
        </h1>
        <p 
          className="shriya-clinic-address"
          style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b', margin: '4px 0 2px 0' }}
        >
          Pollachi Road, Kozhinjapara, Palakkad.
        </p>
        <p 
          className="shriya-clinic-mob"
          style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}
        >
          Mob : 9400320890, 7904221656
        </p>

        {/* Sub-header: Working hours (Left) & Doctor Reg Box (Right) */}
        <div 
          className="shriya-sub-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '6px',
            fontSize: '11.5px'
          }}
        >
          <div style={{ textAlign: 'left', fontWeight: 600, color: '#334155', lineHeight: 1.35 }}>
            <p style={{ margin: 0 }}>Working Hours : 9.30 am to 6.30 pm</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Sunday's by appointment</p>
          </div>

          {/* Outlined Doctor Box */}
          <div 
            className="shriya-doc-reg-box"
            style={{
              border: '1.5px solid #1e3a8a',
              padding: '4px 14px',
              textAlign: 'center',
              backgroundColor: '#eff6ff',
              borderRadius: '3px'
            }}
          >
            <p style={{ fontWeight: 800, color: '#172554', fontSize: '12.5px', textTransform: 'uppercase', margin: 0 }}>
              {doctorDisplayName.toUpperCase()} {doctorDegree}
            </p>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', marginTop: '2px', margin: 0 }}>
              Reg. No. : {doctorReg}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PATIENT DEMOGRAPHICS BAR                                  */}
      {/* ========================================================= */}
      <div 
        className="shriya-patient-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '7px 4px',
          borderBottom: '1.5px solid #1e3a8a',
          fontSize: '12px',
          fontWeight: 600,
          color: '#1e293b',
          marginBottom: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#475569' }}>Name :</span>
          <span style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>{data.patientName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#475569' }}>Age/Sex :</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            {data.patientAge ? `${data.patientAge}y` : '-'} / {data.patientGender || '-'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#475569' }}>Date :</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{data.date}</span>
          {data.patientOpNumber && (
            <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#1e3a8a', fontWeight: 800, marginLeft: '4px' }}>
              ({data.patientOpNumber})
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN TWO-COLUMN BODY (Divided by Vertical Line)           */}
      {/* ========================================================= */}
      <div 
        className="shriya-two-col-body"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          minHeight: '680px',
          marginTop: '4px'
        }}
      >
        {/* LEFT COLUMN: Medical History & Drug History (25% width) */}
        <div 
          className="shriya-left-column"
          style={{
            width: '25%',
            minWidth: '160px',
            maxWidth: '190px',
            paddingRight: '12px',
            paddingTop: '6px',
            borderRight: '2px solid #1e3a8a',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div>
            {/* Medical History */}
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '11px', color: '#172554', letterSpacing: '0.04em', margin: '0 0 6px 0' }}>
                Medical History
              </h3>
              {conditions.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', color: '#1e293b', fontWeight: 600, lineHeight: 1.4 }}>
                  {conditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>None reported / Nil</p>
              )}
              {data.medicalHistoryNotes && (
                <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: '#475569', lineHeight: 1.3 }}>
                  {data.medicalHistoryNotes}
                </p>
              )}
            </div>

            {/* Drug History */}
            <div>
              <h3 style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '11px', color: '#172554', letterSpacing: '0.04em', margin: '0 0 6px 0' }}>
                Drug History
              </h3>
              {allergies.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', display: 'block' }}>Allergies:</span>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#9f1239', lineHeight: 1.3 }}>
                    {allergies.join(', ')}
                  </p>
                </div>
              )}
              {currentMeds.length > 0 ? (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block' }}>Current Rx:</span>
                  <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '10.5px', color: '#1e293b', fontWeight: 500, listStyle: 'disc' }}>
                    {currentMeds.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                !allergies.length && <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>Nil / NKDA</p>
              )}
            </div>
          </div>

          <div style={{ paddingTop: '12px', fontSize: '9px', color: '#94a3b8' }}>
            {data.id && <p style={{ margin: 0, fontFamily: 'monospace' }}>Ref: {data.id}</p>}
          </div>
        </div>

        {/* RIGHT COLUMN: Rx Symbol & Prescribed Medications (75% width) */}
        <div 
          className="shriya-right-column"
          style={{
            width: '75%',
            flex: 1,
            paddingLeft: '16px',
            paddingTop: '4px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div>
            {/* Diagnosis / Indication */}
            {data.diagnosis && (
              <div style={{ marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Diagnosis / Indication:</span>
                <span style={{ fontWeight: 800, color: '#0f172a', marginLeft: '6px', fontSize: '12.5px' }}>{data.diagnosis}</span>
              </div>
            )}

            {/* Classic Rx Sign */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px', fontFamily: 'Georgia, serif', fontWeight: 900, color: '#1e3a8a', lineHeight: 1 }}>
                ℞
              </span>
              <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>
                Prescription (Medical Order)
              </span>
            </div>

            {/* Medicines List Table */}
            <table className="shriya-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e3a8a', backgroundColor: '#eff6ff' }}>
                  <th style={{ padding: '6px 6px', width: '28px', fontSize: '10px', fontWeight: 800, color: '#172554', textTransform: 'uppercase', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '6px 6px', fontSize: '10px', fontWeight: 800, color: '#172554', textTransform: 'uppercase', textAlign: 'left' }}>Medicine Name & Strength</th>
                  <th style={{ padding: '6px 6px', fontSize: '10px', fontWeight: 800, color: '#172554', textTransform: 'uppercase', textAlign: 'left' }}>Dosage</th>
                  <th style={{ padding: '6px 6px', fontSize: '10px', fontWeight: 800, color: '#172554', textTransform: 'uppercase', textAlign: 'left' }}>Frequency</th>
                  <th style={{ padding: '6px 6px', fontSize: '10px', fontWeight: 800, color: '#172554', textTransform: 'uppercase', textAlign: 'left' }}>Duration</th>
                  <th style={{ padding: '6px 6px', fontSize: '10px', fontWeight: 800, color: '#172554', textTransform: 'uppercase', textAlign: 'left' }}>Timing / Instructions</th>
                </tr>
              </thead>
              <tbody>
                {data.items && data.items.length > 0 ? (
                  data.items.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '7px 6px', fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '7px 6px' }}>
                        <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px', margin: 0 }}>{item.medicine}</p>
                        {item.route && item.route !== 'Oral' && (
                          <span style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', fontWeight: 600 }}>({item.route})</span>
                        )}
                      </td>
                      <td style={{ padding: '7px 6px', fontWeight: 600, color: '#1e293b' }}>{item.dosage || '-'}</td>
                      <td style={{ padding: '7px 6px', fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>{item.frequency}</td>
                      <td style={{ padding: '7px 6px', fontWeight: 600, color: '#1e293b' }}>{item.duration}</td>
                      <td style={{ padding: '7px 6px', color: '#334155', fontStyle: 'italic' }}>{item.instructions || 'After food'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px 8px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                      No medications added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Doctor Advice / Post-Op Precautions */}
            {data.doctorNotes && (
              <div style={{ marginTop: '14px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px' }}>
                <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', color: '#172554', display: 'block', marginBottom: '2px', letterSpacing: '0.04em' }}>
                  Doctor Advice / Instructions:
                </span>
                <p style={{ color: '#1e293b', fontWeight: 500, margin: 0, lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                  {data.doctorNotes}
                </p>
              </div>
            )}

            {/* Recommended Review Date */}
            {data.followUpDate && (
              <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#475569' }}>Recommended Next Review Date:</span>
                <span style={{ fontWeight: 800, color: '#1e3a8a', fontFamily: 'monospace', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                  {data.followUpDate}
                </span>
              </div>
            )}
          </div>

          {/* Doctor Signature & Medical Stamp Area */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ width: '100%', borderBottom: '1.5px solid #1e3a8a', marginBottom: '4px' }} />
              <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase', margin: 0 }}>{doctorDisplayName}</p>
              <p style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', margin: '2px 0 0 0' }}>
                {doctorDegree} • Reg: {doctorReg}
              </p>
              <p style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 500, margin: '2px 0 0 0' }}>Doctor Signature & Stamp</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FOOTER (Matching physical pad bottom line)                */}
      {/* ========================================================= */}
      <div 
        className="shriya-footer-box"
        style={{
          borderTop: '1.5px solid #1e3a8a',
          paddingTop: '6px',
          marginTop: '10px',
          textAlign: 'center'
        }}
      >
        <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', letterSpacing: '0.02em', margin: 0 }}>
          Kindly bring the prescription on every appointments
        </p>
      </div>
    </div>
  );
};
