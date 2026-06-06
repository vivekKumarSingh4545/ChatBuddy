import { useState, useEffect } from "react";
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

  const isAudio = callType === "audio";

  // Reset states when call finishes
  useEffect(() => {
    if (!show || callEnded) {
      setIsMuted(false);
      setIsVideoMuted(false);
      setIsSpeakerMuted(false);
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

  // Apply speaker mute
  useEffect(() => {
    if (userVideo.current) {
      userVideo.current.muted = isSpeakerMuted;
    }
  }, [isSpeakerMuted, userVideo]);

  return (
    <>
      {/* ── Active call panel ─────────────────────────────────────────────── */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-2xl overflow-hidden callbg
          ${isAudio ? "w-[320px] h-[420px]" : "w-[350px] h-[550px]"}
          ${receiveingCall && !callAccepted ? "hidden" : ""}
        `}
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
          {/* Always keep video elements in the DOM so refs are never null.
              Visibility is controlled by CSS classes / display. */}
          <div className={isAudio ? "hidden" : ""}>
            {/* Remote video — hidden until call is accepted */}
            <div className={callAccepted && !callEnded ? "" : "hidden"}>
              <video
                ref={userVideo}
                playsInline
                autoPlay
                className={toggle ? "SmallVideoCall" : "largeVideoCall"}
                onClick={() => setToggle((prev) => !prev)}
              />
            </div>

            {/* Local video — always mounted, srcObject set via useEffect */}
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
                {/* Pulsing ring when connected */}
                {callAccepted && !callEnded && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
                    <span className="absolute -inset-3 rounded-full border border-emerald-400/20 animate-ping animation-delay-150" />
                  </>
                )}
              </div>

              {/* Audio waveform bars (decorative, animated when connected) */}
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