import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const quickActions = [
  'How does the AI work?',
  'Show me pricing options',
  'Can I self-host this?',
  'Integration options?',
];

const aiResponses: Record<string, string> = {
  'How does the AI work?':
    'Our AI uses advanced language models trained on millions of support conversations. It understands context, sentiment, and can draft responses that match your brand voice. The AI learns from your knowledge base and improves over time!',
  'Show me pricing options':
    'We offer three plans:\n\n• Open Source (Free): Self-host with all core features\n• Cloud Pro ($29/mo): Managed hosting with 99.9% uptime\n• Enterprise (Custom): Dedicated infrastructure and custom AI training\n\nAll plans include unlimited agents and conversations!',
  'Can I self-host this?':
    'Absolutely! ProResponse AI is 100% open source. You can deploy it on your own infrastructure with just a few commands. We provide Docker images, Kubernetes configs, and detailed documentation. Your data never leaves your servers!',
  'Integration options?':
    'ProResponse AI integrates with all major platforms:\n\n• Email providers (Gmail, Outlook, etc.)\n• Chat platforms (Slack, Discord, Teams)\n• CRMs (Salesforce, HubSpot, Pipedrive)\n• APIs for custom integrations\n\nSetup takes less than 5 minutes!',
};

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ text: string; isAi: boolean }>
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleQuickAction = (question: string) => {
    setHasInteracted(true);
    setMessages((prev) => [...prev, { text: question, isAi: false }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          text:
            aiResponses[question] ||
            "I'd be happy to help! Feel free to ask any questions about ProResponse AI.",
          isAi: true,
        },
      ]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 200 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300',
            'bg-gradient-to-br from-purple-primary to-ai-purple hover:from-purple-dark hover:to-purple-primary',
            'flex items-center justify-center group'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <MessageSquare className="w-8 h-8 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse animation */}
          {!isOpen && !hasInteracted && (
            <>
              <span className="absolute inset-0 rounded-full bg-purple-primary animate-ping opacity-25" />
              <span className="absolute inset-0 rounded-full bg-purple-primary animate-ping opacity-25 animation-delay-500" />
            </>
          )}

          {/* Notification badge */}
          {!isOpen && !hasInteracted && (
            <motion.span
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 3 }}
            />
          )}
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] z-50"
          >
            <div className="bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-primary to-ai-purple p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-xs opacity-90 flex items-center gap-1">
                      <span className="w-2 h-2 bg-success-green rounded-full animate-pulse" />
                      Always online • Responds in seconds
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <Sparkles className="w-12 h-12 text-purple-primary mx-auto mb-4 animate-sparkle" />
                    <p className="text-muted-foreground mb-4">
                      Hi! I'm your AI assistant. Ask me anything about
                      ProResponse AI!
                    </p>
                    <div className="space-y-2">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={action}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleQuickAction(action)}
                          className="block w-full text-left px-4 py-2 rounded-lg bg-purple-primary/10 hover:bg-purple-primary/20 text-sm transition-colors"
                        >
                          {action}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex',
                          message.isAi ? 'justify-start' : 'justify-end'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2',
                            message.isAi
                              ? 'bg-muted text-foreground rounded-tl-none'
                              : 'bg-gradient-to-r from-purple-primary to-ai-purple text-white rounded-tr-none'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.text}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-200" />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-400" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 rounded-full bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary"
                    disabled
                  />
                  <button className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-primary to-ai-purple text-white flex items-center justify-center hover:from-purple-dark hover:to-purple-primary transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  This is a demo. Try the quick actions above!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
