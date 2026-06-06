import { useEffect, useState } from "react";
import { CloseIcon, ValidIcon, CallIcon, VideoCallIcon } from "../../../svgs";

export default function Ringing({ call, setCall, answerCall, endCall }) {
  const { receiveingCall, callEnded, name, picture, callType } = call;
  const isAudio = callType === "audio";

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 30) {
      // Auto-dismiss after 30 s if not answered
      setCall((prev) => ({ ...prev, receiveingCall: false }));
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="dark:bg-dark_bg_3/90 border border-dark_border_1 backdrop-blur-xl rounded-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl z-50 p-6 select-none max-w-sm w-80">
      {/*Container*/}
      <div className="flex flex-col items-center gap-y-6">
        {/*Call info*/}
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

        {/*Action buttons*/}
        <ul className="flex items-center gap-x-6">
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

      {/*Ringtone*/}
      <audio src="../../../../audio/ringtone.mp3" autoPlay loop />
    </div>
  );
}
