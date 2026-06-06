import mongoose from "mongoose";
import { MessageModel, ConversationModel } from "./models/index.js";

let onlineUsers = [];
export default function (socket, io) {
  //user joins or opens the application
  socket.on("join", async (user) => {
    socket.userId = user;
    socket.join(user);
    //add joined user to online users
    if (!onlineUsers.some((u) => u.userId === user)) {
      onlineUsers.push({ userId: user, socketId: socket.id });
    }
    //send online users to frontend
    io.emit("get-online-users", onlineUsers);
    // Send socket id only to the connecting socket (not broadcast to all)
    socket.emit("setup socket", socket.id);

    // Update offline messages to "delivered" status
    try {
      const conversations = await ConversationModel.find({ users: user });
      const convoIds = conversations.map((c) => c._id);
      
      if (convoIds.length > 0) {
        const convoIdObjs = convoIds.map((id) => new mongoose.Types.ObjectId(id));
        const userObjId = new mongoose.Types.ObjectId(user);

        await MessageModel.updateMany(
          {
            conversation: { $in: convoIdObjs },
            sender: { $ne: userObjId },
            status: "sent",
          },
          { status: "delivered" }
        );

        // Notify other participants in each conversation by sending directly to their personal rooms
        for (const convo of conversations) {
          convo.users.forEach((u) => {
            const participantId = u.toString();
            if (participantId !== user) {
              io.to(participantId).emit("messages delivered", {
                convoId: convo._id.toString(),
                deliveredTo: user,
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("Error updating delivery status on join:", err);
    }
  });

  //socket disconnect
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-online-users", onlineUsers);
  });

  //join a conversation room
  socket.on("join conversation", async (conversation) => {
    // Leave previous conversation rooms first so we are only in the active one
    Array.from(socket.rooms).forEach((room) => {
      if (room !== socket.id && room !== socket.userId && room !== conversation) {
        socket.leave(room);
      }
    });

    socket.join(conversation);
    try {
      const userId = socket.userId || onlineUsers.find((u) => u.socketId === socket.id)?.userId;
      if (userId) {
        const convoObjId = new mongoose.Types.ObjectId(conversation);
        const userObjId = new mongoose.Types.ObjectId(userId);

        // Update all unread messages in this conversation from others to "read"
        await MessageModel.updateMany(
          {
            conversation: convoObjId,
            sender: { $ne: userObjId },
            status: { $ne: "read" },
          },
          { status: "read" }
        );
        
        // Find the conversation to get the list of users
        const convo = await ConversationModel.findById(conversation);
        if (convo) {
          // Send messages read update to all participants' personal rooms
          convo.users.forEach((u) => {
            io.to(u.toString()).emit("messages read", {
              convoId: conversation,
              readBy: userId,
            });
          });
        }
      }
    } catch (err) {
      console.error("Error updating read status on join conversation:", err);
    }
  });

  //send and receive message
  socket.on("send message", async (message) => {
    let conversation = message.conversation;
    if (!conversation.users) return;

    try {
      const senderId = message.sender._id.toString();
      const conversationId = conversation._id.toString();

      // Find other users in conversation (use toString() to avoid ObjectId vs string mismatch)
      const otherUsers = conversation.users.filter(
        (u) => (u._id || u).toString() !== senderId
      );

      let finalStatus = "sent";
      const clientsInRoom = io.sockets.adapter.rooms.get(conversationId);

      for (const recipient of otherUsers) {
        const recipientId = (recipient._id || recipient).toString();
        const recipientSockets = onlineUsers.filter((u) => u.userId === recipientId);
        
        if (recipientSockets.length > 0) {
          // Recipient is online. Check if they are in the active conversation room.
          const isViewing = recipientSockets.some(
            (s) => clientsInRoom && clientsInRoom.has(s.socketId)
          );
          if (isViewing) {
            finalStatus = "read";
          } else {
            finalStatus = "delivered";
          }
        }
      }

      // Update status in the database
      if (finalStatus !== "sent") {
        await MessageModel.updateOne(
          { _id: message._id },
          { status: finalStatus }
        );
        message.status = finalStatus;
      }

      // Relay message to other users (use toString() to avoid ObjectId vs string mismatch)
      conversation.users.forEach((user) => {
        const uid = (user._id || user).toString();
        if (uid === senderId) return;
        socket.in(uid).emit("receive message", message);
      });

      // Notify the sender of status change directly to their personal room
      if (finalStatus !== "sent") {
        io.to(senderId).emit("message status updated", {
          messageId: message._id,
          status: finalStatus,
          conversationId,
        });
      }

      // If the new message is immediately read, also bulk-update all prior
      // unread messages from this sender so they turn blue on both sides
      if (finalStatus === "read") {
        try {
          const senderObjId = new mongoose.Types.ObjectId(senderId);
          const convoObjId = new mongoose.Types.ObjectId(conversationId);
          await MessageModel.updateMany(
            {
              conversation: convoObjId,
              sender: senderObjId,
              status: { $ne: "read" },
            },
            { status: "read" }
          );
          // Tell the sender that all their messages in this convo are now read
          io.to(senderId).emit("messages read", {
            convoId: conversationId,
            readBy: otherUsers[0] ? (otherUsers[0]._id || otherUsers[0]).toString() : "",
          });
        } catch (bulkErr) {
          console.error("Error bulk-updating messages to read on send:", bulkErr);
        }
      }
    } catch (err) {
      console.error("Error processing message status on send message:", err);
    }
  });

  // relay typing event to the conversation room
  socket.on("typing", (conversation) => {
    socket.in(conversation).emit("typing", conversation);
  });

  socket.on("stop typing", (conversation) => {
    socket.in(conversation).emit("stop typing");
  });

  //call
  //---call user
  socket.on("call user", (data) => {
    let userId = data.userToCall;
    let userSocketId = onlineUsers.find((user) => user.userId == userId);
    // Guard against callee being offline
    if (!userSocketId) {
      socket.emit("call user not available");
      return;
    }
    io.to(userSocketId.socketId).emit("call user", {
      signal: data.signal,
      from: data.from,          // caller's own socket ID — receiver needs this to answer
      name: data.name,
      picture: data.picture,
      callType: data.callType,  // "audio" | "video" — must be forwarded so receiver uses correct media
    });
  });

  //---answer call
  socket.on("answer call", (data) => {
    io.to(data.to).emit("call accepted", {
      signal: data.signal,
      from: socket.id,   // <-- responder's socket ID sent to caller
    });
  });

  //---end call
  socket.on("end call", (id) => {
    io.to(id).emit("end call");
  });
}