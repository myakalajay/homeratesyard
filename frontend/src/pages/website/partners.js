import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
// IMPORT SAFETY: Using only standard, stable icons to prevent version crashes
import { 
  Users, Home, Briefcase, Code, 
  ArrowRight, Check, Zap, FileText 
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

// --- Data: Partner Segments ---
const PARTNER_TYPES = [
  {
    icon: Home, 
    title: "Real Estate Agents",
    desc: "Close deals faster. Get real-time status updates and co-branded pre-approval letters generated instantly for your clients.",
    features: ["Co-branded landing pages", "Real-time loan tracking", "Weekend support"]
  },
  {
    icon: Briefcase,
    title: "Home Builders",
    desc: "Keep your inventory moving. Our preferred lender program ensures your buyers get approved quickly so you can pour concrete sooner.",
    features: ["Extended rate locks", "Builder forward commitments", "Dedicated operations team"]
  },
  {
    icon: Code,
    title: "FinTech & Platforms",
    desc: "Embed mortgage capabilities directly into your app. Use our robust API to offer rates, affordability calcs, and applications.",
    features: ["White-label API", "Seamless SSO", "Revenue share options"]
  }
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>Partners | Grow with HomeRatesYard</title>
        <meta name="description" content="Partner with HomeRatesYard. Solutions for Real Estate Agents, Builders, and FinTech platforms to accelerate closings." />
      </Head>

      <main>
        
        {/* 1. HERO SECTION (Compact Red Header) */}
        <section className="relative h-[200px] md:h-[260px] flex items-center justify-center overflow-hidden bg-red-900">
          {/* Stock Image */}
          <img 
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1400&auto=format&fit=crop" 
            alt="Business Partnership" 
            className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-overlay"
          />
          {/* Brand Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-600 opacity-90 mix-blend-multiply"></div>
          
          {/* Content */}
          <div className="relative z-10 px-4 mt-6 text-center">
            <h1 className="flex items-center justify-center gap-3 mb-2 text-3xl font-bold text-white font-display md:text-5xl drop-shadow-md">
              <Users size={36} className="text-white/80" /> 
              Partner Program
            </h1>
            <p className="max-w-2xl mx-auto text-lg font-medium text-white/90">
              Accelerate your business with the fastest lending platform in the industry.
            </p>
          </div>
        </section>

        {/* 2. VALUE PROP ("Why partner with us?") */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 font-display md:text-4xl">
                Why partner with us?
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-500">
                Your clients trust you to get them to the closing table. We provide the speed and transparency to make sure you look like a hero every time.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Card 1: Speed */}
              <div className="p-8 transition-all border shadow-sm bg-slate-50 rounded-3xl border-slate-100 hover:shadow-lg group">
                <div className="flex items-center justify-center mb-6 text-red-600 transition-transform bg-red-100 w-14 h-14 rounded-2xl group-hover:scale-110">
                  <Zap size={28} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">14-Day Closings</h3>
                <p className="leading-relaxed text-slate-500">
                  Our AI underwriting clears conditions in minutes, not days. We close loans faster than the industry average, helping you win competitive offers.
                </p>
              </div>

              {/* Card 2: Marketing */}
              <div className="p-8 transition-all border shadow-sm bg-slate-50 rounded-3xl border-slate-100 hover:shadow-lg group">
                <div className="flex items-center justify-center mb-6 text-orange-600 transition-transform bg-orange-100 w-14 h-14 rounded-2xl group-hover:scale-110">
                  <FileText size={28} /> 
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Marketing Suite</h3>
                <p className="leading-relaxed text-slate-500">
                  Access a library of co-branded flyers, social media assets, and open house kits. We handle the compliance; you handle the networking.
                </p>
              </div>

              {/* Card 3: Support */}
              <div className="p-8 transition-all border shadow-sm bg-slate-50 rounded-3xl border-slate-100 hover:shadow-lg group">
                <div className="flex items-center justify-center mb-6 text-blue-600 transition-transform bg-blue-100 w-14 h-14 rounded-2xl group-hover:scale-110">
                  <Users size={28} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Dedicated Support</h3>
                <p className="leading-relaxed text-slate-500">
                  You get a dedicated Loan Officer and Processor pod. No 1-800 numbers. Direct cell phone access for you and your clients, even on weekends.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PARTNER SEGMENTS */}
        <section className="py-24 bg-slate-50">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {PARTNER_TYPES.map((type, idx) => (
                <div key={idx} className="flex flex-col h-full p-8 transition-colors bg-white border shadow-sm rounded-[1rem] border-slate-200 hover:border-red-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 text-white rounded-md bg-slate-900">
                      <type.icon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{type.title}</h3>
                  </div>
                  
                  <p className="flex-grow mb-8 leading-relaxed text-slate-500">
                    {type.desc}
                  </p>

                  <div className="mb-8 space-y-3">
                    {type.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check size={18} className="mt-0.5 text-green-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 font-semibold transition-all border rounded-md border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                    Learn More
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. DEVELOPER / API HIGHLIGHT (Dark Mode) */}
        <section className="relative py-24 overflow-hidden text-white bg-slate-900">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="container relative z-10 max-w-6xl px-4 mx-auto">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              
              {/* Text Side */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-bold tracking-wider text-orange-400 uppercase border rounded-full border-orange-400/30 bg-orange-400/10">
                  <Code size={14} />
                  For Developers
                </div>
                <h2 className="mb-6 text-3xl font-bold text-white font-display md:text-4xl">
                  Build lending into your product.
                </h2>
                <p className="mb-8 leading-relaxed text-md text-slate-300">
                  Are you a PropTech platform or financial app? Use the HomeRatesYard API to instantly display live rates, generate pre-approval letters, and submit loan applications natively within your UI.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link 
                    href="/developer" 
                    className="flex items-center justify-center px-8 py-3 font-semibold transition-colors bg-white rounded-md text-slate-900 hover:bg-slate-100"
                  >
                    Read API Docs
                  </Link>
                  <Link 
                    href="/contact"
                    className="flex items-center justify-center px-8 py-3 font-medium text-white transition-colors border rounded-md border-slate-700 hover:bg-white/10"
                  >
                    Contact Partnerships
                  </Link>
                </div>
              </div>
              
              {/* Visual Side: Code Snippet */}
              <div className="p-6 overflow-hidden font-mono text-sm border shadow-2xl bg-slate-950 rounded-2xl border-slate-800">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="space-y-2 text-slate-400">
                  <p>
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-blue-400">quote</span> ={' '}
                    <span className="text-purple-400">await</span>{' '}
                    homeRatesYard.<span className="text-yellow-300">getRates</span>
                    {`({`}
                  </p>
                  <p className="pl-4">
                    <span className="text-blue-300">creditScore</span>:{' '}
                    <span className="text-orange-400">760</span>,
                  </p>
                  <p className="pl-4">
                    <span className="text-blue-300">zipCode</span>:{' '}
                    <span className="text-green-400">"20148"</span>,
                  </p>
                  <p className="pl-4">
                    <span className="text-blue-300">loanAmount</span>:{' '}
                    <span className="text-orange-400">450000</span>
                  </p>
                  <p>{`});`}</p>
                  <p className="pt-2 text-slate-500">// Returns live, lockable rates in &lt; 200ms</p>
                  <p>
                    console.<span className="text-yellow-300">log</span>(quote.<span className="text-blue-300">rates</span>);
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        <FinalCTA />
      </main>
    </div>
  );
}

PartnersPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;