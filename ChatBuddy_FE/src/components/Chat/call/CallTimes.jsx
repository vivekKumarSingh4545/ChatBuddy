import { useEffect, useRef, useState } from "react";

/**
 * Displays a running call timer that starts the moment the call is accepted.
 * Self-contained: manages its own interval, receives only `callAccepted` as trigger.
 * On unmount / callAccepted going false, the interval is cleared and display resets.
 */
export default function CallTimes({ callAccepted }) {
  const [elapsed, setElapsed] = useState(0);   // total seconds elapsed
  const intervalRef = useRef(null);

  useEffect(() => {
    if (callAccepted) {
      setElapsed(0); // reset before starting (handles re-calls cleanly)
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      // Call not accepted or ended — clear timer
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setElapsed(0);
    }

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [callAccepted]);

  if (!callAccepted) return null; // don't render until someone picks up

  // ── Time math ─────────────────────────────────────────────────────────────
  const hours   = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="font-mono text-sm text-emerald-400 tracking-widest mt-1 drop-shadow">
      {hours > 0 && <span>{pad(hours)}:</span>}
      <span>{pad(minutes)}</span>
      <span>:</span>
      <span>{pad(seconds)}</span>
    </div>
  );
}