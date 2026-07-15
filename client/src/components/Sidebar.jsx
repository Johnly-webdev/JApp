import { useEffect, useState } from "react";
import { HiOutlineSearch, HiOutlineLogout } from "react-icons/hi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ conversations, activeId, onSelect, onStartConversation }) => {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      setResults(res.data.users);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const otherParticipant = (conversation) =>
    conversation.participants.find((p) => p.id !== user.id && p._id !== user.id) ||
    conversation.participants[0];

  return (
    <aside className="flex h-full w-full max-w-xs flex-col border-r border-ink-800 bg-ink-900">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-ember-500 flex items-center justify-center font-display text-ink-950 text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-display text-lg text-ink-50">{user.name}</span>
        </div>
        <button
          onClick={logout}
          title="Log out"
          className="text-ink-400 hover:text-ember-500 transition"
        >
          <HiOutlineLogout size={20} />
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-950 px-3 py-2">
          <HiOutlineSearch className="text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find people…"
            className="w-full bg-transparent text-sm text-ink-50 placeholder-ink-600 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          results.map((u) => (
            <button
              key={u.id}
              onClick={() => onStartConversation(u.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-ink-800"
            >
              <div className="h-10 w-10 rounded-full bg-ink-700 flex items-center justify-center font-display text-ink-100">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-50">{u.name}</p>
                <p className="text-xs text-ink-400">@{u.username}</p>
              </div>
            </button>
          ))
        ) : conversations.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-ink-500">
            No conversations yet — search for someone to say hi.
          </p>
        ) : (
          conversations.map((c) => {
            const other = otherParticipant(c);
            const active = c._id === activeId;
            return (
              <button
                key={c._id}
                onClick={() => onSelect(c)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                  active ? "bg-ink-800" : "hover:bg-ink-800/60"
                }`}
              >
                <div className="relative h-10 w-10 shrink-0 rounded-full bg-ink-700 flex items-center justify-center font-display text-ink-100">
                  {other?.name?.charAt(0).toUpperCase()}
                  {other?.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-signal-500 ring-2 ring-ink-900" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-50">
                    {c.isGroup ? c.name : other?.name}
                  </p>
                  <p className="truncate text-xs text-ink-400">
                    {c.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
