import React from 'react';
import Link from 'next/link'; // Added for navigation
import { Link2, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button'; 

// --- CONSTANTS ---
const STEPS = [
  {
    id: 1,
    title: "Connect, Don't Upload",
    desc: "Forget hunting for tax returns. Securely link your bank and payroll accounts via Plaid™ and ADP™ in one click.",
    icon: Link2,
    time: "~3 Minutes"
  },
  {
    id: 2,
    title: "The 8-Minute Underwrite",
    desc: "Our AI Engine runs 4,000+ credit and compliance checks instantly, structuring your loan while you grab a coffee.",
    icon: Cpu,
    time: "~8 Minutes"
  },
  {
    id: 3,
    title: "Verified Approval",
    desc: "Receive a fully underwritten Verified Approval Letter. Shop for homes with the power of a cash buyer.",
    icon: CheckCircle2,
    time: "Instant"
  }
];

export default function ProcessTimeline() {
  return (
    <section className="py-24 bg-background-subtle">
      <div className="container px-4 mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-20 text-center duration-700 animate-in slide-in-from-bottom fade-in">
          <h2 className="mb-6 text-4xl font-bold font-display text-content">
            From Application to Approval in <br/>
            <span className="text-primary">Minutes, Not Weeks.</span>
          </h2>
          <p className="text-lg text-content-muted text-balance">
            The traditional 45-day cycle is obsolete. See how our parallel processing engine handles the heavy lifting.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          
          {/* Connector Line (Desktop Horizontal) */}
          <div className="absolute hidden w-full h-1 transform -translate-y-1/2 rounded-full bg-border top-[2.25rem] lg:block -z-0"></div>
          
          {/* Connector Line (Mobile Vertical) */}
          <div className="absolute top-0 bottom-0 left-1/2 w-1 -ml-0.5 bg-border lg:hidden -z-0"></div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center text-center group">
                
                {/* Step Marker */}
                <div className="relative flex items-center justify-center w-24 h-24 mb-8 transition-all duration-500 bg-white border-2 rounded-full shadow-xl border-background group-hover:scale-110 group-hover:border-primary">
                  {/* Icon */}
                  <step.icon size={32} className="transition-colors text-content-subtle group-hover:text-primary" />
                  
                  {/* Step Number Badge
                  <div className="absolute flex items-center justify-center w-8 h-8 text-sm font-bold text-white border-2 border-white rounded-full shadow-sm -top-1 -right-1 bg-content">
                    {step.id}
                  </div> */}
                </div>

                {/* Content Card */}
                <div className="w-full h-full p-8 transition-all duration-300 bg-white border shadow-sm rounded-3xl border-border group-hover:shadow-xl group-hover:-translate-y-2 group-hover:border-primary/20">
                  <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wide uppercase border rounded-full bg-background-subtle text-content-muted border-border">
                    Time: {step.time}
                  </div>
                  <h3 className="mb-3 text-xl font-bold transition-colors text-content group-hover:text-primary">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-content-muted">
                    {step.desc}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer - FUNCTIONAL FIX APPLIED */}
        <div className="flex justify-center mt-20">
          <Button asChild size="lg" className="px-10 text-lg transition-transform rounded-full shadow-xl h-14 shadow-primary/20 hover:scale-105">
            <Link href="/auth/register">
              Start Your Journey <ArrowRight size={20} className="ml-2" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}