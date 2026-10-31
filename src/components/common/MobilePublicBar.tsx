import React from 'react';
import { Phone, MessageSquare, Calendar } from 'lucide-react';

interface MobilePublicBarProps {
  onOpenEnquiry: () => void;
}

export const MobilePublicBar: React.FC<MobilePublicBarProps> = ({ onOpenEnquiry }) => {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 shadow-2xl pb-safe">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        {/* Quick Call Button */}
        <a
          href="tel:+919400320890"
          className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-slate-200"
          title="Call Clinic Reception"
        >
          <Phone className="w-4 h-4 text-teal-700" />
          <span>Call Desk</span>
        </a>

        {/* WhatsApp Direct Button */}
        <a
          href="https://wa.me/919400320890?text=Hello%20Shriya%20Multispeciality%20Dental%20Clinic%2C%20I%20would%20like%20to%20enquire%20about%20a%20dental%20appointment."
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-emerald-200"
          title="Chat on WhatsApp"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>WhatsApp</span>
        </a>

        {/* Main Book Appointment CTA Button */}
        <button
          type="button"
          onClick={onOpenEnquiry}
          className="flex-[1.5] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-teal-950/20 active:scale-95 transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Consult</span>
        </button>
      </div>
    </div>
  );
};

