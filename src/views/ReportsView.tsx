import './clinic-modules.css';
import { SectionPicker, WorkspaceHeading } from '../components/common/WorkspaceControls';
import { ModalLayer } from '../components/common/ModalLayer';
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/common/Sidebar';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download, 
  Printer, 
  FileText, 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Stethoscope, 
  Activity, 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  X, 
  ArrowUpRight 
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    appointments = [], 
    patients = [], 
    doctors = [], 
    invoices = [], 
    payments = [], 
    visits = [], 
    addToast 
  } = useApp();

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Filter datasets based on selected timeframe using authentic database records
  const reportData = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const weekAgoDate = new Date();
    weekAgoDate.setDate(now.getDate() - 7);
    const weekAgoStr = `${weekAgoDate.getFullYear()}-${pad(weekAgoDate.getMonth() + 1)}-${pad(weekAgoDate.getDate())}`;

    const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartStr = `${monthStartDate.getFullYear()}-${pad(monthStartDate.getMonth() + 1)}-${pad(monthStartDate.getDate())}`;

    const formatReadable = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

    let label = 'Daily Practice Report';
    let dateRange = `Today • ${formatReadable(now)}`;
    let startDateStr = todayStr;

    if (timeframe === 'daily') {
      label = 'Daily Clinical & Financial Report';
      dateRange = `Today • ${formatReadable(now)}`;
      startDateStr = todayStr;
    } else if (timeframe === 'weekly') {
      label = 'Weekly Clinical & Financial Report';
      dateRange = `${formatReadable(weekAgoDate)} – ${formatReadable(now)} (Past 7 Days)`;
      startDateStr = weekAgoStr;
    } else {
      label = 'Monthly Clinical & Financial Report';
      dateRange = `${formatReadable(monthStartDate)} – ${formatReadable(now)} (Month to Date)`;
      startDateStr = monthStartStr;
    }

    const isInRange = (dateString?: string) => {
      if (!dateString) return false;
      const clean = dateString.substring(0, 10);
      return clean >= startDateStr && clean <= todayStr;
    };

    // Filter real records by selected timeframe
    const filteredVisits = visits.filter((v) => isInRange(v.visitDate));
    const filteredAppointments = appointments.filter((a) => isInRange(a.date));
    const filteredInvoices = invoices.filter((inv) => isInRange(inv.date));
    const filteredPayments = payments.filter((p) => isInRange(p.date));

    // Totals & Volume Metrics
    const uniquePatientIds = new Set<string>();
    filteredVisits.forEach((v) => { if (v.patientId) uniquePatientIds.add(v.patientId); });
    filteredAppointments.forEach((a) => { if (a.patientId) uniquePatientIds.add(a.patientId); });
    const totalPatientsSeen = uniquePatientIds.size || (filteredVisits.length > 0 ? filteredVisits.length : filteredAppointments.length);

    const newPatientsCount = patients.filter((p) => isInRange(p.registeredDate || p.createdAt)).length;
    const completedConsultations = 
      filteredVisits.filter((v) => v.status === 'Completed' || v.status === 'Closed' || v.status === 'Reception Follow-up').length +
      filteredAppointments.filter((a) => a.status === 'Completed').length;

    // Financial calculations strictly from real records
    const totalBilled = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalCollected = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstandingDue = Math.max(0, totalBilled - totalCollected);
    const collectionEfficiency = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : (totalCollected > 0 ? 100 : 0);

    // Doctor productivity breakdown from real doctor consultations & billing
    const doctorStats = doctors.map((doc, idx) => {
      const docVisits = filteredVisits.filter((v) => v.doctorId === doc.id || v.doctorName === doc.name);
      const docAppointments = filteredAppointments.filter((a) => (a.doctorId === doc.id || a.doctorName === doc.name) && a.status === 'Completed');
      const patientsSeen = Math.max(docVisits.length, docAppointments.length);

      const docInvoices = filteredInvoices.filter((inv) => inv.doctorName === doc.name || inv.approvedBy === doc.name);
      const billed = docInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

      const docPayments = filteredPayments.filter((p) => p.doctorName === doc.name);
      const collected = docPayments.length > 0
        ? docPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
        : docInvoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);

      let proceduresCount = 0;
      docInvoices.forEach((inv) => {
        if (inv.items && Array.isArray(inv.items)) {
          proceduresCount += inv.items.reduce((s, it) => s + (it.quantity || 1), 0);
        }
      });
      if (proceduresCount === 0 && patientsSeen > 0) {
        proceduresCount = patientsSeen;
      }

      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        roomNumber: doc.roomNumber || `Cabin ${101 + idx}`,
        patientsSeen,
        proceduresCount,
        billed,
        collected
      };
    });

    // Real dynamic Procedure distribution extracted from invoices & clinical visits
    const procedureMap = new Map<string, { count: number; revenue: number }>();

    filteredInvoices.forEach((inv) => {
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          const name = (item.description || 'Dental Procedure').trim();
          const qty = item.quantity || 1;
          const rev = item.total || (item.unitPrice ? item.unitPrice * qty : 0);
          const current = procedureMap.get(name) || { count: 0, revenue: 0 };
          procedureMap.set(name, {
            count: current.count + qty,
            revenue: current.revenue + rev
          });
        });
      }
    });

    filteredVisits.forEach((v) => {
      if (v.feeApproval?.items && Array.isArray(v.feeApproval.items) && !v.invoiceId) {
        v.feeApproval.items.forEach((item) => {
          const name = (item.description || 'Clinical Procedure').trim();
          const qty = item.quantity || 1;
          const rev = item.unitPrice ? item.unitPrice * qty : 0;
          const current = procedureMap.get(name) || { count: 0, revenue: 0 };
          procedureMap.set(name, {
            count: current.count + qty,
            revenue: current.revenue + rev
          });
        });
      }
    });

    const procedures = Array.from(procedureMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Real dynamic Payment methods breakdown extracted from real payment records
    const modeTotals: Record<string, number> = {
      'UPI / QR Payments': 0,
      'Credit / Debit Cards (POS)': 0,
      'Cash Counter Collections': 0,
      'Net Banking / Insurance': 0
    };

    filteredPayments.forEach((p) => {
      const amt = p.amount || 0;
      if (p.paymentMethod === 'UPI') {
        modeTotals['UPI / QR Payments'] += amt;
      } else if (p.paymentMethod === 'Card') {
        modeTotals['Credit / Debit Cards (POS)'] += amt;
      } else if (p.paymentMethod === 'Cash') {
        modeTotals['Cash Counter Collections'] += amt;
      } else {
        modeTotals['Net Banking / Insurance'] += amt;
      }
    });

    // If payments array is empty but invoices have paid amounts and payment methods:
    if (filteredPayments.length === 0) {
      filteredInvoices.forEach((inv) => {
        if (inv.paid > 0 && inv.paymentMethod) {
          if (inv.paymentMethod === 'UPI') modeTotals['UPI / QR Payments'] += inv.paid;
          else if (inv.paymentMethod === 'Card') modeTotals['Credit / Debit Cards (POS)'] += inv.paid;
          else if (inv.paymentMethod === 'Cash') modeTotals['Cash Counter Collections'] += inv.paid;
          else modeTotals['Net Banking / Insurance'] += inv.paid;
        }
      });
    }

    const totalCollectedByModes = Object.values(modeTotals).reduce((sum, v) => sum + v, 0);

    const paymentMethods = [
      {
        method: 'UPI / QR Payments',
        amount: modeTotals['UPI / QR Payments'],
        share: totalCollectedByModes > 0 ? Math.round((modeTotals['UPI / QR Payments'] / totalCollectedByModes) * 100) : 0
      },
      {
        method: 'Credit / Debit Cards (POS)',
        amount: modeTotals['Credit / Debit Cards (POS)'],
        share: totalCollectedByModes > 0 ? Math.round((modeTotals['Credit / Debit Cards (POS)'] / totalCollectedByModes) * 100) : 0
      },
      {
        method: 'Cash Counter Collections',
        amount: modeTotals['Cash Counter Collections'],
        share: totalCollectedByModes > 0 ? Math.round((modeTotals['Cash Counter Collections'] / totalCollectedByModes) * 100) : 0
      },
      {
        method: 'Net Banking / Insurance',
        amount: modeTotals['Net Banking / Insurance'],
        share: totalCollectedByModes > 0 ? Math.round((modeTotals['Net Banking / Insurance'] / totalCollectedByModes) * 100) : 0
      }
    ];

    return {
      label,
      dateRange,
      totalPatientsSeen,
      newPatientsCount,
      completedConsultations,
      totalBilled,
      totalCollected,
      outstandingDue,
      collectionEfficiency,
      doctorStats,
      procedures,
      paymentMethods,
      totalCollectedByModes
    };
  }, [timeframe, visits, appointments, invoices, payments, patients, doctors]);

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent = 
      `Report: ${reportData.label}\n` +
      `Date Range: ${reportData.dateRange}\n` +
      `Total Patients: ${reportData.totalPatientsSeen}\n` +
      `Total Billed: ₹${reportData.totalBilled}\n` +
      `Total Collected: ₹${reportData.totalCollected}\n` +
      `Outstanding Due: ₹${reportData.outstandingDue}\n\n` +
      `DOCTOR BREAKDOWN\nDoctor Name,Specialization,Patients,Billed,Collected\n` +
      reportData.doctorStats.map(d => `"${d.name}","${d.specialization}",${d.patientsSeen},${d.billed},${d.collected}`).join('\n') +
      `\n\nPROCEDURES BREAKDOWN\nProcedure Name,Procedures,Revenue\n` +
      (reportData.procedures.length > 0 
        ? reportData.procedures.map(p => `"${p.name}",${p.count},${p.revenue}`).join('\n')
        : '"No procedures billed",0,0');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Shriya_Dental_Clinic_${timeframe}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report Exported', 'CSV report downloaded to your device.', 'success');
  };

  return (
    <div className="workspace w-full max-w-[1650px] mx-auto px-4 lg:px-6 py-5 flex flex-col lg:flex-row gap-6">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 space-y-5 animate-in fade-in">
        <div className="module-compact-heading"><WorkspaceHeading title="Practice reports" detail={reportData.dateRange}>
          <button className="work-action" onClick={handleExportCsv}><Download size={16} /> Export CSV</button>
          <button className="work-action primary" onClick={() => setIsPdfModalOpen(true)}><Printer size={16} /> Preview PDF</button>
        </WorkspaceHeading></div>
        <SectionPicker label="Report period" value={timeframe} onChange={setTimeframe} options={[
          { id: 'daily', label: 'Today' }, { id: 'weekly', label: '7 days' }, { id: 'monthly', label: 'Month to date' },
        ]} />
        <dl className="module-summary">
          <div><dt>Collections</dt><dd>₹{reportData.totalCollected.toLocaleString()}</dd><small>{reportData.collectionEfficiency}% of ₹{reportData.totalBilled.toLocaleString()} billed</small></div>
          <div><dt>Patients seen</dt><dd>{reportData.totalPatientsSeen}</dd><small>{reportData.newPatientsCount} newly registered</small></div>
          <div><dt>Completed visits</dt><dd>{reportData.completedConsultations}</dd></div>
          <div><dt>Outstanding</dt><dd>₹{reportData.outstandingDue.toLocaleString()}</dd></div>
        </dl>

        {/* Doctor Performance Breakdown Table */}
        <div className="clay-card bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Doctor activity</span>
              </h3>
              <p className="text-xs text-slate-500">Consultation volume and revenue generated per consulting dental specialist.</p>
            </div>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs responsive-records">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Doctor / Specialist</th>
                  <th className="py-3 px-3">Specialization</th>
                  <th className="py-3 px-3">Cabin</th>
                  <th className="py-3 px-3 text-center">Patients Seen</th>
                  <th className="py-3 px-3 text-center">Procedures</th>
                  <th className="py-3 px-3 text-right">Gross Billed</th>
                  <th className="py-3 px-4 text-right">Collections (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reportData.doctorStats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No doctor consultation records found for this period.
                    </td>
                  </tr>
                ) : (
                  reportData.doctorStats.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td data-label="Doctor / Specialist" className="py-3 px-4 font-black text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {doc.name.replace('Dr. ', '').charAt(0)}
                        </div>
                        <span>{doc.name}</span>
                      </td>
                      <td data-label="Specialization" className="py-3 px-3 text-slate-600">{doc.specialization}</td>
                      <td data-label="Cabin" className="py-3 px-3 font-mono text-slate-500">{doc.roomNumber}</td>
                      <td data-label="Patients Seen" className="py-3 px-3 text-center font-bold font-mono text-slate-800">{doc.patientsSeen}</td>
                      <td data-label="Procedures" className="py-3 px-3 text-center font-mono text-slate-600">{doc.proceduresCount}</td>
                      <td data-label="Gross Billed" className="py-3 px-3 text-right font-mono font-bold text-slate-700">₹{doc.billed.toLocaleString()}</td>
                      <td data-label="Collections (₹)" className="py-3 px-4 text-right font-mono font-black text-emerald-700">₹{doc.collected.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Procedures and Payment Modes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Procedures */}
          <ClayCard className="p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>High-Volume Dental Procedures & Revenue</span>
            </h3>
            <p className="text-xs text-slate-500">Distribution across major dental clinical treatments.</p>

            {reportData.procedures.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                  🦷
                </div>
                <p className="text-xs font-bold text-slate-700">No procedure revenue recorded for this period</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Procedures and treatment revenue recorded on patient invoices will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                {reportData.procedures.map((proc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">{proc.name}</span>
                      <span className="text-[11px] text-slate-500">{proc.count} {proc.count === 1 ? 'procedure' : 'procedures'} performed</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-xs text-sky-800 block">
                        ₹{proc.revenue.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Revenue</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ClayCard>

          {/* Payment Method Distribution */}
          <ClayCard className="p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>Financial Collections by Payment Mode</span>
            </h3>
            <p className="text-xs text-slate-500">Breakdown of patient settlement channels.</p>

            {reportData.totalCollected === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                  💳
                </div>
                <p className="text-xs font-bold text-slate-700">No payment collections recorded for this period</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Settlements processed through UPI, Cards, Cash, or Net Banking in Billing & Payments will display revenue breakdown and percentage distribution here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {reportData.paymentMethods.map((pm, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{pm.method}</span>
                      <span className="font-mono font-black text-teal-800">₹{pm.amount.toLocaleString()} ({pm.share}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-600 rounded-full transition-all"
                        style={{ width: `${pm.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ClayCard>
        </div>

        {/* FULL REPORT PDF DOWNLOAD & PRINT MODAL */}
        {isPdfModalOpen && (
          <ModalLayer onDismiss={() => setIsPdfModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
            <div className="clay-card w-full max-w-3xl bg-white rounded-3xl p-6 lg:p-8 shadow-2xl border border-white space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Modal Actions Bar (hidden when printed) */}
              <div className="module-section-heading pb-3 border-b border-slate-200 print:hidden">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Report preview</h3>
                    <p className="text-xs text-slate-500">{reportData.dateRange}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintPdf}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save as PDF</span>
                  </button>
                  <button aria-label="Close dialog"
                    onClick={() => setIsPdfModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
              <div className="space-y-6 font-sans text-slate-800 p-2">
                {/* Formal Letterhead */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-black text-2xl flex items-center justify-center shadow-xs">
                      🦷
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                        Shriya Multispeciality Dental Clinic
                      </h1>
                      <p className="text-xs text-slate-600 font-medium">
                        ISO 9001:2015 Certified Dental Practice • Reg No: BLR/MED/2026/0491
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Indiranagar Main Road, Bengaluru, Karnataka 560038 • Ph: +91 80 4912 3000
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="px-3 py-1 rounded-md bg-purple-100 text-purple-900 font-black text-xs uppercase tracking-wider border border-purple-200 block mb-1">
                      {reportData.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      Period: {reportData.dateRange}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Executive Summary Cards */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                    1. Executive KPI Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Patient Volume</span>
                      <span className="text-xl font-black text-slate-900 font-mono">{reportData.totalPatientsSeen}</span>
                      <span className="text-[10px] text-slate-500 block">({reportData.newPatientsCount} New)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Total Billed</span>
                      <span className="text-xl font-black text-slate-900 font-mono">₹{reportData.totalBilled.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 block">Across all visits</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold block">Collections Received</span>
                      <span className="text-xl font-black text-emerald-900 font-mono">₹{reportData.totalCollected.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">{reportData.collectionEfficiency}% Efficiency</span>
                    </div>
                  </div>
                </div>

                {/* Doctor Performance Summary Table */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                    2. Doctor Consultation & Revenue Summary
                  </h4>
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden responsive-records">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3 border-b border-slate-200">Specialist</th>
                        <th className="py-2 px-3 border-b border-slate-200">Department</th>
                        <th className="py-2 px-2 border-b border-slate-200 text-center">Patients</th>
                        <th className="py-2 px-3 border-b border-slate-200 text-right">Billed (₹)</th>
                        <th className="py-2 px-3 border-b border-slate-200 text-right">Collected (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.doctorStats.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">
                            No doctor performance data recorded for this period.
                          </td>
                        </tr>
                      ) : (
                        reportData.doctorStats.map((d) => (
                          <tr key={d.id}>
                            <td data-label="Specialist" className="py-2 px-3 font-bold text-slate-900">{d.name}</td>
                            <td data-label="Department" className="py-2 px-3 text-slate-600">{d.specialization}</td>
                            <td data-label="Patients" className="py-2 px-2 text-center font-mono">{d.patientsSeen}</td>
                            <td data-label="Billed (₹)" className="py-2 px-3 text-right font-mono">₹{d.billed.toLocaleString()}</td>
                            <td data-label="Collected (₹)" className="py-2 px-3 text-right font-mono font-bold text-emerald-800">₹{d.collected.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Procedures Distribution */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                    3. Procedure Breakdown
                  </h4>
                  {reportData.procedures.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      No clinical procedures billed in this reporting period.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {reportData.procedures.map((p, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex justify-between">
                          <span className="font-semibold text-slate-700">{p.name} ({p.count})</span>
                          <span className="font-mono font-bold text-slate-900">₹{p.revenue.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formal Signatures Footer */}
                <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                  <div>
                    <div className="h-10 border-b border-slate-400 w-48 mb-1" />
                    <span className="font-bold text-slate-800 block">Clinic Practice Manager</span>
                    <span className="text-[10px]">Verified against Ledger Audit</span>
                  </div>

                  <div className="text-right">
                    <div className="h-10 border-b border-slate-400 w-48 mb-1 ml-auto" />
                    <span className="font-bold text-slate-800 block">{doctors[0]?.name || 'Consulting Doctor'}</span>
                    <span className="text-[10px]">{doctors[0]?.specialization || 'Medical Director & Chief Admin'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Print Modal Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPdfModalOpen(false)}
                >
                  Close Preview
                </ClayButton>
                <ClayButton
                  variant="primary"
                  size="sm"
                  onClick={handlePrintPdf}
                  icon={<Printer className="w-4 h-4" />}
                >
                  Download / Print PDF
                </ClayButton>
              </div>
            </div>
          </ModalLayer>
        )}
      </main>
    </div>
  );
};
