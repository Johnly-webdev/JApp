import { useEffect, useRef, useState } from "react";
import { HiOutlinePaperAirplane } from "react-icons/hi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ conversation }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const other = conversation.participants.find(
    (p) => (p.id || p._id) !== user.id
  );

  useEffect(() => {
    if (!conversation) return;
    api.get(`/messages/${conversation._id}`).then((res) => setMessages(res.data.messages));
    socket?.emit("joinRoom", conversation._id);
    return () => socket?.emit("leaveRoom", conversation._id);
  }, [conversation, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      if (message.conversation !== conversation._id) return;
      setMessages((prev) => [...prev, message]);
      socket.emit("messageSeen", { messageId: message._id });
    };

    const handleTyping = ({ conversationId }) => {
      if (conversationId === conversation._id) setTyping(true);
    };
    const handleStopTyping = ({ conversationId }) => {
      if (conversationId === conversation._id) setTyping(false);
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, conversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit("typing", { conversationId: conversation._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId: conversation._id });
    }, 1200);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit(
      "sendMessage",
      { conversationId: conversation._id, text: text.trim() },
      (res) => {
        if (res?.error) console.error(res.error);
      }
    );
    setText("");
    socket.emit("stopTyping", { conversationId: conversation._id });
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-ink-950">
      <div className="flex items-center gap-3 border-b border-ink-800 px-5 py-3">
        <div className="relative h-9 w-9 rounded-full bg-ink-700 flex items-center justify-center font-display text-ink-100">
          {(conversation.isGroup ? conversation.name : other?.name)?.charAt(0).toUpperCase()}
          {other?.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-signal-500 ring-2 ring-ink-950" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-ink-50">
            {conversation.isGroup ? conversation.name : other?.name}
          </p>
          <p className="text-xs text-ink-400 font-mono">
            {typing ? "typing…" : other?.isOnline ? "online" : "offline"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            message={m}
            isOwn={(m.sender.id || m.sender._id || m.sender) === user.id}
            otherUserId={other?.id || other?._id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-ink-800 p-3">
        <input
          value={text}
          onChange={handleChange}
          placeholder="Write a message…"
          className="flex-1 rounded-xl border border-ink-800 bg-ink-900 px-4 py-2.5 text-sm text-ink-50 placeholder-ink-600 focus:border-ember-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-xl bg-ember-500 p-2.5 text-ink-950 transition hover:bg-ember-400 disabled:opacity-40"
        >
          <HiOutlinePaperAirplane className="rotate-90" size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
