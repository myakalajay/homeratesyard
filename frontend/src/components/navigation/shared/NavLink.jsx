import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/utils';

const NavLink = ({ href, children, className, activeClassName, ...props }) => {
  const pathname = usePathname();
  // Active if exact match or if it's a sub-path (e.g., /dashboard matches /dashboard/settings)
  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? (activeClassName || "text-primary font-semibold") : "text-content-muted",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export default NavLink;