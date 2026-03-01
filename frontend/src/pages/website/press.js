import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Newspaper, Download, Mail, ExternalLink, 
  Mic, Image as ImageIcon, FileText, ArrowRight
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

// --- Data: Press Releases ---
const RELEASES = [
  {
    id: 1,
    date: "October 24, 2023",
    title: "HomeRatesYard Raises Series B to Automate Mortgage Underwriting",
    desc: "The $50M round was led by Sequoia Capital with participation from existing investors.",
    link: "#"
  },
  {
    id: 2,
    date: "August 15, 2023",
    title: "Introducing 'Verified Approval': The 14-Minute Mortgage Commitment",
    desc: "Our new AI-driven engine allows borrowers to lock rates and get fully approved in record time.",
    link: "#"
  },
  {
    id: 3,
    date: "May 10, 2023",
    title: "HomeRatesYard Expansion: Now Licensed in All 50 States",
    desc: "We have officially completed our nationwide expansion, bringing fair lending to every corner of the US.",
    link: "#"
  }
];

// --- Data: Media Assets ---
const ASSETS = [
  {
    icon: ImageIcon,
    title: "Logo Pack",
    format: "PNG, SVG, EPS",
    size: "12 MB"
  },
  {
    icon: FileText,
    title: "Brand Guidelines",
    format: "PDF",
    size: "4.5 MB"
  },
  {
    icon: Mic,
    title: "Executive Headshots",
    format: "JPG (High Res)",
    size: "25 MB"
  }
];

export default function PressPage() {
  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>Press Room | HomeRatesYard</title>
        <meta name="description" content="Latest news, press releases, and media assets from HomeRatesYard." />
      </Head>

      <main>
        
        {/* 1. HERO SECTION (Compact) */}
        <section className="relative h-[200px] md:h-[240px] flex items-center justify-center overflow-hidden bg-red-900">
          {/* Stock Image */}
          <img 
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1400&auto=format&fit=crop" 
            alt="News and Media" 
            className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-overlay"
          />
          {/* Brand Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-600 opacity-90 mix-blend-multiply"></div>
          
          {/* Content */}
          <div className="relative z-10 px-4 mt-6 text-center">
            <h1 className="flex items-center justify-center gap-3 mb-2 text-3xl font-bold text-white md:text-5xl font-display drop-shadow-md">
              <Newspaper size={36} className="text-white/80" />
              Press Room
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-medium text-white/90">
              News, updates, and resources for the media.
            </p>
          </div>
        </section>

        {/* 2. PRESS CONTACT & INTRO */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="container max-w-5xl px-4 mx-auto">
            <div className="flex flex-col items-center justify-between gap-8 p-8 border md:flex-row bg-slate-50 rounded-3xl border-slate-200">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-slate-900">Media Inquiries</h2>
                <p className="max-w-md text-slate-500">
                  For interview requests, commentary on mortgage trends, or company data, please contact our comms team.
                </p>
              </div>
              <a href="mailto:press@homeratesyard.com">
                <button className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all rounded-md shadow-lg bg-slate-900 hover:bg-slate-800 active:scale-95">
                  <Mail size={18} /> press@homeratesyard.com
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* 3. LATEST NEWS */}
        <section className="py-20 bg-slate-50">
          <div className="container max-w-5xl px-4 mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 font-display">Press Releases</h2>
                <p className="mt-2 text-slate-500">Our latest announcements and milestones.</p>
              </div>
            </div>

            <div className="space-y-6">
              {RELEASES.map((item) => (
                <div key={item.id} className="flex flex-col gap-6 p-8 transition-all bg-white border shadow-sm group rounded-3xl border-slate-200 hover:shadow-md hover:border-red-200 md:flex-row">
                  
                  <div className="flex-shrink-0 md:w-48">
                    <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full bg-slate-100 text-slate-600">
                      {item.date}
                    </span>
                  </div>

                  <div className="flex-grow">
                    <h3 className="mb-2 text-xl font-bold transition-colors text-slate-900 group-hover:text-red-600">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-slate-500">
                      {item.desc}
                    </p>
                    <Link href={item.link} className="inline-flex items-center text-sm font-bold text-red-600 hover:text-red-700 group/link">
                      Read Full Story <ExternalLink size={14} className="ml-2 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. MEDIA KIT (Downloadable Assets) */}
        <section className="py-20 bg-white border-t border-slate-200">
          <div className="container max-w-5xl px-4 mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 font-display">Media Kit</h2>
              <p className="mt-2 text-slate-500">Official assets for use in digital and print media.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {ASSETS.map((asset, idx) => (
                <div key={idx} className="p-6 transition-all border cursor-pointer bg-slate-50 rounded-2xl border-slate-100 hover:border-slate-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white shadow-sm rounded-xl text-slate-700">
                      <asset.icon size={24} />
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 transition-colors rounded-full bg-slate-200 text-slate-500 group-hover:bg-red-600 group-hover:text-white">
                      <Download size={16} />
                    </div>
                  </div>
                  <h4 className="mb-1 font-bold text-slate-900">{asset.title}</h4>
                  <p className="text-xs text-slate-500">{asset.format} • {asset.size}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FinalCTA />
      </main>
    </div>
  );
}

PressPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;