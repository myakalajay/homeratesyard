import React from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import Popover from '@/components/ui/overlay/Popover';
import UserAvatar from '../shared/UserAvatar';
import { useAuthContext } from '@/components/providers/AuthProvider';

const AppUserMenu = () => {
  const { user, logout } = useAuthContext();

  if (!user) return null;

  return (
    <Popover
      align="end"
      trigger={
        <button className="flex items-center gap-2 p-1 transition-colors rounded-full hover:bg-background-muted">
          <UserAvatar user={user} className="w-8 h-8" />
        </button>
      }
      content={
        <div className="w-56 p-1">
          <div className="px-2 py-1.5 mb-1 border-b border-border">
            <p className="text-sm font-medium text-content">{user.name}</p>
            <p className="text-xs truncate text-content-muted">{user.email}</p>
          </div>
          
          <div className="py-1">
            <button className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-background-muted text-content">
              <User className="w-4 h-4" /> Profile
            </button>
            <button className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-background-muted text-content">
              <Settings className="w-4 h-4" /> Account Settings
            </button>
          </div>
          
          <div className="pt-1 mt-1 border-t border-border">
            <button 
              onClick={logout}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-danger-subtle text-danger"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      }
    />
  );
};

export default AppUserMenu;