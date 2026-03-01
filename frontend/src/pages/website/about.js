import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Zap, Shield, Heart, ArrowRight, Award, 
  Rocket, Users, Target, Globe, Building2
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

// --- Local Components ---

const ValueCard = ({ icon: Icon, title, desc }) => (
  <div className="p-8 transition-all bg-white border shadow-sm border-slate-100 rounded-3xl hover:shadow-xl hover:-translate-y-1 group">
    <div className="flex items-center justify-center w-12 h-12 mb-6 text-red-600 transition-colors rounded-2xl bg-red-50 group-hover:bg-red-600 group-hover:text-white">
      <Icon size={24} />
    </div>
    <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
    <p className="leading-relaxed text-slate-500">{desc}</p>
  </div>
);

const StatItem = ({ value, label }) => (
  <div className="text-center">
    <p className="mb-2 text-4xl font-extrabold text-transparent md:text-5xl bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
      {value}
    </p>
    <p className="text-xs font-bold tracking-widest uppercase text-slate-400">{label}</p>
  </div>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>About Us | HomeRatesYard</title>
        <meta name="description" content="We are redefining mortgage lending with AI-driven speed and human empathy. Learn about our mission to simplify homeownership." />
      </Head>

      <main>
        
        {/* 1. COMPACT HERO BANNER (Matches Calculators) */}
        <section className="relative h-[160px] md:h-[200px] flex items-center justify-center overflow-hidden bg-red-900">
          {/* Stock Image */}
          <img 
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1400&auto=format&fit=crop" 
            alt="Team Collaboration" 
            className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-overlay"
          />
          {/* Brand Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-600 opacity-90 mix-blend-multiply"></div>
          
          {/* Content */}
          <div className="relative z-10 px-4 mt-4 text-center">
            <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-white md:text-4xl font-display drop-shadow-md">
              <Rocket size={32} className="text-white/80" />
              About HomeRatesYard
            </h1>
          </div>
        </section>

        {/* 2. MISSION SECTION */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
              
              {/* Left: Text */}
              <div className="max-w-2xl duration-700 animate-in slide-in-from-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200 rounded-full bg-slate-100">
                  <Target size={12} />
                  Our Mission
                </div>
                
                <h2 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl font-display text-slate-900">
                  Mortgages shouldn't be <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                    rocket science.
                  </span>
                </h2>
                
                <p className="mb-8 leading-relaxed text-md text-slate-600">
                  We built HomeRatesYard because we were tired of the "Old Way" fax machines, hidden fees, and 45-day waiting periods. We combined modern AI with deep industry expertise to create the fastest, fairest lending experience on the planet.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/contact">
                    <button className="flex items-center gap-2 px-8 py-3 font-medium text-white transition-all transform bg-red-600 rounded-md shadow-lg hover:bg-red-700 active:scale-95">
                      Contact Us <ArrowRight size={18} />
                    </button>
                  </Link>
                  <Link href="/careers">
                    <button className="px-8 py-3 font-medium transition-all bg-white border rounded-md border-slate-200 text-slate-700 hover:bg-slate-50">
                      Join the Team
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right: Visual (Team Image) */}
              <div className="relative duration-700 delay-100 animate-in slide-in-from-right">
                <div className="relative overflow-hidden shadow-2xl rounded-[1rem] aspect-[4/3] group border-4 border-white">
                   <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop" 
                    alt="Diverse team collaborating in modern office" 
                    className="object-cover w-full h-full transition-transform duration-700 transform group-hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                   
                   {/* Floating Label */}
                   <div className="absolute text-white bottom-8 left-8">
                     <p className="mb-1 text-xs font-bold tracking-wider uppercase opacity-80">Headquarters</p>
                     <p className="flex items-center gap-2 text-2xl font-bold">
                       <Globe size={20} /> Austin, Texas
                     </p>
                   </div>
                </div>
                
                {/* Decor Blobs */}
                <div className="absolute w-64 h-64 bg-orange-100 rounded-full -top-12 -right-12 blur-3xl -z-10 opacity-60"></div>
                <div className="absolute w-64 h-64 bg-red-100 rounded-full -bottom-12 -left-12 blur-3xl -z-10 opacity-60"></div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. STATS STRIP (Clean & Minimal) */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
              <StatItem value="$2B+" label="Loans Funded" />
              <StatItem value="14 Days" label="Avg Closing Time" />
              <StatItem value="25k+" label="Happy Families" />
              <StatItem value="50+" label="Lending Partners" />
            </div>
          </div>
        </section>

        {/* 4. OUR VALUES */}
        <section className="py-24 bg-slate-50">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl font-display">What drives us.</h2>
              <p className="max-w-3xl mx-auto text-lg text-slate-600">
                We aren't just a tech company; we are a people company powered by automation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <ValueCard 
                icon={Zap}
                title="Radical Speed"
                desc="Time kills deals. By automating verification and underwriting, we let you close on your dream home before someone else does."
              />
              <ValueCard 
                icon={Shield}
                title="Unwavering Trust"
                desc="No bait-and-switch rates. No hidden fees. We display real-time, lockable rates instantly—no login required."
              />
              <ValueCard 
                icon={Heart}
                title="Human Empathy"
                desc="Buying a home is emotional. Our Loan Officers aren't salespeople; they are advisors incentivized by your satisfaction."
              />
            </div>
          </div>
        </section>

        {/* 5. ORIGIN STORY (Dark Mode) */}
        <section className="py-24 bg-white">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="relative p-10 md:p-20 bg-slate-900 rounded-[1rem] text-white overflow-hidden shadow-2xl">
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-bold tracking-wider text-orange-400 uppercase border rounded-full border-orange-400/30 bg-orange-400/10">
                    <Award size={14} />
                    Our Origin Story
                  </div>
                  <h2 className="mb-6 text-4xl font-bold leading-tight text-transparent font-display bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                    From Frustration <br/> to Innovation.
                  </h2>
                  <div className="space-y-6 text-lg leading-relaxed text-slate-300">
                    <p>
                      In 2022, our founder tried to refinance his home. Despite excellent credit, the bank asked for the same document four times. The process took 60 days, and he lost his rate lock.
                    </p>
                    <p>
                      He realized the mortgage industry hadn't changed since the 90s. It was built on paper, phone tag, and opacity.
                    </p>
                    <p className="font-semibold text-white">
                      HomeRatesYard was born to fix that. We replaced the fax machine with APIs, the bias with algorithms, and the waiting with winning.
                    </p>
                  </div>
                </div>

                {/* Story Image */}
                <div className="relative h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                   <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop" 
                    alt="Handshake deal success" 
                    className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 opacity-90 hover:scale-105"
                   />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TEAM / CULTURE */}
        <section className="py-24 border-t bg-slate-50 border-slate-200">
          <div className="container max-w-5xl px-4 mx-auto text-center">
            <h2 className="mb-6 text-3xl font-bold text-slate-900 md:text-4xl font-display">Built by builders.</h2>
            <p className="max-w-2xl mx-auto mb-12 text-lg text-slate-500">
              Our team comes from top tech companies and leading financial institutions. We are united by a single goal: Making homeownership accessible to everyone.
            </p>
            
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
               {/* Team Member 1 */}
               <div className="relative overflow-hidden transition-all shadow-sm aspect-square rounded-3xl bg-slate-200 group hover:shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop" 
                    alt="Executive Team" 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 flex items-end p-4 transition-opacity opacity-0 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100">
                    <span className="text-sm font-bold text-white">CEO & Founder</span>
                  </div>
               </div>

               {/* Team Member 2 */}
               <div className="relative overflow-hidden transition-all shadow-sm aspect-square rounded-3xl bg-slate-200 group hover:shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" 
                    alt="Head of Engineering" 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 flex items-end p-4 transition-opacity opacity-0 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100">
                    <span className="text-sm font-bold text-white">Head of Eng</span>
                  </div>
               </div>

               {/* Team Member 3 */}
               <div className="relative overflow-hidden transition-all shadow-sm aspect-square rounded-3xl bg-slate-200 group hover:shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop" 
                    alt="Product Lead" 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 flex items-end p-4 transition-opacity opacity-0 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100">
                    <span className="text-sm font-bold text-white">Product Lead</span>
                  </div>
               </div>

               {/* Team Member 4 */}
               <div className="relative overflow-hidden transition-all shadow-sm aspect-square rounded-3xl bg-slate-200 group hover:shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop" 
                    alt="Head of Operations" 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 flex items-end p-4 transition-opacity opacity-0 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100">
                    <span className="text-sm font-bold text-white">Operations</span>
                  </div>
               </div>
            </div>
            
            <div className="mt-12">
              <Link href="/careers" className="inline-flex items-center gap-2 font-bold text-red-600 transition-all hover:gap-3 hover:text-red-700">
                See Open Positions <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <FinalCTA />
      </main>
    </div>
  );
}

AboutPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;