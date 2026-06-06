import {
  ArrowIcon,
  DialIcon,
  MuteIcon,
  SpeakerIcon,
  VideoDialIcon,
  NoVideoIcon,
} from "../../../svgs";

export default function CallAcions({
  endCall,
  callType,
  isMuted,
  setIsMuted,
  isVideoMuted,
  setIsVideoMuted,
  isSpeakerMuted,
  setIsSpeakerMuted,
}) {
  const isAudio = callType === "audio";

  return (
    <div className="h-22 w-full absolute bottom-0 z-40 px-1">
      {/*Container*/}
      <div className="relative bg-[#222]/95 backdrop-blur-md px-4 pt-6 pb-12 rounded-xl border border-white/10 shadow-2xl">
        {/*Expand chevron*/}
        <button className="-rotate-90 scale-y-[300%] absolute top-1 left-1/2">
          <ArrowIcon className="fill-dark_svg_2" />
        </button>
        {/*Actions*/}
        <ul className="flex items-center justify-between">
          <li>
            <button
              onClick={() => setIsSpeakerMuted((prev) => !prev)}
              className={`w-[45px] h-[45px] rounded-full flex items-center justify-center transition-all ${
                isSpeakerMuted
                  ? "bg-red-500/80 hover:bg-red-500 text-white"
                  : "bg-dark_bg_2 hover:bg-dark_hover_1 text-white"
              }`}
              title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
            >
              <SpeakerIcon className="fill-white w-6" />
            </button>
          </li>

          {/* Video toggle — only for video calls */}
          {!isAudio && (
            <li>
              <button
                onClick={() => setIsVideoMuted((prev) => !prev)}
                className={`w-[45px] h-[45px] rounded-full flex items-center justify-center transition-all ${
                  isVideoMuted
                    ? "bg-red-500/80 hover:bg-red-500 text-white"
                    : "bg-dark_bg_2 hover:bg-dark_hover_1 text-white"
                }`}
                title={isVideoMuted ? "Turn Video On" : "Turn Video Off"}
              >
                {isVideoMuted ? (
                  <NoVideoIcon className="fill-white w-6" />
                ) : (
                  <VideoDialIcon className="fill-white w-14 mt-2.5" />
                )}
              </button>
            </li>
          )}

          <li>
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className={`w-[45px] h-[45px] rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? "bg-red-500/80 hover:bg-red-500 text-white"
                  : "bg-dark_bg_2 hover:bg-dark_hover_1 text-white"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              <MuteIcon className="fill-white w-5" />
            </button>
          </li>

          {/* End call */}
          <li onClick={() => endCall()}>
            <button
              className="w-[45px] h-[45px] rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 rotate-[135deg] transition-all"
              title="End call"
            >
              <DialIcon className="fill-white w-6" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}