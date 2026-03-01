import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/utils';
import Container from './Container';

const Footer = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-border bg-background py-8 text-sm", className)}>
      <Container className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <p className="font-semibold text-content">
            FintechApp <span className="text-primary">•</span> Enterprise
          </p>
          <p className="text-content-muted">
            © {currentYear} All rights reserved.
          </p>
        </div>

        <nav className="flex items-center gap-6 text-content-muted">
          <Link href="/terms" className="transition-colors hover:text-primary">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-primary">
            Privacy
          </Link>
          <Link href="/support" className="transition-colors hover:text-primary">
            Support
          </Link>
          <Link href="/status" className="transition-colors hover:text-primary">
            Status
          </Link>
        </nav>
      </Container>
    </footer>
  );
};

export default Footer;