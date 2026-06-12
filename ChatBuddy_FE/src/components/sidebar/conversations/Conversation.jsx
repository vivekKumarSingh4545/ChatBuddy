import { useDispatch, useSelector } from "react-redux";
import SocketContext from "../../../context/SocketContext";
import { open_create_conversation } from "../../../features/chatSlice";
import {
  getConversationId,
  getConversationName,
  getConversationPicture,
} from "../../../utils/chat";
import { dateHandler } from "../../../utils/date";
import { capitalize } from "../../../utils/string";

function Conversation({ convo, socket, online, typing }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { activeConversation } = useSelector((state) => state.chat);
  const { token } = user;
  const values = {
    receiver_id: getConversationId(user, convo.users),
    token,
  };
  const openConversation = async () => {
    let newConvo = await dispatch(open_create_conversation(values));
    socket.emit("join conversation", newConvo.payload._id);
  };
  const isActive = convo._id === activeConversation._id;

  return (
    <li
      onClick={() => openConversation()}
      className={`list-none flex items-center justify-between mx-2 my-1.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 select-none border ${
        isActive 
          ? "dark:bg-dark_hover_1 border-dark_border_2/30 shadow-lg shadow-indigo-500/5 relative overflow-hidden" 
          : "dark:bg-transparent border-transparent hover:dark:bg-dark_hover_1/40"
      }`}
    >
      {/* Active side indicator glow */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green_1 rounded-r-md"></div>
      )}

      {/*Container */}
      <div className="w-full flex items-center justify-between">
        {/*Left*/}
        <div className="flex items-center gap-x-3">
          {/*Conversation user picture*/}
          <div className="relative w-12 h-12 flex-shrink-0">
            <img
              src={getConversationPicture(user, convo.users)}
              alt="picture"
              className="w-full h-full object-cover rounded-full"
            />
            {/* Glowing online dot */}
            {online && (
              <span className="absolute bottom-0 right-0 block w-3 h-3 rounded-full bg-emerald-500 border-2 border-dark_bg_2 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            )}
          </div>
          {/*Conversation name and message*/}
          <div className="flex flex-col">
            {/*Conversation name*/}
            <h1 className={`text-sm font-semibold tracking-wide flex items-center gap-x-2 ${
              isActive ? "dark:text-dark_text_1" : "dark:text-dark_text_2"
            }`}>
              {capitalize(getConversationName(user, convo.users))}
            </h1>
            {/* Conversation message */}
            <div className="mt-0.5">
              <div className="text-xs dark:text-dark_text_3">
                {typing === convo._id ? (
                  <p className="text-green_1 font-medium animate-pulse">Typing...</p>
                ) : (
                  <p className={`line-clamp-1 max-w-[170px] ${
                    convo.latestMessage && 
                    (typeof convo.latestMessage.sender === "object" 
                      ? convo.latestMessage.sender._id !== user._id 
                      : convo.latestMessage.sender !== user._id) && 
                    convo.latestMessage.status !== "read"
                      ? "font-bold text-white dark:text-white"
                      : "dark:text-dark_text_3"
                  }`}>
                    {convo.latestMessage?.message || "No messages yet"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/*Right*/}
        <div className="flex flex-col items-end gap-y-1">
          <span className="text-[10px] dark:text-dark_text_3 font-medium">
            {convo.latestMessage?.createdAt
              ? dateHandler(convo.latestMessage?.createdAt)
              : ""}
          </span>
        </div>
      </div>
    </li>
  );
}

const ConversationWithContext = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Conversation {...props} socket={socket} />}
  </SocketContext.Consumer>
);
export default ConversationWithContext;