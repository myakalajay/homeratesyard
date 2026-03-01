import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { cn } from '@/utils/utils';

const CodeBlock = ({ 
  code, 
  language = "javascript", 
  filename, 
  className 
}) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-background-inverted my-6 border border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-black/40 border-white/10">
        <div className="flex items-center gap-2 text-xs text-content-muted">
          <Terminal className="w-3 h-3" />
          <span className="font-mono">{filename || language}</span>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-xs transition-colors text-content-muted hover:text-white"
        >
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed text-content-inverted">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;