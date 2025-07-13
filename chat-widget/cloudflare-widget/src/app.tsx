import { useEffect, useState, useRef, useCallback } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "agents/ai-react";
import type { tools } from "./tools";
import { motion, AnimatePresence } from "framer-motion";

// Component imports
import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { Avatar } from "@/components/avatar/Avatar";
import { Toggle } from "@/components/toggle/Toggle";
import { Textarea } from "@/components/textarea/Textarea";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ToolInvocationCard } from "@/components/tool-invocation-card/ToolInvocationCard";
import { TypingIndicator } from "@/components/TypingIndicator";

// Icon imports
import {
  Bug,
  Moon,
  Robot,
  Sun,
  Trash,
  PaperPlaneTilt,
  Stop,
  X,
} from "@phosphor-icons/react";

// Define Message type locally
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: Array<{
    type: string;
    text?: string;
    toolInvocation?: any;
  }>;
  createdAt: Date;
}

// List of tools that require human confirmation
// NOTE: this should match the keys in the executions object in tools.ts
const toolsRequiringConfirmation: (keyof typeof tools)[] = [
  "getWeatherInformation",
];

export default function Chat() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    // Check localStorage first, default to dark if not found
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "dark" | "light") || "dark";
  });
  const [showDebug, setShowDebug] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Apply theme class on mount and when theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  
  // Close the iframe & show the floating button


  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const handleCloseWidget = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "CLOSE_WIDGET" }, "*");
    }
  };

  const agent = useAgent({
    agent: "chat",
  });

  const {
    messages: agentMessages,
    input: agentInput,
    handleInputChange: handleAgentInputChange,
    handleSubmit: handleAgentSubmit,
    addToolResult,
    clearHistory,
    isLoading,
    stop,
  } = useAgentChat({
    agent,
    maxSteps: 5,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    agentMessages.length > 0 && scrollToBottom();
  }, [agentMessages, scrollToBottom]);

  const pendingToolCallConfirmation = agentMessages.some((m: Message) =>
    m.parts?.some(
      (part) =>
        part.type === "tool-invocation" &&
        part.toolInvocation.state === "call" &&
        toolsRequiringConfirmation.includes(
          part.toolInvocation.toolName as keyof typeof tools
        )
    )
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-[100vh] w-full p-2 sm:p-4 flex justify-center items-center gradient-bg overflow-hidden">
      <div className="widget-container h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] w-full mx-auto max-w-lg flex flex-col rounded-2xl overflow-hidden relative backdrop-blur-xl" role="main" aria-label="ProResponse AI Chat Widget">
        <div className="widget-header px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3" role="banner">
          <motion.div 
            className="flex items-center justify-center h-8 w-8 relative"
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/favicon-32x32.png"
              alt="ProResponse AI"
              width="28"
              height="28"
              className="rounded-sm"
            />
            {/* Sparkle effects */}
            <span className="sparkle" style={{ top: '-2px', left: '20px', animationDelay: '0s' }}></span>
            <span className="sparkle" style={{ top: '10px', right: '-2px', animationDelay: '0.5s' }}></span>
            <span className="sparkle" style={{ bottom: '-2px', left: '10px', animationDelay: '1s' }}></span>
          </motion.div>

          <div className="flex-1">
            <h2 className="font-semibold text-sm sm:text-base gradient-text">ProResponse AI</h2>
          </div>

          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 mr-2"
          >
            <Bug size={16} className="text-ai-purple" />
            <Toggle
              toggled={showDebug}
              aria-label="Toggle debug mode"
              onClick={() => setShowDebug((prev) => !prev)}
            />
          </motion.div>

          <Button
            variant="ghost"
            size="md"
            shape="square"
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:scale-110 transition-transform"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-purple-600" />}
          </Button>

          <Button
            variant="ghost"
            size="md"
            shape="square"
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:text-red-500 hover:scale-110 transition-all"
            aria-label="Clear chat history"
            onClick={clearHistory}
          >
            <Trash size={20} />
          </Button>
        </div>
          <Button
            variant="ghost"
            size="md"
            shape="square"
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:rotate-90 transition-all duration-300"
            aria-label="Close chat widget"
            onClick={handleCloseWidget}
          >
            <X size={20} />
          </Button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-24 max-h-[calc(100vh-10rem)] relative" role="log" aria-label="Chat messages">
          {agentMessages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="h-full flex items-center justify-center"
            >
              <Card className="premium-card glass p-8 max-w-md mx-auto">
                <div className="text-center space-y-6">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-primary/20 to-ai-purple/20 rounded-full p-4 inline-flex glow"
                  >
                    <Robot size={32} className="text-ai-purple" />
                  </motion.div>
                  <h3 className="font-bold text-xl gradient-text">Welcome to ProResponse AI</h3>
                  <p className="text-muted-foreground text-sm">
                    Start a conversation with your AI-powered support assistant.
                  </p>
                  <ul className="text-sm text-left space-y-3">
                    <motion.li 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-3 hover:translate-x-1 transition-transform"
                    >
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-ai-purple"></span>
                      <span>Get instant support assistance</span>
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 hover:translate-x-1 transition-transform"
                    >
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-ai-purple"></span>
                      <span>Ask questions about your account</span>
                    </motion.li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {agentMessages.map((m: Message, index) => {
              const isUser = m.role === "user";
              const showAvatar =
                index === 0 || agentMessages[index - 1]?.role !== m.role;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  {showDebug && (
                    <pre className="text-xs text-muted-foreground overflow-scroll">
                      {JSON.stringify(m, null, 2)}
                    </pre>
                  )}
                  <div
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[85%] ${
                        isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {showAvatar && !isUser ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Avatar username={"AI"} className="ring-2 ring-ai-purple/20" />
                        </motion.div>
                      ) : (
                        !isUser && <div className="w-8" />
                      )}

                      <div>
                        <div>
                          {m.parts?.map((part, i) => {
                            if (part.type === "text") {
                              return (
                                // biome-ignore lint/suspicious/noArrayIndexKey: immutable index
                                <motion.div 
                                  key={i}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                    delay: i * 0.05,
                                  }}
                                >
                                  <Card
                                    className={`p-4 rounded-2xl ${
                                      isUser
                                        ? "message-bubble user text-white rounded-tr-sm"
                                        : "message-bubble assistant rounded-tl-sm"
                                    } ${
                                      part.text.startsWith("scheduled message")
                                        ? "border-accent/50"
                                        : ""
                                    } relative transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
                                  >
                                    {part.text.startsWith(
                                      "scheduled message"
                                    ) && (
                                      <span className="absolute -top-3 -left-2 text-base">
                                        🕒
                                      </span>
                                    )}
                                    <MemoizedMarkdown
                                      id={`${m.id}-${i}`}
                                      content={part.text.replace(
                                        /^scheduled message: /,
                                        ""
                                      )}
                                    />
                                  </Card>
                                  <p
                                    className={`text-xs text-muted-foreground mt-1 ${
                                      isUser ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {formatTime(
                                      new Date(m.createdAt as unknown as string)
                                    )}
                                  </p>
                                </motion.div>
                              );
                            }

                          if (part.type === "tool-invocation") {
                            const toolInvocation = part.toolInvocation;
                            const toolCallId = toolInvocation.toolCallId;
                            const needsConfirmation =
                              toolsRequiringConfirmation.includes(
                                toolInvocation.toolName as keyof typeof tools
                              );

                            // Skip rendering the card in debug mode
                            if (showDebug) return null;

                            return (
                              <ToolInvocationCard
                                // biome-ignore lint/suspicious/noArrayIndexKey: using index is safe here as the array is static
                                key={`${toolCallId}-${i}`}
                                toolInvocation={toolInvocation}
                                toolCallId={toolCallId}
                                needsConfirmation={needsConfirmation}
                                addToolResult={addToolResult}
                              />
                            );
                          }
                          return null;
                        })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAgentSubmit(e, {
              data: {
                annotations: {
                  hello: "world",
                },
              },
            });
            setTextareaHeight("auto"); // Reset height after submission
          }}
          className="p-3 sm:p-4 glass absolute bottom-0 left-0 right-0 z-10 border-t border-white/10"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Textarea
                disabled={pendingToolCallConfirmation}
                placeholder={
                  pendingToolCallConfirmation
                    ? "Please respond to the tool confirmation above..."
                    : "Send a message..."
                }
                className="premium-input flex w-full border border-neutral-200/50 dark:border-neutral-700/50 px-4 py-3 ring-offset-background placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base pb-12 backdrop-blur-sm"
                value={agentInput}
                aria-label="Message input"
                aria-required="true"
                aria-invalid={false}
                onChange={(e) => {
                  handleAgentInputChange(e);
                  // Auto-resize the textarea
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  setTextareaHeight(`${e.target.scrollHeight}px`);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    handleAgentSubmit(e as unknown as React.FormEvent);
                    setTextareaHeight("auto"); // Reset height on Enter submission
                  }
                }}
                rows={2}
                style={{ height: textareaHeight }}
              />
              <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
                {isLoading ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:scale-110 active:scale-95 rounded-full p-2 h-fit glow"
                    aria-label="Stop generation"
                  >
                    <Stop size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai-purple focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gradient-to-r from-primary to-ai-purple text-white hover:shadow-xl hover:scale-110 active:scale-95 rounded-full p-2 h-fit glow"
                    disabled={pendingToolCallConfirmation || !agentInput.trim()}
                    aria-label="Send message"
                  >
                    <PaperPlaneTilt size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
