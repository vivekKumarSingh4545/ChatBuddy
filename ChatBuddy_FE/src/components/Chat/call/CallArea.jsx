import { capitalize } from "../../../utils/string";
import CallTimes from "./CallTimes";

export default function CallArea({ name, callType, callAccepted }) {
  const isAudio = callType === "audio";

  return (
    <div className="absolute top-12 z-40 w-full p-1">
      <div className="flex flex-col items-center gap-y-1">
        {/* Contact name */}
        <h1 className="text-white text-lg drop-shadow font-bold">
          {name ? capitalize(name) : ""}
        </h1>

        {/* Status line — shows while waiting for answer */}
        {!callAccepted && (
          <span className="text-sm text-dark_text_1 animate-pulse">
            {isAudio ? "Calling…" : "Ringing…"}
          </span>
        )}

        {/* Timer — self-contained, starts the moment callAccepted becomes true */}
        <CallTimes callAccepted={callAccepted} />
      </div>
    </div>
  );
}