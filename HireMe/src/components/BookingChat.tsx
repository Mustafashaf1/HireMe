import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function BookingChat({ bookingId, onBack }: { bookingId: string; onBack: () => void }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.messages.getMessages, { bookingId: bookingId as any });
  const sendMessage = useMutation(api.messages.sendMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        bookingId: bookingId as any,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  if (messages === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-primary hover:underline flex items-center gap-2"
      >
        ← Back to dashboard
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Booking Chat</h2>
        </div>

        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isOwnMessage
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">{message.senderName}</p>
                  <p>{message.content}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(message._creationTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
