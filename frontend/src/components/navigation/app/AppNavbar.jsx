import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { IconButton } from '@/components/ui/primitives/IconButton';
import { Input } from '@/components/ui/primitives/Input';
import AppUserMenu from './AppUserMenu';

const AppNavbar = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 flex items-center w-full h-16 px-4 border-b border-border bg-background lg:px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <IconButton icon={Menu} onClick={onMenuClick} className="text-content-muted" />
      </div>

      <div className="flex items-center justify-between flex-1 gap-4 ml-4 lg:ml-0">
        {/* Search Bar */}
        <div className="relative hidden w-full max-w-sm sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-content-muted" />
          <Input 
            placeholder="Search transactions, customers..." 
            className="border-none pl-9 h-9 bg-background-subtle focus-visible:bg-background"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <IconButton icon={Bell} className="text-content-muted hover:text-primary" />
          <div className="hidden w-px h-6 bg-border sm:block" />
          <AppUserMenu />
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;