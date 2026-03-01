import React from 'react';
import { Avatar } from '@/components/ui/primitives/Avatar';
import { cn } from '@/utils/utils';

const UserAvatar = ({ user, className, ...props }) => {
  return (
    <Avatar
      src={user?.image}
      initials={user?.initials || user?.name?.slice(0, 2) || "U"}
      className={cn("border-2 border-background", className)}
      {...props}
    />
  );
};

export default UserAvatar;