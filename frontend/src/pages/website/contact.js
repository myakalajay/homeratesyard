import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Mail, Phone, MapPin, MessageSquare, 
  ArrowRight, Send, HelpCircle, Building2,
  Clock, CheckCircle
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FinalCTA from '@/components/marketing/cta';

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Head>
        <title>Contact Us | HomeRatesYard</title>
        <meta name="description" content="Get in touch with our team. Support, Sales, Press, and Partnership inquiries." />
      </Head>

      <main>
        
        {/* 1. HERO SECTION */}
        <section className="relative h-[300px] flex items-center justify-center overflow-hidden bg-slate-900 isolate">
          {/* Background Image */}
          <div className="absolute inset-0 -z-10">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop" 
              alt="Customer Support" 
              className="object-cover w-full h-full opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-red-900/40"></div>
          </div>

          <div className="relative z-10 px-4 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-bold tracking-wider text-orange-300 uppercase border rounded-full border-orange-400/30 bg-orange-400/10 backdrop-blur-md">
              <MessageSquare size={14} />
              We're here to help
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white font-display md:text-6xl drop-shadow-xl">
              Get in Touch
            </h1>
            <p className="max-w-full mx-auto text-md text-slate-300">
              Whether you have a question about rates, trials, pricing, or anything else, our team is ready to answer all your questions.
            </p>
          </div>
        </section>

        {/* 2. MAIN CONTENT GRID */}
        <div className="container relative z-20 px-4 pb-20 mx-auto mt-10 max-w-7xl">
          <div className="grid grid-cols-1 overflow-hidden shadow-2xl lg:grid-cols-12 rounded-3xl">
            
            {/* LEFT: Contact Information (Dark) */}
            <div className="relative p-10 text-white bg-slate-900 lg:col-span-5 lg:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <h3 className="mb-6 text-2xl font-semibold text-white font-display">Contact Information</h3>
              <p className="mb-12 leading-relaxed text-slate-400">
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              <div className="space-y-8">
                {/* Phone */}
                <div className="flex items-start gap-4 group">
                  <div className="flex items-center justify-center w-12 h-12 text-orange-400 transition-colors bg-white/5 rounded-xl group-hover:bg-orange-500 group-hover:text-white">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-500">Call Us (Toll Free)</p>
                    <p className="text-lg font-semibold transition-colors hover:text-orange-400">
                      <a href="tel:+18885550199">+1 (888) 555-0199</a>
                    </p>
                    <p className="text-sm text-slate-500">Mon-Fri, 8am-8pm EST</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 group">
                  <div className="flex items-center justify-center w-12 h-12 text-red-400 transition-colors bg-white/5 rounded-xl group-hover:bg-red-500 group-hover:text-white">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-500">Email Support</p>
                    <p className="text-lg font-semibold transition-colors hover:text-red-400">
                      <a href="mailto:support@homeratesyard.com">support@homeratesyard.com</a>
                    </p>
                    <p className="text-sm text-slate-500">Average response: 2 hours</p>
                  </div>
                </div>

                {/* HQ */}
                <div className="flex items-start gap-4 group">
                  <div className="flex items-center justify-center w-12 h-12 text-blue-400 transition-colors bg-white/5 rounded-xl group-hover:bg-blue-500 group-hover:text-white">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-500">Headquarters</p>
                    <p className="text-lg font-semibold">Austin, Texas</p>
                    <p className="text-sm leading-relaxed text-slate-500">
                      100 Congress Ave, Suite 2000<br/>
                      Austin, TX 78701
                    </p>
                  </div>
                </div>
              </div>

              {/* Social / Bottom Links */}
              <div className="pt-12 mt-12 border-t border-white/10">
                <Link href="/help" className="inline-flex items-center gap-2 text-sm font-bold transition-colors text-slate-400 hover:text-white">
                  <HelpCircle size={16} /> Visit Help Center
                </Link>
              </div>
            </div>

            {/* RIGHT: Contact Form (Light) */}
            <div className="p-10 bg-white lg:col-span-7 lg:p-12">
              {formStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
                  <div className="flex items-center justify-center w-20 h-20 mb-6 text-green-600 bg-green-100 rounded-full">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-slate-900">Message Sent!</h3>
                  <p className="max-w-lg mx-auto mb-8 text-slate-500">
                    Thank you for reaching out. A member of our team will review your message and get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setFormStatus('idle')}
                    className="px-8 py-3 font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col justify-center h-full">
                  <h3 className="mb-8 text-2xl font-semibold text-slate-900">Send us a message</h3>
                  
                  <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">First Name</label>
                      <input type="text" required className="w-full px-4 py-3 transition-all border bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600" placeholder="Jane" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Last Name</label>
                      <input type="text" required className="w-full px-4 py-3 transition-all border bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Email Address</label>
                      <input type="email" required className="w-full px-4 py-3 transition-all border bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600" placeholder="jane@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Phone (Optional)</label>
                      <input type="tel" className="w-full px-4 py-3 transition-all border bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600" placeholder="(555) 000-0000" />
                    </div>
                  </div>

                  <div className="mb-6 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Topic</label>
                    <select className="w-full px-4 py-3 transition-all border bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 text-slate-600">
                      <option>I have a question about my loan</option>
                      <option>I want to partner with HomeRatesYard</option>
                      <option>Press / Media Inquiry</option>
                      <option>Report a technical issue</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="mb-8 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Message</label>
                    <textarea required rows="4" className="w-full px-4 py-3 transition-all border resize-none bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600" placeholder="How can we help you?"></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="flex items-center justify-center w-full gap-2 py-4 font-semibold text-white transition-all bg-red-600 shadow-lg text-md rounded-xl hover:bg-red-700 hover:shadow-red-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formStatus === 'submitting' ? (
                      <>Sending...</>
                    ) : (
                      <>Send Message <Send size={18} /></>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* 3. LOCATIONS / DEPARTMENTS */}
        <section className="py-20 bg-white">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              
              <div className="p-8 text-center border bg-slate-50 rounded-3xl border-slate-100">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-white rounded-full shadow-sm text-slate-900">
                  <Building2 size={24} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">Partnerships</h3>
                <p className="mb-4 text-sm text-slate-500">For real estate agents and builders.</p>
                <a href="mailto:partners@homeratesyard.com" className="font-medium text-red-600 hover:text-red-700">partners@homeratesyard.com</a>
              </div>

              <div className="p-8 text-center border bg-slate-50 rounded-3xl border-slate-100">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-white rounded-full shadow-sm text-slate-900">
                  <MessageSquare size={24} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">Press & Media</h3>
                <p className="mb-4 text-sm text-slate-500">For interviews and press kits.</p>
                <a href="mailto:press@homeratesyard.com" className="font-medium text-red-600 hover:text-red-700">press@homeratesyard.com</a>
              </div>

              <div className="p-8 text-center border bg-slate-50 rounded-3xl border-slate-100">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-white rounded-full shadow-sm text-slate-900">
                  <Clock size={24} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">Operating Hours</h3>
                <p className="mb-4 text-sm text-slate-500">When we are online.</p>
                <span className="font-medium text-slate-900">Mon-Fri: 8am - 8pm EST</span>
              </div>

            </div>
          </div>
        </section>

        <FinalCTA />
      </main>
    </div>
  );
}

ContactPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;