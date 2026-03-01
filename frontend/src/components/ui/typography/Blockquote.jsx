import React from 'react';
import { cn } from '@/utils/utils';
import { Quote } from 'lucide-react';

const Blockquote = ({ children, author, citation, className }) => {
  return (
    <figure className={cn("mt-10 border-l-4 border-primary bg-background-subtle p-6 rounded-r-lg", className)}>
      <Quote className="w-8 h-8 mb-2 text-primary/20" />
      <blockquote className="text-xl italic font-medium leading-relaxed text-content">
        "{children}"
      </blockquote>
      {(author || citation) && (
        <figcaption className="flex items-center mt-4 text-sm gap-x-2">
          <div className="font-semibold text-content">{author}</div>
          {citation && (
             <>
               <span className="text-content-muted">•</span>
               <cite className="not-italic text-content-muted">{citation}</cite>
             </>
          )}
        </figcaption>
      )}
    </figure>
  );
};

export default Blockquote;