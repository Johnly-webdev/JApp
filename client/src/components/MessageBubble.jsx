import { HiCheck, HiCheckCircle } from "react-icons/hi";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const MessageBubble = ({ message, isOwn, otherUserId }) => {
  const seen = message.seenBy?.some((id) => String(id) === String(otherUserId));

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-1`}>
      <div
        className={`max-w-[70%] rounded-bubble px-4 py-2 text-sm ${
          isOwn
            ? "bg-ember-500 text-ink-950 rounded-br-sm"
            : "bg-ink-800 text-ink-50 rounded-bl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <div
          className={`mt-1 flex items-center gap-1 text-[10px] font-mono ${
            isOwn ? "text-ink-950/60 justify-end" : "text-ink-400"
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isOwn &&
            (seen ? (
              <HiCheckCircle className="text-signal-500" size={13} />
            ) : (
              <HiCheck size={13} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
