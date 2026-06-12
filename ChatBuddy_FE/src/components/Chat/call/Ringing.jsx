import { useEffect, useState, useRef } from "react";
import { CloseIcon, ValidIcon, CallIcon, VideoCallIcon } from "../../../svgs";

export default function Ringing({ call, setCall, answerCall, endCall }) {
  const { name, picture, callType } = call;
  const isAudio = callType === "audio";

  const [timer, setTimer] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-dismiss after 30 s if not answered
  useEffect(() => {
    if (timer > 30) {
      setCall((prev) => ({ ...prev, receiveingCall: false }));
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ── Pointer-capture drag ─────────────────────────────────────────────────
  const cardRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState(null);

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const tag = e.target.tagName.toLowerCase();
    if (tag === "button" || tag === "svg" || tag === "path") return;

    const card = cardRef.current;
    if (!card) return;

    card.setPointerCapture(e.pointerId);
    const rect = card.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    e.preventDefault();
  };

  const handlePointerMove = (e) => {
    if (!cardRef.current?.hasPointerCapture(e.pointerId)) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPos({
      x: clamp(e.clientX - dragOffset.current.x, 0, window.innerWidth - rect.width),
      y: clamp(e.clientY - dragOffset.current.y, 0, window.innerHeight - rect.height),
    });
  };

  const handlePointerUp = (e) => {
    if (cardRef.current?.hasPointerCapture(e.pointerId)) {
      cardRef.current.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const cardStyle = pos
    ? { position: "fixed", left: pos.x, top: pos.y, transform: "none", zIndex: 50 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 50 };

  return (
    <div
      ref={cardRef}
      style={{
        ...cardStyle,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="dark:bg-dark_bg_3/90 border border-dark_border_1 backdrop-blur-xl rounded-2xl shadow-2xl p-6 select-none max-w-sm w-80"
    >
      {/* Container */}
      <div className="flex flex-col items-center gap-y-6">
        {/* Call info */}
        <div className="flex flex-col items-center text-center gap-y-3">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dark_border_2 shadow-lg">
            <img
              src={picture}
              alt={`${name} profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="dark:text-white text-lg font-bold tracking-wide">
              {name}
            </h1>
            <span className="text-xs font-semibold animate-pulse flex items-center gap-x-1.5 justify-center mt-1 text-emerald-400">
              {isAudio ? (
                <CallIcon className="fill-emerald-400 w-3 h-3" />
              ) : (
                <VideoCallIcon className="fill-emerald-400 w-4 h-4" />
              )}
              Incoming {isAudio ? "audio" : "video"} call…
            </span>
          </div>
        </div>

        {/* Action buttons — stop drag so clicks still fire */}
        <ul
          className="flex items-center gap-x-6"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Decline */}
          <li onClick={endCall}>
            <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-rose-500 hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-rose-500/20 cursor-pointer text-white">
              <CloseIcon className="fill-white w-5 h-5" />
            </button>
          </li>
          {/* Accept */}
          <li onClick={answerCall}>
            <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-500/20 cursor-pointer text-white">
              <ValidIcon className="fill-white w-6 h-6 mt-1.5" />
            </button>
          </li>
        </ul>
      </div>

      {/* Ringtone */}
      <audio src="../../../../audio/ringtone.mp3" autoPlay loop />
    </div>
  );
}
