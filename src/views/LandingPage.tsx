import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Award,
  Star,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  CircleDot,
  Smile,
  Zap,
  HeartHandshake,
  Activity,
  Clock,
  Shield,
  Layers,
  Camera,
  Check,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { PatientEnquiryModal } from '../components/common/PatientEnquiryModal';
import { MobilePublicBar } from '../components/common/MobilePublicBar';

export const LandingPage: React.FC = () => {
  const { doctors, services, setActiveView, addEnquiry } = useApp();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryService, setInquiryService] = useState('Dental Implants');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState<string | undefined>(undefined);

  const serviceIcons: Record<string, React.ReactNode> = {
    Stethoscope: <Stethoscope className="w-5 h-5 text-teal-700" />,
    Sparkles: <Sparkles className="w-5 h-5 text-emerald-600" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-teal-700" />,
    CircleDot: <CircleDot className="w-5 h-5 text-teal-700" />,
    Smile: <Smile className="w-5 h-5 text-emerald-700" />,
    Zap: <Zap className="w-5 h-5 text-amber-600" />
  };

  // Default Clinical Faculty for Shriya Multispeciality Dental Clinic
  // Displayed whenever dynamic Supabase doctor list is initially being configured
  const fallbackSpecialists = [
    {
      id: 'doc-lead-1',
      name: 'Dr. Rajesh Patel',
      specialization: 'Prosthodontist & Implantologist',
      qualification: 'BDS, MDS (Prosthodontics), FICOI (USA)',
      experience: '14+ Years Experience',
      rating: 4.9,
      reviewsCount: 380,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      bio: 'Pioneer in computer-guided full-arch dental implants, porcelain veneers, and complex full-mouth rehabilitation.'
    },
    {
      id: 'doc-lead-2',
      name: 'Dr. Priya Sharma',
      specialization: 'Orthodontics & Dentofacial Orthopedics',
      qualification: 'BDS, MDS (Orthodontics), Invisalign Gold',
      experience: '11+ Years Experience',
      rating: 4.9,
      reviewsCount: 420,
      avatar: 'https://images.unsplash.com/photo-1594824813583-b78e2f896b05?auto=format&fit=crop&w=400&q=80',
      bio: 'Expert in invisible aligner smile design, self-ligating ceramic braces, and pediatric habit-breaking appliances.'
    },
    {
      id: 'doc-lead-3',
      name: 'Dr. Vikram Malhotra',
      specialization: 'Microscopic Endodontist',
      qualification: 'BDS, MDS (Conservative Dentistry)',
      experience: '12+ Years Experience',
      rating: 5.0,
      reviewsCount: 310,
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
      bio: 'Specialist in single-visit painless root canal treatments, laser tooth bleaching, and aesthetic composite bonding.'
    },
    {
      id: 'doc-lead-4',
      name: 'Dr. Ananya Reddy',
      specialization: 'Pediatric Dental Specialist',
      qualification: 'BDS, MDS (Pedodontics)',
      experience: '9+ Years Experience',
      rating: 4.9,
      reviewsCount: 260,
      avatar: 'https://images.unsplash.com/photo-1594824813583-b78e2f896b05?auto=format&fit=crop&w=400&q=80',
      bio: 'Passionate about gentle, anxiety-free dentistry for children, milk tooth pulpectomies, and preventive fluorides.'
    }
  ];

  const displaySpecialists = doctors.length > 0 ? doctors : fallbackSpecialists;

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;

    try {
      await addEnquiry({
        patientName: inquiryName.trim(),
        phone: inquiryPhone.trim(),
        chiefComplaint: inquiryService || 'Routine Dental Checkup & Consultation',
        notes: inquiryNotes.trim() || undefined
      });
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setInquiryName('');
        setInquiryPhone('');
        setInquiryNotes('');
      }, 5000);
    } catch (err) {
      console.error('Error submitting enquiry:', err);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-14 sm:gap-20 pb-28 sm:pb-20">
      {/* ===================================================================== */}
      {/* 1. HERO SECTION                                                      */}
      {/* ===================================================================== */}
      <section className="relative px-4 pt-6 md:pt-14 overflow-hidden">
        {/* Ambient Subtle Background Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-teal-100/40 via-emerald-50/30 to-sky-100/30 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start gap-5 sm:gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-extrabold shadow-2xs">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Center for Advanced Dentistry & Implantology</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              World-Class Dental Care, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800">
                Painless & Gentle.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg font-medium text-slate-600 max-w-2xl leading-relaxed">
              Welcome to <strong>Shriya Multispeciality Dental Clinic</strong>. From painless single-sitting root canals and laser whitening to 3D computer-guided implants and invisible aligners — experience gentle, state-of-the-art dental solutions delivered by certified specialists.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 w-full sm:w-auto pt-1">
              <button
                onClick={() => {
                  setSelectedConcern('Routine Dental Checkup & Consultation');
                  setShowEnquiryModal(true);
                }}
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-900/15 hover:shadow-teal-900/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Consultation / Enquire</span>
              </button>

              <button
                onClick={() => scrollToSection('services')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>Explore Specialities</span>
              </button>

              <a
                href="tel:+919800012345"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 py-2 sm:py-3 px-2 transition-colors text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Helpline: +91 98000 12345</span>
              </a>
            </div>

            {/* Trust Metrics Pill Strip */}
            <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full border-t border-slate-200/70 text-[11px] sm:text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>100% Sterile Cabins</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>Painless Laser Tech</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>MDS Specialists</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>Transparent Fees</span>
              </div>
            </div>
          </div>

          {/* Right Visual Area: Operatory Suite Photo + Floating Clinical Badges */}
          <div className="lg:col-span-5 relative flex justify-center w-full">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] bg-white rounded-3xl p-3 shadow-xl border-4 border-white overflow-hidden group mx-auto">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80"
                alt="Shriya Multispeciality Dental Clinic Operatory Suite"
                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              />

              {/* Floating Badge 1: Sterilization Accreditation */}
              <div className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-3 shadow-lg border border-slate-100 flex items-center gap-2 sm:gap-3 animate-in fade-in max-w-[85%]">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-black shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-black text-slate-900 truncate">NABH & ISO Compliant</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-teal-700 truncate">4-Tier Autoclave Protocols</div>
                </div>
              </div>

              {/* Floating Badge 2: Google Rating */}
              <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-3 shadow-lg border border-slate-100 flex items-center gap-2 sm:gap-3 max-w-[85%]">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-black text-slate-900 truncate">4.9 / 5.0 Rating</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate">5,000+ Happy Smiles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. EMERGENCY & SAME-DAY APPOINTMENT RIBBON                            */}
      {/* ===================================================================== */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-2">
                <span>Suffering from Severe Toothache or Broken Tooth?</span>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Emergency Priority
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5">
                We accept walk-ins and arrange immediate pain-relief consultations within 30 minutes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <a
              href="tel:+919800012345"
              className="flex-1 md:flex-none text-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
            >
              📞 Call Reception
            </a>
            <button
              onClick={() => setActiveView('booking')}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-sm"
            >
              Book Priority Visit →
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. CLINICAL STATISTICS COUNTERS                                       */}
      {/* ===================================================================== */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs text-center">
            <div className="text-2xl sm:text-4xl font-black text-teal-800">15+</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Years of Dental Excellence</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Serving families since 2011</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs text-center">
            <div className="text-2xl sm:text-4xl font-black text-emerald-700">12,500+</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Smiles Restored</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Implants, aligners & root canals</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs text-center">
            <div className="text-2xl sm:text-4xl font-black text-amber-500 flex items-center justify-center gap-1">
              <span>4.9</span>
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div className="text-xs font-bold text-slate-600 mt-1">Google Patient Rating</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Over 2,400+ verified reviews</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs text-center">
            <div className="text-2xl sm:text-4xl font-black text-teal-700">100%</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Sterilization Adherence</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Hospital Class-B Autoclave</div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. COMPREHENSIVE CLINICAL SPECIALITIES & SERVICES                     */}
      {/* ===================================================================== */}
      <section id="services" className="px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-extrabold text-teal-800 uppercase tracking-widest px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              Multi-Speciality Practice
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Advanced Dental Treatments
            </h2>
            <p className="text-xs sm:text-sm md:text-base font-medium text-slate-600 mt-2">
              From preventive hygiene to complex full mouth rehabilitation, we offer high-precision, painless dental solutions under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {serviceIcons[srv.iconName] || <Stethoscope className="w-5 h-5 text-teal-700" />}
                    </div>
                    <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60 uppercase">
                      {srv.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors line-clamp-2">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                    <span className="text-xs font-extrabold text-slate-700">{srv.duration}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Starting From</span>
                    <span className="text-sm font-black text-teal-800">₹{srv.price.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('booking')}
                  className="w-full mt-3 py-2 rounded-xl bg-slate-50 hover:bg-teal-700 hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 hover:border-teal-700"
                >
                  <span>Book Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. WHY CHOOSE SHRIYA MULTISPECIALITY DENTAL CLINIC                   */}
      {/* ===================================================================== */}
      <section id="why-choose" className="px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto bg-gradient-to-b from-slate-50 to-white rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider px-3 py-1 rounded-full bg-teal-100/60 border border-teal-200">
                The Shriya Dental Standard
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Why Patients Trust Shriya Multispeciality Dental Clinic
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                We combine compassionate medical care with cutting-edge dental technology so your treatment is precise, virtually painless, and enduring.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Hospital-Grade 4-Tier Sterilization</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Every surgical instrument undergoes ultrasonic pre-cleansing, vacuum Class-B autoclaving, and sealed pouch validation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Low-Radiation 3D Digital Imaging</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Instant intraoral digital sensors with 90% lower radiation than conventional film X-rays, allowing pinpoint accuracy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Painless Laser & Rotary Dentistry</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Advanced diode dental lasers enable bloodless gum therapies and rapid single-visit root canals with zero discomfort.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Transparent & Written Estimates</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Full transparency with itemized treatment plans, zero surprise costs, digital receipt records, and flexible EMI support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Feature Showcase Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center hover:border-teal-300 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl mb-2.5">
                  🦷
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Digital 3D Scans</h4>
                <p className="text-[11px] text-slate-500 mt-1">No messy impression pastes. Instant CAD/CAM 3D models.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center hover:border-teal-300 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl mb-2.5">
                  ✨
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Laser Whitening</h4>
                <p className="text-[11px] text-slate-500 mt-1">Brighten teeth up to 6-8 shades safely in a single 45-min sitting.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center hover:border-teal-300 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl mb-2.5">
                  🛋️
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Ergonomic Lounges</h4>
                <p className="text-[11px] text-slate-500 mt-1">Ultra-comfort Italian patient chairs designed for relaxed visits.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center hover:border-teal-300 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl mb-2.5">
                  👨‍⚕️
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">MDS Specialists</h4>
                <p className="text-[11px] text-slate-500 mt-1">Post-graduate masters for implants, orthodontics & pediatric care.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. EXPERT SPECIALISTS & DOCTORS                                      */}
      {/* ===================================================================== */}
      <section id="doctors" className="px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              Specialist Faculty
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Meet Our Dental Specialists
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-2">
              Board-certified practitioners with extensive post-graduate credentials dedicated to gentle, personalized clinical care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displaySpecialists.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden mb-3 border-2 border-slate-100 shadow-xs group-hover:scale-105 transition-transform relative flex items-center justify-center bg-gradient-to-tr from-teal-50 to-teal-100">
                  {doc.avatar && (doc.avatar.startsWith('data:') || doc.avatar.startsWith('http')) && !doc.avatar.includes('photo-1559839734') ? (
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fb = e.currentTarget.nextElementSibling;
                        if (fb) fb.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-700 to-emerald-800 text-white ${doc.avatar && (doc.avatar.startsWith('data:') || doc.avatar.startsWith('http')) && !doc.avatar.includes('photo-1559839734') ? 'hidden' : ''}`}>
                    <Stethoscope className="w-8 h-8 text-teal-200 mb-1" />
                    <span className="text-xs font-black tracking-wider uppercase">
                      {doc.name.replace(/^Dr\.?\s*/i, '').slice(0, 2).toUpperCase() || 'DR'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{doc.name}</h3>
                <span className="text-xs font-bold text-teal-700 mt-0.5">{doc.specialization}</span>
                <span className="text-[11px] font-medium text-slate-500 mt-0.5">{doc.qualification}</span>

                <div className="mt-2.5 py-0.5 px-2.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-extrabold flex items-center gap-1 border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{doc.rating} ({doc.reviewsCount} reviews)</span>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                  {doc.bio}
                </p>

                <button
                  onClick={() => {
                    setSelectedConcern(`Consultation with ${doc.name} (${doc.specialization})`);
                    setShowEnquiryModal(true);
                  }}
                  className="w-full mt-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. VERIFIED PATIENT REVIEWS & TESTIMONIALS                           */}
      {/* ===================================================================== */}
      <section id="testimonials" className="px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
              Patient Experiences
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Words From Our Happy Patients
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Over 5,000+ happy smiles restored with care, comfort, and clinical precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Dental Implants
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "I was terrified of dental implants due to past experiences. Dr. Rajesh Patel at Shriya Multispeciality Dental Clinic made the entire surgical procedure completely painless with 3D guided surgery. Highly recommended for senior care!"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-3 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                  alt="Dr. Sunita Varma"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Dr. Sunita Varma</div>
                  <div className="text-[10px] text-slate-500">Architect & Patient</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Single-Sitting RCT
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "Microscopic root canal treatment completed in exactly 50 minutes with zero pain. The clinic hygiene at Shriya Dental is pristine, just like a top-tier hospital operatory suite. True professionals!"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-3 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Ramesh Krishnan"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Ramesh Krishnan</div>
                  <div className="text-[10px] text-slate-500">Senior IT Director</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Clear Aligners
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "Got my digital clear aligners here. The 3D treatment simulation showed my exact teeth movement before starting. My smile transformation has exceeded all expectations. Thank you Shriya Dental team!"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-3 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Neha Deshmukh"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Neha Deshmukh</div>
                  <div className="text-[10px] text-slate-500">Corporate Attorney</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8. CLINIC DETAILS, TIMINGS & INQUIRY FORM                             */}
      {/* ===================================================================== */}
      <section id="contact" className="px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Clinic Address & Hours Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
                Clinic Location & Hours
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
                Visit Shriya Multispeciality Dental Clinic
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Conveniently located with dedicated patient parking, elevator access, and full wheelchair accessibility.
              </p>

              <div className="mt-6 space-y-4 text-xs font-semibold text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 shrink-0 border border-teal-100">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-900 font-extrabold text-xs">Clinic Address</div>
                    <div className="text-slate-500 font-medium mt-0.5">
                      Suite 402, Shriya Healthcare Plaza, Metro Station Road, City Center
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 shrink-0 border border-emerald-100">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-900 font-extrabold text-xs">Reception & Emergency Helpline</div>
                    <div className="text-slate-500 font-medium mt-0.5 font-mono">
                      +91 98000 12345 / +91 98000 54321
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 shrink-0 border border-teal-100">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-900 font-extrabold text-xs">Email Desk</div>
                    <div className="text-slate-500 font-medium mt-0.5">
                      care@shriyadental.com
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours Table */}
            <div className="mt-8 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-900">Clinic Timings</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open Today
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="font-medium text-slate-500">Monday – Saturday</span>
                  <span className="font-extrabold text-slate-800">09:00 AM – 08:30 PM</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-slate-500">Sunday</span>
                  <span className="font-extrabold text-amber-700">10:00 AM – 02:00 PM (Emergency)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Direct Patient Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
                Direct Appointment Inquiry
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 tracking-tight">
                Request a Callback or Treatment Consultation
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Have questions regarding treatment plans, insurance, or doctor availability? Fill out this quick form and our clinical coordinator will reach out promptly.
              </p>

              {formSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-base font-extrabold">Thank You, {inquiryName}!</h4>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    Your consultation request has been received. Our Shriya Dental coordinator will contact you at <strong>{inquiryPhone}</strong> shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Treatment of Interest
                    </label>
                    <select
                      value={inquiryService}
                      onChange={(e) => setInquiryService(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                    >
                      <option value="Dental Implants">Dental Implants & Fixed Teeth</option>
                      <option value="Root Canal Treatment">Painless Single-Sitting Root Canal</option>
                      <option value="Invisalign & Clear Aligners">Invisalign & Clear Aligners</option>
                      <option value="Teeth Whitening">Laser Teeth Whitening</option>
                      <option value="Zirconia Crowns">Zirconia Aesthetic Crowns</option>
                      <option value="Kids Dentistry">Pediatric & Child Dental Care</option>
                      <option value="General Checkup & Scaling">Routine Scaling & Oral Examination</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Notes or Preferred Date / Time
                    </label>
                    <textarea
                      rows={3}
                      value={inquiryNotes}
                      onChange={(e) => setInquiryNotes(e.target.value)}
                      placeholder="Mention any symptoms, tooth discomfort, or preferred visit timings..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Send Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-400">
                      🔒 Your medical data is strictly confidential.
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 9. SITE FOOTER                                                        */}
      {/* ===================================================================== */}
      <footer className="px-4 pt-10 pb-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Brand column */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  🦷
                </div>
                <div>
                  <span className="text-base font-black text-slate-900 tracking-tight block leading-tight">
                    Shriya
                  </span>
                  <span className="text-[10px] font-bold text-teal-700 block tracking-wider uppercase">
                    Multispeciality Dental Clinic
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Premier center for painless laser dentistry, microscopic endodontics, dental implants, and digital smile design. Committed to clinical excellence and genuine care.
              </p>
              <div className="text-xs text-slate-600 font-semibold">
                Emergency Helpline: <a href="tel:+919800012345" className="text-teal-700 font-bold hover:underline">+91 98000 12345</a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-2.5 text-xs">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider block text-[11px]">
                Treatments
              </span>
              <ul className="space-y-1.5 text-slate-500 font-medium">
                <li><button onClick={() => scrollToSection('services')} className="hover:text-teal-700 cursor-pointer">Dental Implants</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-teal-700 cursor-pointer">Invisalign Clear Aligners</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-teal-700 cursor-pointer">Single Sitting RCT</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-teal-700 cursor-pointer">Laser Whitening</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-teal-700 cursor-pointer">Zirconia Crowns</button></li>
              </ul>
            </div>

            {/* Clinic Info & Staff Access */}
            <div className="md:col-span-4 space-y-2.5 text-xs">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider block text-[11px]">
                Clinic Access
              </span>
              <p className="text-slate-500 leading-relaxed">
                Suite 402, Shriya Healthcare Plaza, Metro Station Road.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedConcern(undefined);
                    setShowEnquiryModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation / Enquire</span>
                </button>
              </div>
              <div className="pt-2">
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/admin');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[11px] font-semibold transition-colors"
                >
                  <span>Staff & Administration EMR Login →</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              © {new Date().getFullYear()} Shriya Multispeciality Dental Clinic. All clinical rights reserved.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>NABH & ISO 9001 Compliant</span>
              <span>•</span>
              <span>100% Autoclaved Equipment</span>
            </div>
          </div>
        </div>
      </footer>

      {/* PATIENT CONSULTATION & APPOINTMENT ENQUIRY MODAL */}
      <PatientEnquiryModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        defaultConcern={selectedConcern}
      />

      {/* MOBILE PUBLIC APP BAR (Pinned at bottom of mobile screens) */}
      <MobilePublicBar onOpenEnquiry={() => setShowEnquiryModal(true)} />
    </div>
  );
};
