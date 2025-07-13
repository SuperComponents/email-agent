import { motion, AnimatePresence } from "framer-motion";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { EmptyStateWelcome } from "./EmptyStateWelcome";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "../TypingIndicator";
import { Avatar } from "../avatar/Avatar";
import type { Message } from "../../types/Message";

interface MessageAreaProps {
  messages: Message[];
  isLoading: boolean;
  addToolResult: (messageId: string, toolCallId: string, result: any) => void;
}

export function MessageArea({ messages, isLoading, addToolResult }: MessageAreaProps) {
  const { messagesEndRef } = useAutoScroll([messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-24 max-h-[calc(100vh-10rem)] relative" role="log" aria-label="Chat messages">
      {messages.length === 0 && <EmptyStateWelcome />}

      <AnimatePresence initial={false}>
        {messages.map((m: Message, index) => (
          <ChatMessage
            key={m.id}
            message={m}
            index={index}
            messages={messages}
            addToolResult={addToolResult}
          />
        ))}
      </AnimatePresence>
      
      {/* Typing Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex justify-start"
          >
            <div className="flex gap-2 max-w-[85%]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <Avatar username={"AI"} className="ring-2 ring-ai-purple/20" />
              </motion.div>
              <div className="glass rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex gap-1">
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div ref={messagesEndRef} />
    </div>
  );
}
