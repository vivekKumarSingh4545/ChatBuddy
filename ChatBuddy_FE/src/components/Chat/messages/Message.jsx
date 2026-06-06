import moment from "moment";
import TraingleIcon from "../../../svgs/triangle";

export default function Message({ message, me }) {
  return (
    <div
      className={`w-full flex mt-3 ${
        me ? "ml-auto justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-[75%] py-2.5 px-4 rounded-2xl shadow-sm dark:text-dark_text_1 ${
          me
            ? "bg-gradient-to-tr from-green_1 to-purple-600 rounded-tr-none text-slate-50 shadow-green_1/5"
            : "dark:bg-dark_bg_2 border border-dark_border_1/20 rounded-tl-none text-dark_text_1"
        }`}
      >
        {/*Files attachments if present*/}
        {message.files && message.files.length > 0 && (
          <div className="flex flex-col gap-y-2 mt-1 mb-2">
            {message.files.map((file, idx) => (
              <div key={idx} className="max-w-xs rounded-xl overflow-hidden">
                {file.type === "image" || file.type === "sticker" ? (
                  <a href={file.file.secure_url} target="_blank" rel="noreferrer">
                    <img 
                      src={file.file.secure_url} 
                      alt="" 
                      className="w-full max-h-60 object-cover rounded-xl border border-dark_border_2/20 hover:opacity-95 transition"
                    />
                  </a>
                ) : file.type === "video" ? (
                  <video 
                    src={file.file.secure_url} 
                    controls 
                    className="w-full max-h-60 object-cover rounded-xl border border-dark_border_2/20"
                  />
                ) : (
                  <a 
                    href={file.file.secure_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-x-3 p-3 rounded-xl bg-dark_bg_1/60 hover:bg-dark_bg_1 border border-dark_border_1/30 transition text-inherit text-xs font-semibold"
                  >
                    <span className="text-2xl">{file.type === "contact" ? "👤" : "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate dark:text-dark_text_1">{file.file?.original_filename || "Document"}.{file.file?.format || file.type}</p>
                      <p className="text-[10px] dark:text-dark_text_3 font-medium">
                        {file.file?.bytes ? `${(file.file.bytes / 1024 / 1024).toFixed(2)} MB` : ""}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/*Message Text*/}
        {message.message && (
          <p className="text-sm leading-relaxed pb-3 pr-6 break-words">
            {message.message}
          </p>
        )}
        {/*Message Date & Status Checkmarks*/}
        <div className="absolute right-2.5 bottom-1 flex items-center gap-x-1 select-none">
          <span className={`text-[9px] font-medium leading-none ${
            me ? "text-indigo-200" : "dark:text-dark_text_3"
          }`}>
            {moment(message.createdAt).format("HH:mm")}
          </span>
          {me && (
            <span className="leading-none flex items-center">
              {(!message.status || message.status === "sent") && (
                <span className="text-[10px] text-indigo-200/60" title="Sent">✓</span>
              )}
              {message.status === "delivered" && (
                <span className="text-[10px] text-indigo-200/90 font-medium" title="Delivered">✓✓</span>
              )}
              {message.status === "read" && (
                <span className="text-[10px] text-sky-300 font-bold" title="Read">✓✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}