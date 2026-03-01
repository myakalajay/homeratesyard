import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, PieChart, Settings, FileText, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/utils';
import Logo from '../shared/Logo';

const AppSidebar = ({ className }) => {
  const pathname = usePathname();

  const items = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Transactions", icon: Wallet, href: "/dashboard/transactions" },
    { label: "Analytics", icon: PieChart, href: "/dashboard/analytics" },
    { label: "Documents", icon: FileText, href: "/dashboard/documents" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <aside className={cn("flex flex-col w-64 h-screen border-r bg-background border-border", className)}>
      <div className="flex items-center h-16 px-6 border-b border-border">
        <Logo />
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-primary-subtle text-primary" 
                    : "text-content-muted hover:bg-background-muted hover:text-content"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-content-muted")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Link 
          href="/help"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-content-muted hover:bg-background-muted hover:text-content"
        >
          <HelpCircle className="w-5 h-5" />
          Help & Support
        </Link>
      </div>
    </aside>
  );
};

export default AppSidebar;