import { useState, useEffect, useRef } from "react";
import CallAcions from "./CallActions";
import CallArea from "./CallArea";
import Header from "./Header";
import Ringing from "./Ringing";

export default function Call({
  call,
  setCall,
  callAccepted,
  myVideo,
  stream,
  userVideo,
  answerCall,
  show,
  endCall,
}) {
  const { receiveingCall, callEnded, name, picture, callType } = call;
  const [showActions, setShowActions] = useState(false);
  const [toggle, setToggle] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isAudio = callType === "audio";

  // ── Drag state ──────────────────────────────────────────────────────────
  const panelRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState(null); // null = CSS-centered initially

  // Reset states when call finishes
  useEffect(() => {
    if (!show || callEnded) {
      setIsMuted(false);
      setIsVideoMuted(false);
      setIsSpeakerMuted(false);
      setPos(null);
    }
  }, [show, callEnded]);

  // Apply mic mute
  useEffect(() => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, stream]);

  // Apply video mute
  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoMuted;
      });
    }
  }, [isVideoMuted, stream]);

  // Apply speaker mode (high volume for loudspeaker, low volume for earpiece)
  useEffect(() => {
    if (userVideo.current) {
      userVideo.current.muted = false; // Never fully mute the remote peer
      userVideo.current.volume = isSpeakerMuted ? 0.15 : 1.0;
    }
  }, [isSpeakerMuted, userVideo]);

  // ── Pointer-capture drag handlers ────────────────────────────────────────
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const handlePointerDown = (e) => {
    // Only drag with left mouse button / touch; skip if clicking a button or video
    if (e.button !== undefined && e.button !== 0) return;
    const tag = e.target.tagName.toLowerCase();
    if (tag === "button" || tag === "video" || tag === "svg" || tag === "path") return;

    const panel = panelRef.current;
    if (!panel) return;

    // Capture the pointer so mousemove fires even outside the element
    panel.setPointerCapture(e.pointerId);

    const rect = panel.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    e.preventDefault();
  };

  const handlePointerMove = (e) => {
    if (!panelRef.current) return;
    if (!panelRef.current.hasPointerCapture(e.pointerId)) return;

    const rect = panelRef.current.getBoundingClientRect();
    setPos({
      x: clamp(e.clientX - dragOffset.current.x, 0, window.innerWidth - rect.width),
      y: clamp(e.clientY - dragOffset.current.y, 0, window.innerHeight - rect.height),
    });
  };

  const handlePointerUp = (e) => {
    if (panelRef.current?.hasPointerCapture(e.pointerId)) {
      panelRef.current.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const panelStyle = pos
    ? { position: "fixed", left: pos.x, top: pos.y, transform: "none", zIndex: 50 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 50 };

  return (
    <>
      {/* ── Active call panel ─────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        style={{ ...panelStyle, cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
        className={`rounded-2xl overflow-hidden callbg select-none
          ${isAudio ? "w-[320px] h-[420px]" : "w-[350px] h-[550px]"}
          ${receiveingCall && !callAccepted ? "hidden" : ""}
        `}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseOver={() => setShowActions(true)}
        onMouseOut={() => setShowActions(false)}
      >
        <div className="relative w-full h-full">
          {/* Header */}
          <Header />

          {/* Call area (name + timer) */}
          <CallArea
            name={name}
            callType={callType}
            callAccepted={callAccepted}
          />

          {/* ── VIDEO STREAMS (video call only) ─────────────────────────── */}
          <div className={isAudio ? "hidden" : ""}>
            {/* Remote video */}
            <div className={callAccepted && !callEnded ? "" : "hidden"}>
              <video
                ref={userVideo}
                playsInline
                autoPlay
                className={toggle ? "SmallVideoCall" : "largeVideoCall"}
                onClick={() => setToggle((prev) => !prev)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>

            {/* Local video */}
            <div className={stream ? "" : "hidden"}>
              <video
                ref={myVideo}
                playsInline
                muted
                autoPlay
                className={`${toggle ? "largeVideoCall" : "SmallVideoCall"} ${
                  showActions ? "moveVideoCall" : ""
                }`}
                onClick={() => setToggle((prev) => !prev)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* ── AUDIO CALL UI ─────────────────────────────────────────────── */}
          {isAudio && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-6 pt-14">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                  <img
                    src={picture}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {callAccepted && !callEnded && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
                    <span className="absolute -inset-3 rounded-full border border-emerald-400/20 animate-ping animation-delay-150" />
                  </>
                )}
              </div>

              {/* Audio waveform bars */}
              {callAccepted && !callEnded && (
                <div className="flex items-end gap-x-1 h-8">
                  {[3, 6, 10, 7, 4, 8, 5, 9, 6, 3].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-emerald-400 opacity-80"
                      style={{
                        height: `${h * 3}px`,
                        animation: `audioBar 0.9s ease-in-out ${i * 0.09}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Call actions bar (hover to reveal) */}
          {showActions ? (
            <div onPointerDown={(e) => e.stopPropagation()}>
              <CallAcions
                endCall={endCall}
                callType={callType}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isVideoMuted={isVideoMuted}
                setIsVideoMuted={setIsVideoMuted}
                isSpeakerMuted={isSpeakerMuted}
                setIsSpeakerMuted={setIsSpeakerMuted}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Incoming call popup ──────────────────────────────────────────── */}
      {receiveingCall && !callAccepted ? (
        <Ringing
          call={call}
          setCall={setCall}
          answerCall={answerCall}
          endCall={endCall}
        />
      ) : null}

      {/* Outbound ringing tone while waiting for answer */}
      {!callAccepted && show ? (
        <audio src="../../../../audio/ringing.mp3" autoPlay loop />
      ) : null}
    </>
  );
}