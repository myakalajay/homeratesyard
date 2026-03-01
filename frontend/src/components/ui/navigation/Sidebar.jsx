import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/utils';
import { LayoutDashboard, Wallet, PieChart, Settings, HelpCircle, LogOut } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, href, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
        isActive 
          ? "bg-primary-subtle text-primary font-medium" 
          : "text-content-muted hover:bg-background-muted"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
};

const Sidebar = ({ className, isOpen, onClose }) => {
  // Navigation Links - Centralized for easy updates
  const links = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", href: "/transactions", icon: Wallet },
    { label: "Analytics", href: "/analytics", icon: PieChart },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-background transition-transform duration-300 lg:static lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full",
      className
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center h-16 px-6 border-b border-border lg:hidden">
          <span className="font-bold">Menu</span>
          <button className="ml-auto" onClick={onClose}>
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
        
        <div className="flex-1 py-4 overflow-auto">
          <nav className="grid items-start px-4 space-y-1 text-sm font-medium">
            {links.map((link) => (
              <SidebarItem key={link.href} {...link} onClick={onClose} />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <nav className="grid gap-1">
             <SidebarItem icon={HelpCircle} label="Help & Support" href="/support" />
             <button className="flex items-center w-full gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-lg text-danger hover:bg-danger-subtle">
               <LogOut className="w-4 h-4" />
               Sign Out
             </button>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;