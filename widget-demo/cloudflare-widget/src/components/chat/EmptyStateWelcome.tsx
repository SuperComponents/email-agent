import { motion } from "framer-motion";
import { Card } from "@/components/card/Card";
import { Robot } from "@phosphor-icons/react";

export const EmptyStateWelcome = () => {
  return (
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
  );
};
