import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Message from "./Message";
import Typing from "./Typing";

export default function ChatMessages({ typing }) {
  const { messages, activeConversation } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  const endRef = useRef();
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="mb-[60px] dark:bg-dark_bg_4">
      {/*Container*/}
      <div className="scrollbar overflow_scrollbar overflow-auto py-4 px-[5%] bg-gradient-to-b from-dark_bg_4 to-dark_bg_6">
        {/*Messages*/}
        {messages &&
          messages.map((message) => (
            <Message
              message={message}
              key={message._id}
              me={user._id === message.sender._id}
            />
          ))}
          {typing === activeConversation._id ? <Typing /> : null}
          <div className="mt-2" ref={endRef}></div>
      </div>
    </div>
  );
}