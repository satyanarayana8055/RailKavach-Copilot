"use client";

import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const show = useCallback((m: string) => {
    setMessage(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 3200);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { message, show };
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      {message && (
        <div className="pointer-events-auto flex animate-fade-up items-center gap-2.5 rounded-card bg-ink-950 px-4 py-3 text-sm font-medium text-white shadow-lift">
          <CheckCircle2 className="h-4 w-4 text-ok" aria-hidden />
          {message}
        </div>
      )}
    </div>
  );
}
