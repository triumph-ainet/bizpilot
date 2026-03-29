'use client';

import { useEffect } from 'react';

type Props = {
  enabled: boolean;
};

export default function AutoPrint({ enabled }: Props) {
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  return null;
}
