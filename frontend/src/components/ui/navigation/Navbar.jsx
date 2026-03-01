import React from 'react';
import Link from 'next/link';
import { Menu, Bell, Search, Settings } from 'lucide-react';
import { cn } from '@/utils/utils';

// Primitives
import { Button } from '@/components/ui/primitives/Button';
import { IconButton } from '@/components/ui/primitives/IconButton';
import { Avatar } from '@/components/ui/primitives/Avatar';
import Logo from '@/components/navigation/shared/Logo'; 

const Navbar = ({ 
  user, 
  onMenuClick, 
  onNotificationClick,
  className,
  unreadCount = 2 // Example prop: normally comes from a notification context
}) => {
  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60", 
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        
        {/* LEFT: Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <IconButton 
            icon={Menu} 
            label="Toggle Sidebar" 
            className="lg:hidden text-slate-500 hover:bg-slate-100" 
            onClick={onMenuClick} 
          />
          
          {/* Dashboard Logo (Usually smaller or icon-only on mobile if space is tight) */}
          <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo variant="default" className="h-8" /> 
            {/* Note: The Logo component handles the text/icon rendering */}
          </Link>
        </div>

        {/* CENTER: Global Search (Optional - Desktop Only) */}
        <div className="items-center hidden w-full max-w-md mx-6 md:flex">
           <div className="relative w-full text-slate-500 focus-within:text-red-600">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text"
                placeholder="Search applications, borrowers, or loans..."
                className="block w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all sm:text-sm"
              />
           </div>
        </div>

        {/* RIGHT: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Notification Bell with Badge */}
          <div className="relative">
            <IconButton 
              icon={Bell} 
              label="Notifications" 
              onClick={onNotificationClick}
              className="text-slate-500 hover:text-slate-900"
            />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
            )}
          </div>

          <div className="hidden w-px h-6 mx-1 bg-slate-200 sm:block" aria-hidden="true" />

          {/* User Profile */}
          {user ? (
            <button className="flex items-center gap-3 p-1 transition-colors rounded-full hover:bg-slate-50 group">
              <div className="hidden text-right lg:block">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                    {user.name || 'User'}
                </p>
                <p className="text-xs font-medium text-slate-400 group-hover:text-slate-500">
                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}
                </p>
              </div>
              <Avatar 
                src={user.image} 
                initials={user.initials || user.name} 
                className="shadow-sm ring-2 ring-white"
                status="online" // Shows the green dot we added to Avatar
              />
            </button>
          ) : (
            // Fallback for public views if reused
            <div className="flex gap-2">
               <Button variant="ghost" size="sm" asChild>
                 <Link href="/auth/login">Log in</Link>
               </Button>
               <Button size="sm" asChild>
                 <Link href="/auth/register">Sign Up</Link>
               </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;