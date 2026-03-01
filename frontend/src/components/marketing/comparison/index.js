import React from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

// --- CONSTANTS ---
const METRICS = [
  { 
    label: 'Time to Close', 
    traditional: '45-60 Days', 
    us: '14-21 Days', 
    highlight: true,
    desc: 'Days from application to funding.' 
  },
  { 
    label: 'Origination Fees', 
    traditional: '1% - 2% ($4k+)', 
    us: '$0', 
    highlight: true,
    desc: 'Lender fees charged at closing.' 
  },
  { 
    label: 'Underwriting', 
    traditional: 'Manual Review', 
    us: 'AI-Powered (Instant)',
    desc: 'How your credit & income is analyzed.' 
  },
  { 
    label: 'Document Uploads', 
    traditional: 'Email Attachments', 
    us: 'Direct API Sync',
    desc: 'Connection to bank/payroll accounts.' 
  },
  { 
    label: 'Rate Lock', 
    traditional: 'Manual Request', 
    us: '1-Click Instant Lock',
    desc: 'Ability to secure your interest rate.' 
  },
  { 
    label: 'Support Access', 
    traditional: '9-5 Banker Hours', 
    us: '24/7 Dedicated Team',
    desc: 'Availability of loan officers.' 
  },
];

export default function ComparisonTable() {
  return (
    <section id="comparison" className="relative py-24 overflow-hidden bg-background">
      
      <div className="container max-w-6xl px-4 mx-auto">
        
        {/* Header */}
        <div className="mb-16 text-center duration-700 animate-in slide-in-from-bottom fade-in">
          <h2 className="mb-4 text-4xl font-bold font-display text-content">
            The Old Way vs. <span className="text-primary">The Smart Way</span>
          </h2>
          <p className="max-w-2xl mx-auto text-content-muted">
            Banks were built for a different era. We built a platform for today.
          </p>
        </div>

        {/* The Comparison Card */}
        <div className="relative bg-white border shadow-xl rounded-3xl border-border">
          
          {/* Header Row */}
          <div className="grid grid-cols-12 border-b border-border bg-background-subtle/50">
            {/* Label Col */}
            <div className="hidden col-span-4 p-6 md:block"></div>
            
            {/* Traditional Col */}
            <div className="col-span-6 p-6 text-left border-r md:col-span-4 border-border md:border-r-0">
              <span className="text-xs font-bold tracking-widest uppercase text-content-muted">Traditional</span>
              <h3 className="mt-1 text-lg font-bold text-content-subtle">Standard Banks</h3>
            </div>
            
            {/* Us Col */}
            <div className="relative col-span-6 p-6 text-left md:col-span-4 bg-primary-subtle/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <span className="text-xs font-bold tracking-widest uppercase text-primary">Modern</span>
              <h3 className="mt-1 text-xl font-bold text-content">HomeRatesYard</h3>
            </div>
          </div>

          {/* Metrics Rows */}
          <div className="divide-y divide-border">
            {METRICS.map((row, i) => (
              <div key={i} className="grid grid-cols-12 transition-colors group hover:bg-background-subtle">
                
                {/* 1. Feature Label & Tooltip */}
                <div className="flex items-center col-span-12 gap-3 p-4 md:col-span-4 md:p-6">
                  
                  {/* Tooltip Wrapper */}
                  <div className="relative group/icon">
                    <div className="p-2 transition-all rounded-lg cursor-help bg-background-subtle text-content-muted group-hover:bg-white group-hover:shadow-sm group-hover:text-primary">
                      <HelpCircle size={16} />
                    </div>
                    
                    {/* The Tooltip (Desktop Only) */}
                    <div className="absolute z-20 hidden w-48 p-2 mb-2 text-xs text-center text-white transition-all -translate-x-1/2 translate-y-1 rounded-md shadow-xl opacity-0 pointer-events-none bottom-full left-1/2 bg-content group-hover/icon:opacity-100 group-hover/icon:translate-y-0 md:block">
                      {row.desc}
                      {/* Arrow */}
                      <div className="absolute -translate-x-1/2 border-4 border-transparent top-full left-1/2 border-t-content"></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-content md:text-base">{row.label}</p>
                    {/* Mobile Only Desc */}
                    <p className="text-xs text-content-muted md:hidden mt-0.5">{row.desc}</p>
                  </div>
                </div>

                {/* 2. Traditional Value */}
                <div className="flex flex-col col-span-6 p-4 text-left border-r items-left justify-left md:col-span-4 md:p-6 border-border md:border-r-0 md:bg-transparent">
                  <div className="flex items-center gap-2 transition-all opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100">
                    <XCircle size={18} className="hidden text-content-muted md:block" />
                    <span className="text-sm font-medium text-content-subtle md:text-base decoration-border">
                      {row.traditional}
                    </span>
                  </div>
                </div>

                {/* 3. Our Value (Highlighted) */}
                <div className="relative flex flex-col justify-center col-span-6 p-4 text-left items-left md:col-span-4 md:p-6 bg-primary-subtle/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-primary fill-primary-subtle" />
                    <span className={`font-semibold text-sm md:text-base ${row.highlight ? 'text-primary' : 'text-content'}`}>
                      {row.us}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Trust Footer */}
        <div className="flex items-center justify-center gap-8 mt-12 transition-all opacity-60 hover:opacity-100">
           <p className="max-w-lg text-xs font-medium text-center text-content-muted">
             *Average closing times and fees based on 2024 Mortgage Bankers Association reports vs. internal platform data from the last 12 months.
           </p>
        </div>

      </div>
    </section>
  );
}