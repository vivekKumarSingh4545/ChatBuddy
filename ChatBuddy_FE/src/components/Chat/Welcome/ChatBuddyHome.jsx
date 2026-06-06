export default function ChatBuddyHome() {
  return (
    <div className="h-full w-full dark:bg-dark_bg_4 flex items-center justify-center relative overflow-hidden select-none border-l dark:border-l-dark_border_1">
      {/* Ambient background glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-green_1/5 blur-[80px] -top-10 -right-10 pointer-events-none"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[80px] -bottom-10 -left-10 pointer-events-none"></div>

      <div className="max-w-md text-center flex flex-col items-center gap-y-6 z-10 px-6">
        {/* Animated glowing chat bubble SVG */}
        <div className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-tr from-green_1 to-purple-600 rounded-2xl shadow-xl shadow-green_1/20 animate-bounce [animation-duration:3s]">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {/* Accent rings */}
          <div className="absolute -inset-2 rounded-2xl border border-green_1/30 animate-pulse"></div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-dark_text_1">
            ChatBuddy
          </h1>
          <p className="text-sm leading-relaxed dark:text-dark_text_2">
            Connect seamlessly with friends, family, and colleagues. Experience high-definition calls, fast messaging, and cross-device syncing, all in a secure and modern workspace.
          </p>
        </div>

        <div className="pt-2">
          <span className="inline-flex items-center gap-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full dark:bg-dark_bg_3 border border-dark_border_1 text-green_1 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            End-to-end Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}