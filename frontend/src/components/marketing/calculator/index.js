import React from 'react';
import Link from 'next/link'; // Added for navigation
import { Wallet, ArrowRight, Check, TrendingUp } from 'lucide-react';
import { useLoanCalculator } from '@/hooks/useLoanCalculator';
import { Button } from '@/components/ui/primitives/Button';

export default function SavingsSimulator() {
  const { 
    loanAmount, setLoanAmount, 
    savings, traditionalCost, ourCost, sliderPercentage, 
    formatMoney 
  } = useLoanCalculator();

  return (
    <section className="relative py-24 overflow-hidden bg-content text-content-inverted isolate">
      
      {/* Background Ambience (Glows) */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="container relative z-10 px-4 mx-auto max-w-7xl">
        <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
          
          {/* --- LEFT: CONTROLS --- */}
          <div className="space-y-8 duration-700 animate-in slide-in-from-left">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider uppercase border rounded-full text-primary-subtle border-primary/30 bg-primary/10">
              <Wallet size={14} />
              Return on Investment
            </div>
            
            {/* Headline */}
            <h2 className="text-4xl font-bold leading-tight md:text-6xl font-display">
              Stop paying for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">inefficiency.</span>
            </h2>
            
            <p className="max-w-xl text-lg leading-relaxed text-content-muted/80">
              Banks charge 1-2% in origination fees to cover their manual labor costs. We automated the labor, so you keep the equity.
            </p>

            {/* Slider Control */}
            <div className="pt-8 space-y-8">
              <div className="flex items-end justify-between">
                <label className="text-sm font-bold tracking-widest uppercase text-content-muted">
                  Loan Amount
                </label>
                <div className="text-4xl font-bold text-white tabular-nums">
                  {formatMoney(loanAmount)}
                </div>
              </div>
              
              <div className="relative flex items-center h-8 cursor-pointer group">
                {/* Custom Track Background */}
                <div className="absolute w-full h-3 overflow-hidden rounded-full bg-content-subtle">
                  <div 
                    className="h-full transition-all duration-150 ease-out bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${sliderPercentage}%` }}
                  />
                </div>
                
                {/* Native Input (Hidden but Functional) */}
                <input 
                  type="range" 
                  min="100000" 
                  max="2000000" 
                  step="5000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="absolute z-20 w-full h-full opacity-0 cursor-ew-resize"
                  aria-label="Adjust loan amount"
                />
                
                {/* Custom Thumb (Visual Only) */}
                <div 
                  className="absolute z-10 w-8 h-8 transition-all duration-150 ease-out bg-white border-4 rounded-full shadow-2xl pointer-events-none border-primary group-hover:scale-110"
                  style={{ left: `calc(${sliderPercentage}% - 16px)` }}
                />
              </div>
              
              <div className="flex justify-between font-mono text-xs font-medium uppercase text-content-muted">
                <span>$100k Starter</span>
                <span>$2M+ Jumbo</span>
              </div>
            </div>
          </div>

          {/* --- RIGHT: THE RESULT CARD --- */}
          <div className="relative duration-700 delay-100 group animate-in slide-in-from-right">
            {/* Glass Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden transition-transform duration-500 hover:scale-[1.01]">
              
              {/* Shine Effect */}
              <div className="absolute inset-0 transition-opacity duration-700 opacity-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent group-hover:opacity-100"></div>

              <div className="flex items-start justify-between mb-10">
                <div>
                  <h3 className="mb-1 text-lg font-medium text-white/90">Estimated Savings</h3>
                  <p className="text-xs text-white/50">Upfront closing cost reduction</p>
                </div>
                <div className="p-3 rounded-xl bg-success/20">
                  <TrendingUp size={24} className="text-success" />
                </div>
              </div>
              
              {/* The Big Number */}
              <div className="mb-12">
                <span className="text-5xl font-bold tracking-tight text-transparent md:text-6xl bg-clip-text bg-gradient-to-r from-primary via-secondary to-white tabular-nums">
                  {formatMoney(savings)}
                </span>
                <p className="flex items-center gap-2 mt-4 text-sm text-white/60">
                  <Check size={16} className="text-success" />
                  Directly adds to your down payment power
                </p>
              </div>

              {/* Breakdown */}
              <div className="pt-8 space-y-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm group/row">
                  <span className="transition-colors text-white/50 group-hover/row:text-white">Traditional Lender Fee</span>
                  <span className="line-through text-danger-text/80 decoration-danger/50">{formatMoney(traditionalCost)}</span>
                </div>
                <div className="flex items-center justify-between text-lg group/row">
                  <span className="flex items-center gap-3 font-medium text-white">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success text-content shadow-glow-green">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    HomeRatesYard
                  </span>
                  <span className="font-bold text-success">{formatMoney(ourCost)}</span>
                </div>
              </div>

              {/* Action Button (Now Visible on Desktop & Mobile) */}
              <div className="mt-8">
                <Button asChild size="lg" className="w-full text-lg font-bold bg-white text-content hover:bg-white/90 h-14">
                  <Link href="/auth/register">
                    Lock This Rate <ArrowRight size={20} className="ml-2" />
                  </Link>
                </Button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}