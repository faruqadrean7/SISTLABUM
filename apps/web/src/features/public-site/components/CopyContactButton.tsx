'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyContactButtonProps {
  textToCopy: string;
  label: string;
  className?: string;
}

export function CopyContactButton({ textToCopy, label, className = '' }: CopyContactButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback silently if clipboard is restricted
    }
  };

  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Salin ${label}: ${textToCopy}`}
        title={`Salin ${label}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[6px] border transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold ${
          copied
            ? 'bg-pub-green-soft/30 border-pub-green text-pub-green'
            : 'bg-white border-pub-border text-pub-text-muted hover:text-pub-navy hover:border-pub-navy/30'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-pub-green" aria-hidden="true" />
            <span>Tersalin</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Salin</span>
          </>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? `${label} berhasil disalin ke papan klip` : ''}
      </span>
    </div>
  );
}
