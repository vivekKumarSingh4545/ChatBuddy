import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const CONVERSATION_ENDPOINT = `${import.meta.env.VITE_API_ENDPOINT}/conversation`;
const MESSAGE_ENDPOINT = `${import.meta.env.VITE_API_ENDPOINT}/message`;


const initialState = {
  status: "",
  error: "",
  conversations: [],
  activeConversation: {},
  messages: [],
  notifications: [],
  files: [],
};

//functions
export const getConversations = createAsyncThunk(
  "conervsation/all",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(CONVERSATION_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);

export const open_create_conversation = createAsyncThunk(
  "conervsation/open_create",
  async (values, { rejectWithValue }) => {
    const { token, receiver_id } = values;
    try {
      const { data } = await axios.post(
        CONVERSATION_ENDPOINT,
        { receiver_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);

export const getConversationMessages = createAsyncThunk(
  "conervsation/messages",
  async (values, { rejectWithValue }) => {
    const { token, convo_id } = values;
    try {
      const { data } = await axios.get(`${MESSAGE_ENDPOINT}/${convo_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);
export const sendMessage = createAsyncThunk(
  "message/send",
  async (values, { rejectWithValue }) => {
    const { token, message, convo_id, files } = values;
    try {
      const { data } = await axios.post(
        MESSAGE_ENDPOINT,
        {
          message,
          convo_id,
          files,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    updateMessagesAndConversations: (state, action) => {
      //update messages
      let convo = state.activeConversation;
      if (convo._id === action.payload.conversation._id) {
        state.messages = [...state.messages, action.payload];
      }
      //update conversations
      let conversation = {
        ...action.payload.conversation,
        latestMessage: action.payload,
      };
      let newConvos = [...state.conversations].filter(
        (c) => c._id !== conversation._id
      );
      newConvos.unshift(conversation);
      state.conversations = newConvos;
    },
    addFiles: (state, action) => {
      state.files = [...state.files, action.payload];
    },
    clearFiles: (state) => {
      state.files = [];
    },
    removeFile: (state, action) => {
      state.files = state.files.filter((_, index) => index !== action.payload);
    },
    clearChatState: (state) => {
      state.status = "";
      state.error = "";
      state.conversations = [];
      state.activeConversation = {};
      state.messages = [];
      state.notifications = [];
      state.files = [];
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      state.messages = state.messages.map((m) =>
        m._id === messageId ? { ...m, status } : m
      );
      state.conversations = state.conversations.map((c) =>
        c.latestMessage?._id === messageId
          ? { ...c, latestMessage: { ...c.latestMessage, status } }
          : c
      );
    },
    updateAllMessagesRead: (state, action) => {
      const { convoId, userId } = action.payload;
      state.messages = state.messages.map((m) => {
        const mConvoId = (m.conversation?._id || m.conversation || "").toString();
        const mSenderId = (m.sender?._id || m.sender || "").toString();
        return mConvoId === convoId && mSenderId !== userId
          ? { ...m, status: "read" }
          : m;
      });
      state.conversations = state.conversations.map((c) => {
        const latestSenderId = (c.latestMessage?.sender?._id || c.latestMessage?.sender || "").toString();
        return c._id === convoId && c.latestMessage && latestSenderId !== userId
          ? { ...c, latestMessage: { ...c.latestMessage, status: "read" } }
          : c;
      });
    },
    updateAllMessagesDelivered: (state, action) => {
      const { convoId, userId } = action.payload;
      state.messages = state.messages.map((m) => {
        const mConvoId = (m.conversation?._id || m.conversation || "").toString();
        const mSenderId = (m.sender?._id || m.sender || "").toString();
        return mConvoId === convoId && mSenderId !== userId && m.status === "sent"
          ? { ...m, status: "delivered" }
          : m;
      });
      state.conversations = state.conversations.map((c) => {
        const latestSenderId = (c.latestMessage?.sender?._id || c.latestMessage?.sender || "").toString();
        return c._id === convoId && c.latestMessage && latestSenderId !== userId && c.latestMessage.status === "sent"
          ? { ...c, latestMessage: { ...c.latestMessage, status: "delivered" } }
          : c;
      });
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getConversations.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(open_create_conversation.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(open_create_conversation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activeConversation = action.payload;
      })
      .addCase(open_create_conversation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(getConversationMessages.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getConversationMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = action.payload;
      })
      .addCase(getConversationMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = [...state.messages, action.payload];
        let conversation = {
          ...action.payload.conversation,
          latestMessage: action.payload,
        };
        let newConvos = [...state.conversations].filter(
          (c) => c._id !== conversation._id
        );
        newConvos.unshift(conversation);
        state.conversations = newConvos;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setActiveConversation,
  updateMessagesAndConversations,
  addFiles,
  clearFiles,
  removeFile,
  clearChatState,
  updateMessageStatus,
  updateAllMessagesRead,
  updateAllMessagesDelivered,
} = chatSlice.actions;

export default chatSlice.reducer;