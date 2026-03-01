import React from 'react';
import Link from 'next/link';
import { LifeBuoy, Phone, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/utils';

export default function HelpWidget({ className }) {
  const items = [
    { icon: FileText, label: "Documentation", href: "/docs" },
    { icon: LifeBuoy, label: "Help Center", href: "/help" },
    { icon: Phone, label: "Contact Support", href: "/contact" },
  ];

  return (
    <div className={cn("rounded-lg border border-border bg-background p-4", className)}>
      <h4 className="mb-3 text-sm font-semibold text-content">Need Assistance?</h4>
      <nav className="flex flex-col gap-1">
        {items.map((item, idx) => (
          <Link 
            key={idx} 
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-md text-content-muted hover:text-primary hover:bg-background-muted group"
          >
            <item.icon className="w-4 h-4 transition-colors group-hover:text-primary" />
            <span>{item.label}</span>
            <ExternalLink className="w-3 h-3 ml-auto transition-opacity opacity-0 group-hover:opacity-100" />
          </Link>
        ))}
      </nav>
    </div>
  );
}