import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Briefcase, Heart, Zap, Monitor, 
  Coffee, Globe, ArrowRight, MapPin, 
  Clock, CheckCircle2, Search
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

// --- Data: Benefits ---
const BENEFITS = [
  {
    icon: Globe,
    title: "Remote-First",
    desc: "Work from anywhere in the US. We care about output, not hours in a chair."
  },
  {
    icon: Heart,
    title: "100% Health Coverage",
    desc: "We cover 100% of premiums for Medical, Dental, and Vision for you and your family."
  },
  {
    icon: Zap,
    title: "Competitive Equity",
    desc: "Every employee gets stock options. When we win, you win."
  },
  {
    icon: Coffee,
    title: "Unlimited PTO",
    desc: "Take the time you need to recharge. We trust you to manage your schedule."
  }
];

// --- Data: Open Positions ---
const JOBS = [
  {
    id: 1,
    title: "Senior Full Stack Engineer",
    dept: "Engineering",
    loc: "Remote (US)",
    type: "Full-time",
    tags: ["React", "Node.js", "PostgreSQL"]
  },
  {
    id: 2,
    title: "Product Designer (UX/UI)",
    dept: "Product",
    loc: "Austin, TX / Remote",
    type: "Full-time",
    tags: ["Figma", "Design Systems"]
  },
  {
    id: 3,
    title: "Mortgage Loan Officer",
    dept: "Sales",
    loc: "Remote (US)",
    type: "Commission + Base",
    tags: ["NMLS Required", "Inbound Leads"]
  },
  {
    id: 4,
    title: "Customer Success Manager",
    dept: "Operations",
    loc: "Remote (US)",
    type: "Full-time",
    tags: ["Support", "Onboarding"]
  }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>Careers | Join HomeRatesYard</title>
        <meta name="description" content="Join our mission to simplify homeownership. View open positions in Engineering, Product, Sales, and Operations." />
      </Head>

      <main>
        
        {/* 1. HERO SECTION (Compact) */}
        <section className="relative h-[200px] md:h-[240px] flex items-center justify-center overflow-hidden bg-red-900">
          {/* Stock Image */}
          <img 
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop" 
            alt="Team brainstorming" 
            className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-overlay"
          />
          {/* Brand Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-600 opacity-90 mix-blend-multiply"></div>
          
          {/* Content */}
          <div className="relative z-10 px-4 mt-6 text-center">
            <h1 className="flex items-center justify-center gap-3 mb-2 text-3xl font-bold text-white md:text-5xl font-display drop-shadow-md">
              <Briefcase size={36} className="text-white/80" />
              Join the Mission
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-medium text-white/90">
              Help us build the future of mortgage lending.
            </p>
          </div>
        </section>

        {/* 2. CULTURE & BENEFITS */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl text-slate-900 font-display">
                Why work here?
              </h2>
              <p className="max-w-4xl mx-auto text-lg text-slate-600">
                We believe happy people build better products. We invest heavily in our team's well-being and growth.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((benefit, idx) => (
                <div key={idx} className="p-6 transition-all bg-white border shadow-sm border-slate-100 rounded-3xl hover:shadow-md group">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-600 transition-colors bg-red-50 rounded-2xl group-hover:bg-red-600 group-hover:text-white">
                    <benefit.icon size={24} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. OPEN POSITIONS */}
        <section className="py-24 bg-slate-50">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="flex flex-col justify-between gap-4 mb-12 md:flex-row md:items-end">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-slate-900 font-display">Open Roles</h2>
                <p className="text-slate-600">We are currently hiring for the following positions.</p>
              </div>
              <div className="relative">
                <Search size={18} className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search roles..." 
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 w-full md:w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {JOBS.map((job) => (
                <div key={job.id} className="flex flex-col justify-between gap-6 p-6 transition-all bg-white border shadow-sm cursor-pointer group rounded-2xl border-slate-200 hover:shadow-md hover:border-red-200 md:flex-row md:items-center">
                  
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold transition-colors text-slate-900 group-hover:text-red-600">
                        {job.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                        {job.dept}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} /> {job.loc}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} /> {job.type}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mt-4">
                      {job.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs border rounded-md bg-slate-50 text-slate-500 border-slate-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div>
                    <button className="flex items-center gap-2 px-6 py-3 font-bold text-white transition-all shadow-lg bg-slate-900 rounded-xl group-hover:bg-red-600 active:scale-95">
                      Apply Now <ArrowRight size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* General Application */}
            <div className="p-8 mt-12 text-center text-white shadow-xl bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl">
              <h3 className="mb-3 text-2xl font-bold text-white">Don't see the right fit?</h3>
              <p className="max-w-lg mx-auto mb-8 text-slate-300">
                We are always looking for talented individuals. Send us your resume and tell us how you can make an impact.
              </p>
              <button className="px-8 py-3 font-bold transition-colors bg-white rounded-md text-slate-900 hover:bg-slate-50">
                Email General Application
              </button>
            </div>

          </div>
        </section>

        <FinalCTA />
      </main>
    </div>
  );
}

CareersPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;