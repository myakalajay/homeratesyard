import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

// --- CONSTANTS ---
const REVIEWS = [
  {
    id: 1,
    author: "Sarah & Mark T.",
    location: "Austin, TX",
    loanType: "30Y Fixed Purchase",
    result: "Closed in 14 Days",
    quote: "Our realtor told us we needed a cash offer to compete. HomeRatesYard gave us a Verified Approval that was just as good. We beat 3 other offers.",
    rating: 5,
    theme: "secondary" // Mapped to theme colors
  },
  {
    id: 2,
    author: "David Chen",
    location: "Seattle, WA",
    loanType: "Refinance",
    result: "Saved $340/month",
    quote: "I was about to sign with my bank when I checked this engine. The rate was 0.375% lower and the fees were zero. It was a no-brainer math decision.",
    rating: 5,
    theme: "primary"
  },
  {
    id: 3,
    author: "Elena R.",
    location: "Miami, FL",
    loanType: "Investment Property",
    result: "Zero Paperwork",
    quote: "The API connection to my bank accounts was scary fast. I didn't have to upload a single PDF or tax return. This is how lending should be.",
    rating: 5,
    theme: "success"
  }
];

// Helper to map abstract theme names to Tailwind classes
const getThemeStyles = (theme) => {
  switch (theme) {
    case 'primary': return 'bg-primary-subtle text-primary';
    case 'secondary': return 'bg-secondary-subtle text-secondary';
    case 'success': return 'bg-success-subtle text-success';
    default: return 'bg-background-muted text-content-muted';
  }
};

export default function SuccessStories() {
  return (
    <section className="relative py-24 overflow-hidden border-b bg-background border-border">
      
      {/* Background Quotemark Decor */}
      <div 
        className="absolute transform pointer-events-none opacity-10 top-10 left-10 text-border -z-10 -rotate-12"
        aria-hidden="true"
      >
        <Quote size={300} strokeWidth={0} fill="currentColor" />
      </div>

      <div className="container px-4 mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 mb-16 duration-700 md:flex-row md:items-end animate-in slide-in-from-bottom">
          <div className="max-w-3xl">
            <h2 className="mb-4 text-4xl font-bold font-display text-content">
              Don't just take our <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                algorithm's word for it.
              </span>
            </h2>
            <p className="text-lg text-content-muted">
              Join 25,000+ homeowners who ditched the bank and upgraded to AI-powered lending.
            </p>
          </div>

          {/* Social Proof Badge */}
          <div className="flex items-center gap-4 px-6 py-3 border shadow-sm bg-background-subtle rounded-2xl border-border">
            <div className="flex -space-x-2">
              {[1,2,3,4].map((i) => (
                <div key={i} className="w-8 h-8 border-2 border-background rounded-full bg-content-subtle flex items-center justify-center text-[10px] text-white font-bold">
                   U{i}
                </div>
              ))}
            </div>
            <div>
              <div className="flex text-warning mb-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs font-bold text-content">4.9/5 from Verified Users</p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {REVIEWS.map((review, index) => {
            const themeClasses = getThemeStyles(review.theme);
            
            return (
              <div 
                key={review.id}
                className="flex flex-col h-full p-8 transition-all duration-300 bg-white border shadow-lg rounded-3xl border-border shadow-content/5 hover:shadow-xl hover:-translate-y-2 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Result Badge */}
                <div className="mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${themeClasses}`}>
                    <CheckCircle2 size={12} />
                    {review.result}
                  </span>
                </div>

                {/* Quote */}
                <div className="flex-1 mb-8">
                  <div className="mb-4 text-warning">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="inline-block mr-0.5" fill="currentColor" />
                    ))}
                  </div>
                  <p className="relative font-medium leading-relaxed text-content-subtle">
                    <span className="absolute font-serif text-3xl -left-3 -top-2 text-border">“</span>
                    {review.quote}
                    <span className="absolute bottom-0 font-serif text-3xl -right-2 text-border">”</span>
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 transition-colors border-t border-border group-hover:border-primary/20">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${themeClasses}`}>
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-content">{review.author}</h4>
                    <p className="text-xs text-content-muted">{review.loanType} • {review.location}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}