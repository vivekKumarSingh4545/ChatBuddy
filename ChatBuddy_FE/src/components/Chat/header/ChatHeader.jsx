import { useSelector } from "react-redux";
import {
  CallIcon,
  DotsIcon,
  SearchLargeIcon,
  VideoCallIcon,
} from "../../../svgs";
import { capitalize } from "../../../utils/string";
import SocketContext from "../../../context/SocketContext";
import { getConversationName, getConversationPicture } from "../../../utils/chat";

function ChatHeader({ online, callUser, socket }) {
  const { activeConversation } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);

  const name = activeConversation.isGroup
    ? activeConversation.name
    : getConversationName(user, activeConversation.users);

  const picture = activeConversation.isGroup
    ? activeConversation.picture
    : getConversationPicture(user, activeConversation.users);

  return (
    <div className="h-[59px] dark:bg-dark_bg_2 border-b border-dark_border_1 flex items-center p16 select-none">
      {/*Container*/}
      <div className="w-full flex items-center justify-between">
        {/*left*/}
        <div className="flex items-center gap-x-3">
          {/*Conversation image*/}
          <div className="w-9 h-9 rounded-full overflow-hidden border border-dark_border_2">
            <img
              src={picture}
              alt={`${name} picture`}
              className="w-full h-full object-cover"
            />
          </div>
          {/*Conversation name and online status*/}
          <div className="flex flex-col">
            <h1 className="dark:text-dark_text_1 text-sm font-bold tracking-wide">
              {capitalize(name)}
            </h1>
            {online ? (
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Active now
              </span>
            ) : (
              <span className="text-[10px] dark:text-dark_text_3">
                Offline
              </span>
            )}
          </div>
        </div>
        {/*Right*/}
        <ul className="flex items-center gap-x-1.5">
          {/* Video call button */}
          <li
            onClick={() => callUser("video")}
            title="Video Call"
          >
            <button className="btn hover:bg-dark_hover_1 hover:text-dark_text_1 text-dark_svg_1 transition duration-200">
              <VideoCallIcon className="dark:fill-dark_svg_1 w-5 h-5" />
            </button>
          </li>
          {/* Audio call button */}
          <li
            onClick={() => callUser("audio")}
            title="Audio Call"
          >
            <button className="btn hover:bg-dark_hover_1 hover:text-dark_text_1 text-dark_svg_1 transition duration-200">
              <CallIcon className="dark:fill-dark_svg_1 w-4 h-4" />
            </button>
          </li>
          <li>
            <button className="btn hover:bg-dark_hover_1 hover:text-dark_text_1 text-dark_svg_1 transition duration-200">
              <SearchLargeIcon className="dark:fill-dark_svg_1 w-5 h-5" />
            </button>
          </li>
          <li>
            <button className="btn hover:bg-dark_hover_1 hover:text-dark_text_1 text-dark_svg_1 transition duration-200">
              <DotsIcon className="dark:fill-dark_svg_1 w-5 h-5" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

const ChatHeaderWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <ChatHeader {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default ChatHeaderWithSocket;