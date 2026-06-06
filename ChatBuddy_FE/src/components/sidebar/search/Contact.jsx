import { useDispatch, useSelector } from "react-redux";
import SocketContext from "../../../context/SocketContext";
import { open_create_conversation } from "../../../features/chatSlice";

function Contact({ contact, setSearchResults, socket }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { token } = user;
  const values = {
    receiver_id: contact._id,
    token,
  };
  const openConversation = async () => {
    let newConvo = await dispatch(open_create_conversation(values));
    socket.emit("join conversation", newConvo.payload._id);
  };
    return (
      <li
        onClick={() => openConversation()}
        className="list-none flex items-center justify-between mx-2 my-1.5 px-3 py-2.5 rounded-xl cursor-pointer dark:bg-transparent border border-transparent hover:dark:bg-dark_hover_1/40 transition-all duration-200 select-none"
      >
        {/*Container*/}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            {/*Conversation user picture*/}
            <div className="relative w-12 h-12 flex-shrink-0">
              <img
                src={contact.picture}
                alt={contact.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {/*Conversation name and status*/}
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold tracking-wide dark:text-dark_text_1 flex items-center gap-x-2">
                {contact.name}
              </h1>
              <span className="text-xs dark:text-dark_text_3 line-clamp-1 max-w-[200px]">
                {contact.status || "No status"}
              </span>
            </div>
          </div>
        </div>
      </li>
    );
  }

const ContactWithContext = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Contact {...props} socket={socket} />}
  </SocketContext.Consumer>
);
export default ContactWithContext;