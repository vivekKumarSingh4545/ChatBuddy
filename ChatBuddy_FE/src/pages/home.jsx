import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Peer from "simple-peer";
import { ChatContainer, ChatBuddyHome } from "../components/Chat";
import { Sidebar } from "../components/sidebar";
import SocketContext from "../context/SocketContext";
import {
  getConversations,
  updateMessagesAndConversations,
  updateMessageStatus,
  updateAllMessagesRead,
  updateAllMessagesDelivered,
} from "../features/chatSlice";
import Call from "../components/Chat/call/Call";
import {
  getConversationId,
  getConversationName,
  getConversationPicture,
} from "../utils/chat";

const callData = {
  socketId: "",
  receiveingCall: false,
  callEnded: false,
  name: "",
  picture: "",
  signal: "",
  callType: "video",
};

function Home({ socket }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { activeConversation } = useSelector((state) => state.chat);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // ── Call UI state ──────────────────────────────────────────────────────────
  const [call, setCall] = useState(callData);
  const [stream, setStream] = useState(null);
  const [show, setShow] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef(null);

  // ── Stable refs ────────────────────────────────────────────────────────────
  const mySocketIdRef = useRef("");      // own socket ID — never cleared on call reset
  const remoteSocketIdRef = useRef("");  // other peer's socket ID — set per call
  const streamRef = useRef(null);        // mirror of stream state (works inside closures)
  const callAcceptedRef = useRef(false);
  const callTypeRef = useRef("video");

  // typing
  const [typing, setTyping] = useState(false);

  // Keep mirrors in sync with state
  useEffect(() => { streamRef.current = stream; }, [stream]);
  useEffect(() => { callAcceptedRef.current = callAccepted; }, [callAccepted]);
  useEffect(() => { callTypeRef.current = call.callType; }, [call.callType]);

  // ── Attach local video stream to the video element whenever stream changes ──
  // This avoids the race where we try to set srcObject before the element mounts.
  useEffect(() => {
    if (callTypeRef.current === "video" && stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  // ── Join socket room (also re-joins on socket reconnect) ───────────────────
  useEffect(() => {
    const join = () => socket.emit("join", user._id);
    join();

    socket.on("get-online-users", (users) => setOnlineUsers(users));

    // Re-join if the backend restarted (nodemon/crash) so onlineUsers stays fresh
    // and "setup socket" is re-sent with the new socket ID.
    socket.on("connect", join);

    return () => {
      socket.off("get-online-users");
      socket.off("connect", join);
    };
  }, [user]);

  // ── Media helpers ──────────────────────────────────────────────────────────

  /**
   * Acquires camera/mic ON-DEMAND at the moment a call is placed or answered.
   * - Video call  → video + audio
   * - Audio call  → audio only
   * This ensures the browser only asks for permissions when actually needed.
   */
  const acquireMedia = (callType) => {
    const constraints =
      callType === "audio"
        ? { video: false, audio: true }
        : { video: true, audio: true };
    return navigator.mediaDevices.getUserMedia(constraints);
  };

  /** Stops all camera/mic tracks and clears video elements. */
  const stopMedia = () => {
    const s = streamRef.current;
    if (s) s.getTracks().forEach((t) => t.stop());
    if (myVideo.current) myVideo.current.srcObject = null;
    if (userVideo.current) userVideo.current.srcObject = null;
    streamRef.current = null;
    setStream(null);
  };

  // ── WebRTC helpers ─────────────────────────────────────────────────────────

  const destroyPeer = () => {
    if (connectionRef.current) {
      try { connectionRef.current.destroy(); } catch (_) {}
      connectionRef.current = null;
    }
  };

  /** Full teardown — no media re-acquisition (media is only acquired on next call). */
  const resetAfterCall = () => {
    setTimeout(() => {
      setCall(callData);
      setCallAccepted(false);
      callAcceptedRef.current = false;
      callTypeRef.current = "video";
      setShow(false);
      remoteSocketIdRef.current = "";
    }, 500);
  };

  // ── Main socket event listeners (registered once on mount) ─────────────────
  useEffect(() => {
    // No media acquisition on mount — camera/mic are only requested when a call starts.

    socket.on("setup socket", (id) => {
      mySocketIdRef.current = id;
    });

    socket.on("call user", (data) => {
      remoteSocketIdRef.current = data.from;
      setCall((prev) => ({
        ...prev,
        socketId: data.from,
        name: data.name,
        picture: data.picture,
        signal: data.signal,
        receiveingCall: true,
        callEnded: false,
        callType: data.callType || "video",
      }));
    });

    socket.on("call accepted", (data) => {
      setCallAccepted(true);
      callAcceptedRef.current = true;
      remoteSocketIdRef.current = data.from;
      if (connectionRef.current) {
        connectionRef.current.signal(data.signal);
      }
    });

    socket.on("end call", () => {
      setShow(false);
      destroyPeer();
      stopMedia();
      setCall((prev) => ({ ...prev, callEnded: true, receiveingCall: false }));
      resetAfterCall();
    });

    socket.on("call user not available", () => {
      setShow(false);
      destroyPeer();
      resetAfterCall();
      alert("The user is not online or unavailable right now.");
    });

    return () => {
      socket.off("setup socket");
      socket.off("call user");
      socket.off("call accepted");
      socket.off("end call");
      socket.off("call user not available");
    };
  }, []);

  // ── Initiate call ──────────────────────────────────────────────────────────
  const callUser = async (callType = "video") => {
    if (!mySocketIdRef.current) {
      alert("Connecting… please try again in a moment.");
      return;
    }

    // Acquire media on-demand — only when the user actually places a call
    let callStream;
    try {
      callStream = await acquireMedia(callType);
    } catch (err) {
      alert(
        callType === "audio"
          ? "Microphone access was denied. Please allow microphone access and try again."
          : "Camera/microphone access was denied. Please allow access and try again."
      );
      return;
    }

    setStream(callStream);
    streamRef.current = callStream;
    callTypeRef.current = callType;

    setCall((prev) => ({
      ...prev,
      name: getConversationName(user, activeConversation.users),
      picture: getConversationPicture(user, activeConversation.users),
      callEnded: false,
      callType,
    }));
    setShow(true);

    // Attach local video stream immediately
    if (callType === "video" && myVideo.current) {
      myVideo.current.srcObject = callStream;
    }

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: callStream,
    });

    peer.on("signal", (data) => {
      socket.emit("call user", {
        userToCall: getConversationId(user, activeConversation.users),
        signal: data,
        from: mySocketIdRef.current,
        name: user.name,
        picture: user.picture,
        callType,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
      destroyPeer();
    });

    connectionRef.current = peer;
  };

  // ── Answer incoming call ────────────────────────────────────────────────────
  const answerCall = async () => {
    const callType = call.callType || "video";

    // Acquire media on-demand — only when the user actually answers a call
    let callStream;
    try {
      callStream = await acquireMedia(callType);
    } catch (err) {
      alert(
        callType === "audio"
          ? "Microphone access was denied. Please allow microphone access and try again."
          : "Camera/microphone access was denied. Please allow access and try again."
      );
      return;
    }

    setStream(callStream);
    streamRef.current = callStream;
    callTypeRef.current = callType;
    setCallAccepted(true);
    callAcceptedRef.current = true;
    setShow(true);

    // Attach local video stream immediately
    if (callType === "video" && myVideo.current) {
      myVideo.current.srcObject = callStream;
    }

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: callStream,
    });

    peer.on("signal", (data) => {
      socket.emit("answer call", { signal: data, to: call.socketId });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
      destroyPeer();
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  // ── End call (local action) ────────────────────────────────────────────────
  const endCall = () => {
    socket.emit("end call", remoteSocketIdRef.current);
    setShow(false);
    destroyPeer();
    stopMedia();
    setCall((prev) => ({ ...prev, callEnded: true, receiveingCall: false }));
    resetAfterCall();
  };

  // ── Conversations ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.token) {
      dispatch(getConversations(user.token));
    }
  }, [user]);

  useEffect(() => {
    socket.on("receive message", (message) => {
      dispatch(updateMessagesAndConversations(message));
    });
    socket.on("typing", (conversation) => setTyping(conversation));
    socket.on("stop typing", () => setTyping(false));

    socket.on("message status updated", (data) => {
      dispatch(updateMessageStatus(data));
    });

    socket.on("messages read", (data) => {
      dispatch(updateAllMessagesRead({ convoId: data.convoId, userId: data.readBy }));
    });

    socket.on("messages delivered", (data) => {
      dispatch(updateAllMessagesDelivered({ convoId: data.convoId, userId: data.deliveredTo }));
    });

    return () => {
      socket.off("receive message");
      socket.off("typing");
      socket.off("stop typing");
      socket.off("message status updated");
      socket.off("messages read");
      socket.off("messages delivered");
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="h-screen w-screen dark:bg-dark_bg_1 flex items-center justify-center overflow-hidden bg-gradient-to-br from-dark_bg_6 via-dark_bg_1 to-dark_bg_2">
        <div className="w-full h-full flex overflow-hidden">
          <Sidebar onlineUsers={onlineUsers} typing={typing} />
          {activeConversation._id ? (
            <ChatContainer
              onlineUsers={onlineUsers}
              callUser={callUser}
              typing={typing}
            />
          ) : (
            <ChatBuddyHome />
          )}
        </div>
      </div>

      {/* Call overlay */}
      <div className={(show || call.signal) && !call.callEnded ? "" : "hidden"}>
        <Call
          call={call}
          setCall={setCall}
          callAccepted={callAccepted}
          myVideo={myVideo}
          userVideo={userVideo}
          stream={stream}
          answerCall={answerCall}
          show={show}
          endCall={endCall}
        />
      </div>
    </>
  );
}

const HomeWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Home {...props} socket={socket} />}
  </SocketContext.Consumer>
);
export default HomeWithSocket;