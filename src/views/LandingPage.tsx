import { ModalLayer } from '../components/common/ModalLayer';
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
  AlertCircle,
  X,
  ZoomIn,
  MessageSquare,
  Scan,
  Smartphone,
  Download
} from 'lucide-react';
import { PatientEnquiryModal } from '../components/common/PatientEnquiryModal';

interface ClinicPhoto {
  src: string;
  title: string;
  subtitle: string;
  badge: string;
}

export interface SmileTransformationCase {
  id: string;
  src: string;
  title: string;
  category: 'Aesthetic Crowns' | 'Bridges & Dentures' | 'Full Arch Rehab' | 'Cosmetic Makeover';
  badge: string;
  procedure: string;
  diagnosis: string;
  outcome: string;
  highlights: string[];
}

export const SMILE_TRANSFORMATIONS: SmileTransformationCase[] = [
  {
    id: 'case-complete-dentures',
    src: '/images/case-complete-dentures.jpg',
    title: 'Complete Dentures & Full Arch Aesthetic Rehabilitation',
    category: 'Bridges & Dentures',
    badge: 'Complete Dentures',
    procedure: 'High-Precision Custom Complete Dentures & Occlusal Bite Reconstruction',
    diagnosis: 'Severe edentulism and multi-tooth loss causing chewing difficulty and sunken facial profile',
    outcome: 'Natural gum-shaded emergence profile, balanced bilateral bite, restored chewing comfort, and smile confidence',
    highlights: ['Natural Gum Shading', 'High-Impact Denture Base', 'Balanced Functional Bite']
  },
  {
    id: 'case-invisalign-aligners',
    src: '/images/case-invisalign-aligners.png',
    title: 'Invisalign® Clear Aligners Smile Transformation',
    category: 'Cosmetic Makeover',
    badge: 'Invisalign® Certified',
    procedure: '3D Digitally Simulated Clear Aligner Orthodontic Realignment',
    diagnosis: 'Dental spacing, crowding, and arch misalignment seeking a wire-free aesthetic solution',
    outcome: 'Discreet invisible alignment, easily removable for meals, and comfortable daily wear with zero brackets',
    highlights: ['Virtually Invisible', 'Easily Removable & Hygienic', 'Comfortable Custom Fit']
  },
  {
    id: 'case-anterior-aesthetic-crown',
    src: '/images/case-anterior-aesthetic-crown.jpg',
    title: 'Anterior Aesthetic Crown & Space Harmonization',
    category: 'Aesthetic Crowns',
    badge: 'Zirconia Aesthetic Crown',
    procedure: 'Precision Aesthetic Anterior Crown & Tooth Contour Alignment',
    diagnosis: 'Fractured, discolored upper central incisor with irregular spacing',
    outcome: 'Seamless biomimetic shade matching, natural translucency, and aligned smile line',
    highlights: ['Natural Translucency', 'Gingival Symmetry', 'Metal-Free Ceramic']
  },
  {
    id: 'case-full-arch-rehab',
    src: '/images/case-full-arch-rehab.jpg',
    title: 'Full Arch Aesthetic Smile Rehabilitation',
    category: 'Full Arch Rehab',
    badge: 'Multi-Unit Ceramic Rehabilitation',
    procedure: 'Full Arch Ceramic Crowns & Occlusal Reconstruction',
    diagnosis: 'Severe cervical abrasion, multi-tooth enamel wear, and deep dental caries',
    outcome: 'Rebuilt proper vertical dimension, restored biting comfort, and a radiant smile',
    highlights: ['Complete Arch Restructure', 'Zero-Metal Zirconia', 'Long-Lasting Function']
  },
  {
    id: 'case-anterior-fixed-bridge',
    src: '/images/case-anterior-fixed-bridge.jpg',
    title: 'Fixed Prosthodontic Bridge for Lower Incisors',
    category: 'Bridges & Dentures',
    badge: 'Fixed Dental Bridge',
    procedure: 'Precision Fixed Dental Bridge & Diastema Space Closure',
    diagnosis: 'Missing lower central incisors causing mastication and speech impediment',
    outcome: 'Complete functional restoration with natural contouring and stable occlusion',
    highlights: ['Fixed Non-Removable', 'Natural Emergence Profile', 'Enhanced Speech & Chewing']
  },
  {
    id: 'case-cosmetic-smile-design',
    src: '/images/case-cosmetic-smile-design.jpg',
    title: 'Cosmetic Smile Makeover & Fractured Incisor Repair',
    category: 'Cosmetic Makeover',
    badge: 'Digital Smile Makeover',
    procedure: 'Aesthetic Composite / Ceramic Smile Reconstruction',
    diagnosis: 'Traumatic chipped central incisor with midline gap and irregular enamel margins',
    outcome: 'Perfect symmetrical smile line with youthful translucency and tooth integrity',
    highlights: ['Minimally Invasive Design', 'Harmonious Lip Line', 'Instant Smile Confidence']
  },
  {
    id: 'case-partial-denture',
    src: '/images/case-partial-denture.jpg',
    title: 'Precision Flexible Partial Denture',
    category: 'Bridges & Dentures',
    badge: 'Flexible Prosthesis',
    procedure: 'Custom Gingiva-Shaded Removable Partial Denture',
    diagnosis: 'Missing lower incisor with localized periodontal tissue recession',
    outcome: 'Comfortable, non-invasive tooth replacement blending effortlessly with natural gums',
    highlights: ['Comfortable Flexible Fit', 'Gingiva-Matched Base', 'Quick Non-Surgical Solution']
  }
];

const CLINIC_GALLERY_PHOTOS: ClinicPhoto[] = [
  {
    src: '/images/clinic-operatory.jpg',
    title: 'Multi-Chair Clinical Operatory Suite',
    subtitle: 'Modern dental chairs, ergonomic lighting, and hygienic treatment bays.',
    badge: 'Operatory Suite'
  },
  {
    src: '/images/clinic-lounge.jpg',
    title: 'Patient Lounge & Consultation Suite',
    subtitle: 'Comfortable reception seating designed for calm, stress-free dental visits.',
    badge: 'Patient Lounge'
  },
  {
    src: '/images/clinic-entrance.jpg',
    title: 'Clinic Entrance & Waiting Hall',
    subtitle: 'Clean, welcoming waiting area with sanitization and hydration facilities.',
    badge: 'Waiting Area'
  },
  {
    src: '/images/clinic-exterior.jpg',
    title: 'Shriya Multispeciality Dental Clinic Exterior',
    subtitle: 'Easily accessible roadside clinic entrance on Pollachi Road, Kozhinjapara with clear signage.',
    badge: 'Clinic Location'
  }
];

interface GooglePatientReview {
  id: string;
  author: string;
  timeframe: string;
  isNew?: boolean;
  treatment: string;
  treatmentColor: string;
  rating: number;
  reviewText: string;
  avatarBg: string;
  avatarText: string;
}

const GOOGLE_PATIENT_REVIEWS: GooglePatientReview[] = [
  {
    id: 'rev-infant-letitia',
    author: 'Infant Letitia.L',
    timeframe: '2 months ago',
    treatment: 'Wisdom Tooth Surgeries',
    treatmentColor: 'bg-teal-50 text-teal-800 border-teal-200',
    rating: 5,
    avatarBg: 'bg-teal-600 text-white',
    avatarText: 'IL',
    reviewText:
      "I've had two wisdom tooth surgeries here, and honestly, both times I felt at ease knowing I was in good hands. The doctors and surgeons are incredibly skilled, but what I love most is how kind and warm everyone is — from the staff to the surgeons themselves. I've been going to this dental hospital for all my dental needs. This dental hospital truly feels like being cared for by people who genuinely want the best for you.\n\nEven something as small as a regular appointment feels comfortable here.\n\nHighly recommend this place if you want a dental hospital that truly looks after you!"
  },
  {
    id: 'rev-arjun-suresh',
    author: 'Arjun Suresh',
    timeframe: 'a month ago',
    treatment: 'Dental Cleaning & Checkup',
    treatmentColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rating: 5,
    avatarBg: 'bg-purple-600 text-white',
    avatarText: 'A',
    reviewText:
      "I had a wonderful experience at this clinic. The staff is incredibly friendly and welcoming from the moment you walk in. The dentist was thorough, gentle during the cleaning, and took the time to explain everything clearly. The clinic itself is modern, pristine, and very comfortable. Highly recommend to anyone looking for a reliable and stress-free dental practice!"
  },
  {
    id: 'rev-chandana',
    author: 'Chandana',
    timeframe: '2 months ago',
    treatment: 'Gentle Care & Service',
    treatmentColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    rating: 5,
    avatarBg: 'bg-indigo-600 text-white',
    avatarText: 'C',
    reviewText:
      "Good experience at the clinic. The doctor and staff were very kind and friendly. The treatment was done with good care. Thank you for the wonderful service"
  },
  {
    id: 'rev-blackie',
    author: 'Blackie',
    timeframe: '2 weeks ago',
    isNew: true,
    treatment: 'Orthodontics & Braces',
    treatmentColor: 'bg-amber-50 text-amber-800 border-amber-200',
    rating: 5,
    avatarBg: 'bg-emerald-700 text-white',
    avatarText: 'B',
    reviewText:
      "New braces, zero hassle, and amazing results! Loving my experience at Shriya Multispeciality Dental Clinic & Orthodontic Centre. 😁 🎉"
  }
];

export const LandingPage: React.FC = () => {
  const { doctors, services, setActiveView, addEnquiry } = useApp();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryService, setInquiryService] = useState('Dental Implants');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState<string | undefined>(undefined);
  const [lightboxPhoto, setLightboxPhoto] = useState<ClinicPhoto | null>(null);
  const [selectedTransformationCategory, setSelectedTransformationCategory] = useState<string>('All');
  const [lightboxCase, setLightboxCase] = useState<SmileTransformationCase | null>(null);

  const serviceIcons: Record<string, React.ReactNode> = {
    Stethoscope: <Stethoscope className="w-5 h-5 text-teal-700" />,
    Sparkles: <Sparkles className="w-5 h-5 text-emerald-600" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-teal-700" />,
    CircleDot: <CircleDot className="w-5 h-5 text-teal-700" />,
    Smile: <Smile className="w-5 h-5 text-emerald-700" />,
    Zap: <Zap className="w-5 h-5 text-amber-600" />
  };

  // Dynamic specialist list from clinic database
  const displaySpecialists = doctors;

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
    <div className="public-site flex flex-col gap-14 sm:gap-20 pb-28 sm:pb-20">
      {/* ===================================================================== */}
      {/* 1. HERO SECTION                                                      */}
      {/* ===================================================================== */}
      <section className="public-hero">

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start gap-5 sm:gap-6">
            <h1>Shriya Dental Clinic</h1>
            <p className="text-base sm:text-lg text-slate-700 max-w-xl">Specialist dental care in Kozhinjampara, Palakkad. Book a consultation for preventive care, root canals, implants or aligners.</p>
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full pt-1">
              <button
                onClick={() => {
                  setSelectedConcern('Routine Dental Checkup & Consultation');
                  setShowEnquiryModal(true);
                }}
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-xl bg-teal-700 hover:from-teal-800 hover:to-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-900/15 hover:shadow-teal-900/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Consultation</span>
              </button>

              <button
                onClick={() => scrollToSection('services')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>Explore Specialities</span>
              </button>

              <div className="flex basis-full flex-wrap items-center gap-2 text-xs font-semibold">
                <a
                  href="tel:+919400320890"
                  className="inline-flex items-center gap-1.5 text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100/80 px-3 py-2 rounded-xl border border-teal-200 transition-colors"
                  title="Call Reception"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  <span>Reception: 9400320890</span>
                </a>
                <a
                  href="tel:+917904221656"
                  className="inline-flex items-center gap-1.5 text-rose-800 hover:text-rose-950 bg-rose-50 hover:bg-rose-100/80 px-3 py-2 rounded-xl border border-rose-200 transition-colors"
                  title="Call Emergency"
                >
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  <span>Emergency: 7904221656</span>
                </a>
              </div>
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
                <span>Gentle Patient Care</span>
              </div>
            </div>
          </div>

          {/* Right Visual Area: Real Clinic Photo */}
          <figure className="lg:col-span-5"><img src="/images/clinic-lounge.jpg" alt="Patient lounge at Shriya Dental Clinic" fetchPriority="high" /><figcaption>Shriya Dental · Patient lounge</figcaption></figure>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. EMERGENCY & SAME-DAY APPOINTMENT RIBBON                            */}
      {/* ===================================================================== */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto rounded-2xl bg-teal-900 text-white p-4 sm:p-5 shadow-lg flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-tight text-white flex flex-wrap items-center gap-2">
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

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full xl:w-auto">
            <a
              href="tel:+917904221656"
              className="flex-1 md:flex-none text-center px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Emergency: 7904221656</span>
            </a>
            <a
              href="tel:+919400320890"
              className="flex-1 md:flex-none text-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
            >
              📞 Reception: 9400320890
            </a>
            <button
              onClick={() => setActiveView('booking')}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-sm"
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
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs text-center">
            <div className="text-2xl sm:text-4xl font-black text-teal-800">10+</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Years of Dental Excellence</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Serving families since 2015</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs text-center">
            <div className="text-2xl sm:text-4xl font-black text-emerald-700">12,500+</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Smiles Restored</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Implants, aligners & root canals</div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs text-center">
            <div className="text-2xl sm:text-4xl font-black text-amber-500 flex items-center justify-center gap-1">
              <span>4.9</span>
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div className="text-xs font-bold text-slate-600 mt-1">Google Patient Rating</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Over 2,400+ verified reviews</div>
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
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Duration</span>
                      <span className="text-xs font-extrabold text-slate-700">{srv.duration}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                    Specialist Care
                  </span>
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
        <div className="max-w-7xl mx-auto bg-slate-50 rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200 shadow-sm">
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
                    <h4 className="text-sm font-extrabold text-slate-900">Comprehensive Hygiene & Sterilization</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Every surgical instrument undergoes ultrasonic pre-cleansing, medical autoclaving, and sealed pouch validation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Low-Radiation 2D Digital Imaging</h4>
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
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5">
                  <Scan className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Digital 2D Scans</h4>
                <p className="text-[11px] text-slate-500 mt-1">High-definition chairside digital imaging with instant diagnostic clarity.</p>
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
      {/* 5B. CLINIC PHOTO TOUR & FACILITIES GALLERY                            */}
      {/* ===================================================================== */}
      <section id="clinic-gallery" className="px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-extrabold text-teal-800 uppercase tracking-widest px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              Inside Our Clinic
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Tour Shriya Multispeciality Dental Clinic
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-2">
              Take a look inside our spotless operatory suites, comfortable waiting lounge, and easily accessible clinic entrance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {CLINIC_GALLERY_PHOTOS.map((photo) => (
              <div
                key={photo.src}
                onClick={() => setLightboxPhoto(photo)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/15 to-transparent" />

                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-teal-800 text-[10px] font-black uppercase tracking-wider shadow-xs">
                    {photo.badge}
                  </span>

                  <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/50 backdrop-blur-sm text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" />
                  </span>

                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                    <h3 className="text-sm sm:text-base font-extrabold leading-snug">
                      {photo.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-200 mt-0.5 line-clamp-2">
                      {photo.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5C. REAL PATIENT SMILE TRANSFORMATIONS (BEFORE & AFTER)              */}
      {/* ===================================================================== */}
      <section id="transformations" className="px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold text-teal-800 uppercase tracking-widest px-3 py-1 rounded-full bg-teal-50 border border-teal-200 inline-flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real Patient Results • Shriya Dental Clinic</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Smile Transformations (Before & After)
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-2 leading-relaxed">
              Explore actual clinical cases completed by our specialist dental surgeons — restoring natural aesthetics, healthy bite function, and radiant patient confidence.
            </p>

            {/* Category Filter Pills (Mobile Scrollable) */}
            <div className="mt-6 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
              {['All', 'Aesthetic Crowns', 'Full Arch Rehab', 'Bridges & Dentures', 'Cosmetic Makeover'].map((cat) => {
                const count = cat === 'All' 
                  ? SMILE_TRANSFORMATIONS.length 
                  : SMILE_TRANSFORMATIONS.filter((c) => c.category === cat).length;
                const isSelected = selectedTransformationCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedTransformationCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-800 shadow-md shadow-teal-900/20 scale-102'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transformations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SMILE_TRANSFORMATIONS
              .filter((c) => selectedTransformationCategory === 'All' || c.category === selectedTransformationCategory)
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col group"
                >
                  {/* Before & After Case Image */}
                  <div
                    onClick={() => setLightboxCase(c)}
                    className="relative aspect-[4/5] w-full bg-slate-950 overflow-hidden cursor-pointer"
                    title="Click to view full high-resolution case photos"
                  >
                    <img
                      src={c.src}
                      alt={c.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-teal-800 text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/50">
                        {c.badge}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 border border-emerald-500/40">
                        <Sparkles className="w-3 h-3 text-emerald-300" />
                        <span>Before & After</span>
                      </span>
                    </div>

                    {/* Quick Zoom Trigger Pill */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5 text-teal-300" />
                      <span>Inspect Result</span>
                    </div>
                  </div>

                  {/* Case Clinical Card Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug group-hover:text-teal-800 transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-xs font-bold text-teal-700 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{c.procedure}</span>
                      </p>
                    </div>

                    {/* Clinical Diagnosis vs Outcome Details */}
                    <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <div className="text-slate-600">
                          <strong className="text-slate-800">Initial Issue:</strong> {c.diagnosis}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <div className="text-slate-700">
                          <strong className="text-emerald-800">Result Achieved:</strong> {c.outcome}
                        </div>
                      </div>
                    </div>

                    {/* Highlights Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md bg-teal-50/80 text-teal-800 font-bold text-[10px] border border-teal-200/50"
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setLightboxCase(c)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                        <span>Enlarge Photos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedConcern(`Smile Transformation: ${c.title}`);
                          setShowEnquiryModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Similar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Social Proof Trust Banner */}
          <div className="rounded-3xl bg-teal-900 p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center lg:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/30">
                Personalized Smile Consultation
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Want a Similar Smile Transformation?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Our specialist dental team crafts customized digital smile plans with digital mockups, natural shade selection, and gentle clinical execution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedConcern('Full Smile Makeover / Aesthetic Consultation');
                  setShowEnquiryModal(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:shadow-emerald-500/25 hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Smile Analysis</span>
              </button>
              <a
                href="https://wa.me/919400320890?text=Hello%20Shriya%20Dental!%20I%20would%20like%20to%20enquire%20about%20a%20Smile%20Transformation%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Doctor</span>
              </a>
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

          {displaySpecialists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displaySpecialists.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-3 border-2 border-slate-100 shadow-xs group-hover:scale-105 transition-transform relative flex items-center justify-center bg-teal-50">
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
                    <div className={`w-full h-full flex flex-col items-center justify-center bg-teal-700 text-white ${doc.avatar && (doc.avatar.startsWith('data:') || doc.avatar.startsWith('http')) && !doc.avatar.includes('photo-1559839734') ? 'hidden' : ''}`}>
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
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Clinical Consultations</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Our certified dental doctors and surgeons are available for consultations and advanced clinical procedures. Book an appointment online or contact our front desk.
              </p>
              <button
                onClick={() => {
                  setSelectedConcern('General Dental Consultation');
                  setShowEnquiryModal(true);
                }}
                className="mt-4 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Clinical Appointment</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. VERIFIED PATIENT REVIEWS & TESTIMONIALS                           */}
      {/* ===================================================================== */}
      <section id="testimonials" className="px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200 inline-flex items-center gap-1.5 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Real Google Patient Reviews</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Words From Our Happy Patients
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Authentic verified reviews from patients treated at Shriya Multispeciality Dental Clinic & Orthodontic Centre.
            </p>
            <div className="mt-3 flex items-center justify-center">
              <a
                href="https://share.google/hYmPWXJH4JB4OxuM2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-teal-800 bg-teal-50 hover:bg-teal-100 px-3.5 py-1.5 rounded-full border border-teal-200 transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <strong className="text-slate-900">5.0 Rating</strong>
                </span>
                <span className="text-teal-400">•</span>
                <span>Verified Google Reviews</span>
                <span className="text-teal-700 underline font-bold ml-1">View on Google Maps →</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {GOOGLE_PATIENT_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rev.isNew && (
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                          New
                        </span>
                      )}
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${rev.treatmentColor}`}>
                        {rev.treatment}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    "{rev.reviewText}"
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${rev.avatarBg} flex items-center justify-center font-black text-sm shrink-0 shadow-2xs`}
                    >
                      {rev.avatarText}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-slate-900">
                        {rev.author}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <span>1 review</span>
                        <span>•</span>
                        <span>{rev.timeframe}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 shrink-0">
                    <span>Google</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              </div>
            ))}
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
                    <div className="text-slate-900 font-extrabold text-xs">Clinic Location & Directions</div>
                    <div className="text-slate-600 font-medium mt-0.5 leading-relaxed">
                      <strong>Shriya Multispeciality Dental Clinic</strong><br />
                      Pollachi Road, Kozhinjapara, Palakkad.
                    </div>
                    <div className="mt-2">
                      <a
                        href="https://share.google/hYmPWXJH4JB4OxuM2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition-colors shadow-2xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-teal-700" />
                        <span>Open in Google Maps →</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 shrink-0 border border-emerald-100">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="w-full">
                    <div className="text-slate-900 font-extrabold text-xs">Reception & Emergency Helpline</div>
                    <div className="mt-1.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-black uppercase border border-teal-200">
                          Reception
                        </span>
                        <a
                          href="tel:+919400320890"
                          className="font-mono font-bold text-slate-800 hover:text-teal-700 transition-colors"
                        >
                          +91 94003 20890
                        </a>
                      </div>
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-black uppercase border border-rose-200">
                          Emergency 24/7
                        </span>
                        <a
                          href="tel:+917904221656"
                          className="font-mono font-bold text-rose-700 hover:text-rose-900 transition-colors"
                        >
                          +91 79042 21656
                        </a>
                      </div>
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
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
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
              <div className="text-xs text-slate-600 font-semibold space-y-1">
                <div>
                  Reception Desk: <a href="tel:+919400320890" className="text-teal-700 font-bold hover:underline">+91 94003 20890</a>
                </div>
                <div>
                  Emergency Helpline: <a href="tel:+917904221656" className="text-rose-700 font-bold hover:underline">+91 79042 21656</a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-2.5 text-xs">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider block text-[11px]">
                Treatments
              </span>
              <ul className="space-y-1.5 text-slate-500 font-medium">
                <li><button onClick={() => scrollToSection('transformations')} className="hover:text-teal-700 cursor-pointer font-bold text-teal-800">✨ Smile Transformations (Before & After)</button></li>
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
                Shriya Multispeciality Dental Clinic<br />
                Pollachi Road, Kozhinjapara, Palakkad.
              </p>
              <div className="pt-1 flex flex-col gap-1.5">
                <a
                  href="https://share.google/hYmPWXJH4JB4OxuM2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 hover:text-teal-800 font-bold text-xs inline-flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Google Maps Location →</span>
                </a>
                <a
                  href="https://github.com/drebin2331-alt/ShriyaClinic/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-extrabold text-xs inline-flex items-center gap-1 hover:underline"
                >
                  <Smartphone className="w-3 h-3 text-emerald-600" />
                  <span>📱 Download Android APK App</span>
                </a>
              </div>
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

      {/* CLINIC PHOTO LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <ModalLayer onDismiss={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              aria-label="Close photo preview"
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-slate-900/75 text-white hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-slate-900 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={lightboxPhoto.src}
                alt={lightboxPhoto.title}
                className="w-full h-full max-h-[75vh] object-contain"
              />
            </div>
            <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full mb-1">
                  {lightboxPhoto.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{lightboxPhoto.title}</h3>
                <p className="text-sm text-slate-600">{lightboxPhoto.subtitle}</p>
              </div>
            </div>
          </div>
        </ModalLayer>
      )}

      {/* SMILE TRANSFORMATION CASE LIGHTBOX MODAL */}
      {lightboxCase && (
        <ModalLayer onDismiss={() => setLightboxCase(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
          onClick={() => setLightboxCase(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxCase(null)}
              aria-label="Close case detail"
              className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* High-Resolution Clinical Photography */}
            <div className="relative bg-slate-950 flex items-center justify-center max-h-[55vh] sm:max-h-[60vh] overflow-hidden">
              <img
                src={lightboxCase.src}
                alt={lightboxCase.title}
                className="w-full h-full max-h-[55vh] sm:max-h-[60vh] object-contain"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 border border-emerald-500/40">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>Clinical Before & After</span>
              </span>
            </div>

            {/* Case Details & Action Strip */}
            <div className="p-5 sm:p-6 space-y-4 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {lightboxCase.badge}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {lightboxCase.title}
                  </h3>
                  <p className="text-xs font-bold text-teal-700 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                    <span>{lightboxCase.procedure}</span>
                  </p>
                </div>
              </div>

              {/* Clinical Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <div className="font-extrabold text-amber-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Initial Clinical Presentation:</span>
                  </div>
                  <p className="text-slate-600 pl-3.5">{lightboxCase.diagnosis}</p>
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Clinical Outcome & Result:</span>
                  </div>
                  <p className="text-slate-700 font-medium pl-3.5">{lightboxCase.outcome}</p>
                </div>
              </div>

              {/* Key Clinical Attributes */}
              <div className="flex flex-wrap gap-2 pt-1">
                {lightboxCase.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-[11px] border border-teal-200/60"
                  >
                    ✓ {h}
                  </span>
                ))}
              </div>

              {/* Consultation Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  Schedule a 1-on-1 consultation for customized smile evaluation.
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const concernTitle = lightboxCase.title;
                      setLightboxCase(null);
                      setSelectedConcern(`Smile Transformation: ${concernTitle}`);
                      setShowEnquiryModal(true);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-teal-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Similar Consultation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalLayer>
      )}

    </div>
  );
};
