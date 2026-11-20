import { WhatsAppReminder, WhatsAppMessageType } from '../types';

export const CLINIC_OFFICIAL_PHONE = '9400320890';
export const CLINIC_OFFICIAL_PHONE_DISPLAY = '+91 94003 20890';
export const CLINIC_EMERGENCY_PHONE = '7904221656';
export const CLINIC_EMERGENCY_PHONE_DISPLAY = '+91 79042 21656';

export const formatWhatsAppNumber = (rawPhone: string): string => {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  // If 10 digits (common in India), prepend '91'
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
};

export const createWhatsAppUrl = (phone: string, text: string): string => {
  const clean = formatWhatsAppNumber(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
};

export const openWhatsAppChat = (phone: string, text: string): boolean => {
  if (typeof window === 'undefined') return false;
  const url = createWhatsAppUrl(phone, text);
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};

export interface WhatsAppTemplate {
  id: string;
  category: 'Important Date' | 'Clinic News' | 'Holiday Notice' | 'Post-Treatment Care' | 'Custom';
  title: string;
  description: string;
  defaultText: string;
}

export const CLINIC_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'appt-confirm',
    category: 'Important Date',
    title: '📅 Appointment Confirmation',
    description: 'Confirm a booked dental appointment with date & time',
    defaultText: `🦷 *Shriya Multispeciality Dental Clinic*

Dear {patientName},
Your dental appointment with *{doctorName}* has been successfully confirmed.

📅 *Date:* {date}
⏰ *Time:* {time}
📍 *Location:* Shriya Multispeciality Dental Clinic

Please arrive 10 minutes prior to your scheduled time. If you need to reschedule, reply directly to this message or call our reception desk.
Wishing you a bright and healthy smile!`
  },
  {
    id: 'appt-24h-reminder',
    category: 'Important Date',
    title: '⏰ 24-Hour Prior Reminder',
    description: 'Gentle reminder sent one day prior to appointment',
    defaultText: `🦷 *Shriya Multispeciality Dental Clinic*

Hello {patientName},
This is a gentle reminder that you have an upcoming dental appointment scheduled for tomorrow:

📅 *Date:* {date}
⏰ *Time:* {time}
👨‍⚕️ *Doctor:* {doctorName}

Please arrive on time. Reply 'YES' to confirm or call us if you need to adjust your time slot.`
  },
  {
    id: 'checkup-due',
    category: 'Important Date',
    title: '🔍 6-Month Dental Checkup Due',
    description: 'Preventive care checkup reminder for regular patients',
    defaultText: `🦷 *Shriya Multispeciality Dental Clinic*

Dear {patientName},
It's time for your periodic 6-month preventive dental check-up! Regular checkups protect your teeth from plaque, decay, and gum issues.

📅 Contact us to reserve your preferred consultation slot this week.
📞 Reception Desk: +91 94003 20890
Protecting your smile every step of the way!`
  },
  {
    id: 'clinic-news-facility',
    category: 'Clinic News',
    title: '📢 Important Clinic Announcement / News',
    description: 'Share news about clinic upgrades, new doctors, or special facilities',
    defaultText: `📢 *Clinic Announcement - Shriya Multispeciality Dental Clinic*

Dear Valued Patient,
We are pleased to inform you of our latest clinical enhancements:
✨ Advanced 3D Digital Intraoral Scanning & Painless Root Canal Treatments now available.
🕒 Extended evening consultation hours: Monday - Saturday up to 8:30 PM.

For consultations or appointments, please contact our reception desk (+91 94003 20890). We are committed to world-class dental care for your whole family!`
  },
  {
    id: 'holiday-closure',
    category: 'Holiday Notice',
    title: '🏖️ Holiday / Clinic Closure Notice',
    description: 'Notify patients about clinic closure for festival, maintenance, or holiday',
    defaultText: `📢 *Holiday Notice - Shriya Multispeciality Dental Clinic*

Dear Patients,
Please note that our clinic will remain *CLOSED* on *{date}* on account of {reason}.

🏥 *Resuming Regular Consultations:* {resumeDate} at 9:00 AM.
🚨 *Emergency Dental Line:* In case of severe dental emergencies or trauma, call +91 94003 20890 / +91 79042 21656.

We wish you and your family a safe and happy holiday!`
  },
  {
    id: 'health-camp-notice',
    category: 'Important Date',
    title: '🎯 Free Dental Screening & Camp Date',
    description: 'Invite patients and families to special dental camps or checkup dates',
    defaultText: `🦷 *Special Dental Camp - Shriya Multispeciality Dental Clinic*

Dear {patientName},
You and your family are cordially invited to our *Free Preventive Dental Checkup Camp*!

📅 *Date:* {date}
⏰ *Timing:* 9:00 AM - 5:00 PM
📍 *Venue:* Shriya Multispeciality Dental Clinic
✨ *Services:* Complimentary oral cancer screening, tartar inspection & pediatric dental assessment.

Limited consultation slots available. Reply to reserve your token!`
  },
  {
    id: 'post-op-extraction',
    category: 'Post-Treatment Care',
    title: '🩹 Post-Extraction Care Instructions',
    description: 'Immediate home care advice after tooth removal',
    defaultText: `🦷 *Post-Extraction Care - Shriya Multispeciality Dental Clinic*

Dear {patientName},
Please follow these post-operative care tips for fast healing:
1. Keep the gauze pack pressed firmly with biting pressure for 45 minutes.
2. Do NOT spit, rinse vigorously, or use a straw today.
3. Eat soft, cool foods (curd, ice cream, porridge). Avoid hot, spicy food.
4. Take prescribed medications on time.
5. From tomorrow, start gentle warm salt water rinses 3-4 times a day.

Reach out to us immediately if bleeding persists.`
  },
  {
    id: 'post-op-rct',
    category: 'Post-Treatment Care',
    title: '⚡ Post-Root Canal (RCT) Instructions',
    description: 'Care guidelines after root canal treatment',
    defaultText: `🦷 *Post-RCT Care - Shriya Multispeciality Dental Clinic*

Dear {patientName},
Here are your care guidelines following today's root canal sitting:
• Mild tenderness when chewing is normal for 2-3 days while the tissue heals.
• Avoid chewing hard foods on the treated side until the permanent crown/cap is placed.
• Continue your prescribed analgesic / antibiotic course as directed by *{doctorName}*.

Call our desk if you experience unusual swelling or severe pain.`
  },
  {
    id: 'custom-matter',
    category: 'Custom',
    title: '✍️ Custom Clinic Matter / Notice',
    description: 'Blank template for any custom matter or personal patient message',
    defaultText: `🦷 *Shriya Multispeciality Dental Clinic*

Dear {patientName},

`
  }
];

export const INITIAL_WHATSAPP_REMINDERS: WhatsAppReminder[] = [
  {
    id: 'wa-seed-1',
    patientName: 'Customer 1',
    phone: '9633746591',
    appointmentDate: '2026-11-22',
    appointmentTime: '10:30 AM',
    doctorName: 'Dr. DOCTOR TEST',
    type: 'Confirmation',
    status: 'Pending',
    scheduledFor: 'Today, 09:00 AM',
    messageText: `🦷 *Shriya Multispeciality Dental Clinic*\n\nDear Customer 1,\nYour dental appointment with *Dr. DOCTOR TEST* is confirmed for tomorrow (2026-11-22) at 10:30 AM.\n\nPlease arrive 10 minutes before your slot.\nContact: +91 94003 20890`,
    category: 'Individual'
  },
  {
    id: 'wa-seed-2',
    patientName: 'customer 2',
    phone: '9633746592',
    appointmentDate: '2026-11-23',
    appointmentTime: '02:00 PM',
    doctorName: 'Dr. DOCTOR TEST',
    type: 'Important Date',
    status: 'Scheduled',
    scheduledFor: '2026-11-22, 08:00 AM',
    messageText: `🦷 *Shriya Multispeciality Dental Clinic*\n\nHello customer 2,\nGentle reminder: your regular 6-month preventive dental check-up and scaling session is due on 2026-11-23.\n\nProtecting your smile! Helpline: +91 94003 20890`,
    category: 'Individual'
  },
  {
    id: 'wa-seed-3',
    patientName: 'All Clinic Patients',
    phone: 'Multiple (Broadcast)',
    appointmentDate: '2026-11-25',
    appointmentTime: 'Full Day',
    doctorName: 'Clinic Administration',
    type: 'Holiday Notice',
    status: 'Sent',
    scheduledFor: '2026-11-20, 11:00 AM',
    messageText: `📢 *Holiday Notice - Shriya Multispeciality Dental Clinic*\n\nDear Patients,\nPlease note that our clinic will remain CLOSED on Wednesday, 25th Nov for scheduled sterilization and staff training.\n\nEmergency line: +91 94003 20890 / +91 79042 21656.\nWe resume regular hours on 26th Nov at 9:00 AM.`,
    category: 'Broadcast',
    recipientCount: 3
  },
  {
    id: 'wa-seed-4',
    patientName: 'customer 3',
    phone: '9633746593',
    appointmentDate: '2026-11-20',
    appointmentTime: '11:00 AM',
    doctorName: 'Dr. DOCTOR TEST',
    type: 'Post Visit Care',
    status: 'Sent',
    scheduledFor: '2026-11-20, 01:00 PM',
    messageText: `🦷 *Post-Treatment Care - Shriya Multispeciality Dental Clinic*\n\nDear customer 3,\nThank you for visiting us today for your dental procedure. Remember to eat soft, lukewarm foods today and take medicines as prescribed.\n\nWishing you quick healing!`,
    category: 'Individual'
  }
];
