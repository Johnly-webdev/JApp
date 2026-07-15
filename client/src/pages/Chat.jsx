import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);

  const loadConversations = async () => {
    const res = await api.get("/conversations");
    setConversations(res.data.conversations);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleStartConversation = async (userId) => {
    const res = await api.post("/conversations", { userId });
    await loadConversations();
    setActive(res.data.conversation);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        conversations={conversations}
        activeId={active?._id}
        onSelect={setActive}
        onStartConversation={handleStartConversation}
      />
      {active ? (
        <ChatWindow conversation={active} />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-ink-950">
          <p className="font-display text-xl text-ink-500">
            Pick a conversation, or search for someone new
          </p>
        </div>
      )}
    </div>
  );
};

export default Chat;
