import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { sendMessage, removeFile, clearFiles } from "../../../features/chatSlice";
import { SendIcon } from "../../../svgs";
import { Attachments } from "./attachments";
import EmojiPickerApp from "./EmojiPicker";
import Input from "./Input";
import SocketContext from "../../../context/SocketContext";

function ChatActions({ socket }) {
  const dispatch = useDispatch();
  const [showPicker, setShowPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const [loading, setLoading] = useState(false);
  const { activeConversation, status, files } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  const { token } = user;
  const [message, setMessage] = useState("");
  const textRef = useRef();

  const uploadFilesToCloudinary = async (filesToUpload) => {
    let uploaded = [];
    const cloud_name = import.meta.env.VITE_CLOUD_NAME;
    const cloud_secret = import.meta.env.VITE_CLOUD_SECRET;

    for (const f of filesToUpload) {
      let formData = new FormData();
      formData.append("upload_preset", cloud_secret);
      formData.append("file", f.file);

      try {
        const uploadType = (f.type === "image" || f.type === "sticker") ? "image" : "raw";
        const { data } = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloud_name}/${uploadType}/upload`,
          formData
        );
        uploaded.push({
          file: data,
          type: f.type,
        });
      } catch (err) {
        console.error("Error uploading file to Cloudinary: ", err);
      }
    }
    return uploaded;
  };

  const SendMessageHandler = async (e) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;
    setLoading(true);

    let uploadedFiles = [];
    if (files.length > 0) {
      uploadedFiles = await uploadFilesToCloudinary(files);
    }

    const values = {
      message,
      convo_id: activeConversation._id,
      files: uploadedFiles,
      token,
    };

    let newMsg = await dispatch(sendMessage(values));
    socket.emit("send message", newMsg.payload);
    setMessage("");
    dispatch(clearFiles());
    setLoading(false);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 select-none bg-gradient-to-t from-dark_bg_4 via-dark_bg_4/90 to-transparent z-10 flex flex-col gap-y-2">
      {/* File attachments preview */}
      {files && files.length > 0 && (
        <div className="w-full flex items-center gap-x-3 px-3 py-2.5 dark:bg-dark_bg_3/90 border border-dark_border_1/40 backdrop-blur-md rounded-2xl shadow-lg overflow-x-auto max-h-32 scrollbar">
          {files.map((f, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-dark_border_2 flex-shrink-0 flex items-center justify-center bg-dark_bg_2">
              {f.type === "image" || f.type === "sticker" ? (
                <img src={f.fileData} alt="" className="w-full h-full object-cover" />
              ) : f.type === "video" ? (
                <video src={f.fileData} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center p-1 text-center justify-center h-full w-full">
                  <span className="text-xl">📄</span>
                  <span className="text-[8px] dark:text-dark_text_2 truncate w-full font-medium mt-1 px-1">{f.file.name}</span>
                </div>
              )}
              {/* Delete button */}
              <button
                type="button"
                onClick={() => dispatch(removeFile(i))}
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white hover:bg-rose-600 transition flex items-center justify-center text-[10px] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => SendMessageHandler(e)}
        className="w-full flex items-center gap-x-3 dark:bg-dark_bg_3/80 border border-dark_border_1/40 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-lg"
      >
        {/*Emojis and attachments*/}
        <ul className="flex items-center gap-x-1">
          <EmojiPickerApp
            textRef={textRef}
            message={message}
            setMessage={setMessage}
            showPicker={showPicker}
            setShowPicker={setShowPicker}
            setShowAttachments={setShowAttachments}
          />
          <Attachments
            showAttachments={showAttachments}
            setShowAttachments={setShowAttachments}
            setShowPicker={setShowPicker}
          />
        </ul>
        {/*Input*/}
        <Input message={message} setMessage={setMessage} textRef={textRef} />
        {/*Send button*/}
        <button 
          type="submit" 
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-green_1 hover:bg-green_2 text-white shadow-md shadow-green_1/10 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <ClipLoader color="#FFFFFF" size={18} />
          ) : (
            <SendIcon className="fill-white w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}

const ChatActionsWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <ChatActions {...props} socket={socket} />}
  </SocketContext.Consumer>
);
export default ChatActionsWithSocket;