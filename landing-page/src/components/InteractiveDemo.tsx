import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Mail, 
  User, 
  Bot, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Tag,
  Search,
  Zap,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  status: 'unread' | 'processing' | 'resolved';
  urgency: 'normal' | 'high' | 'urgent';
  category?: string;
}

interface AIResponse {
  text: string;
  confidence: number;
  context: string[];
  suggestedTags: string[];
}

const mockEmails: Email[] = [
  {
    id: '1',
    from: 'Sarah Johnson',
    subject: 'Unable to export data',
    preview: "I've been trying to export my analytics data for the past hour but keep getting an error...",
    timestamp: '2 min ago',
    status: 'unread',
    urgency: 'high'
  },
  {
    id: '2',
    from: 'Michael Chen',
    subject: 'Billing question',
    preview: 'Hi, I noticed I was charged twice this month. Could you please look into this?',
    timestamp: '5 min ago',
    status: 'unread',
    urgency: 'urgent'
  },
  {
    id: '3',
    from: 'Emma Wilson',
    subject: 'Feature request: Dark mode',
    preview: 'Love your product! Would be amazing if you could add a dark mode option...',
    timestamp: '12 min ago',
    status: 'unread',
    urgency: 'normal'
  },
  {
    id: '4',
    from: 'David Lee',
    subject: 'Great customer service!',
    preview: 'Just wanted to say thank you for the quick help yesterday. Your team is amazing!',
    timestamp: '18 min ago',
    status: 'unread',
    urgency: 'normal'
  }
];

const aiResponses: Record<string, AIResponse> = {
  '1': {
    text: "I understand you're experiencing issues with data export. This is likely related to our recent API update. Let me provide you with a quick solution:\n\n1. Clear your browser cache\n2. Try using Chrome or Firefox\n3. If the issue persists, I can manually export your data\n\nWould you like me to proceed with the manual export?",
    confidence: 95,
    context: ['API Update Notice', 'Export Troubleshooting Guide', 'Customer History: Premium Plan'],
    suggestedTags: ['bug', 'export-issue', 'high-priority']
  },
  '2': {
    text: "I apologize for the billing error. I've reviewed your account and confirmed the duplicate charge of $29.99 on January 8th.\n\nI've initiated a refund for the duplicate charge, which should appear in your account within 3-5 business days. I've also added a 20% discount to your next invoice as an apology for the inconvenience.\n\nIs there anything else I can help you with?",
    confidence: 98,
    context: ['Billing History', 'Refund Policy', 'Customer Value: High'],
    suggestedTags: ['billing', 'refund-processed', 'urgent']
  },
  '3': {
    text: "Thank you for the feature suggestion! Dark mode is actually one of our most requested features, and I'm happy to share that it's currently in development.\n\nExpected release: End of Q1 2024\n\nI've added your vote to this feature request. Would you like me to notify you when it's available?",
    confidence: 92,
    context: ['Feature Roadmap', 'Similar Requests: 127', 'Product Team Notes'],
    suggestedTags: ['feature-request', 'roadmap', 'dark-mode']
  },
  '4': {
    text: "Thank you so much for taking the time to share this wonderful feedback! It truly makes our day to hear that we could help.\n\nI'll make sure to share your kind words with the team member who assisted you. Reviews like yours motivate us to keep delivering exceptional service.\n\nIf you have a moment, we'd love if you could share your experience on our review page. Thank you for being an amazing customer!",
    confidence: 88,
    context: ['Previous Interaction: Resolved Issue', 'Customer Sentiment: Positive', 'Team Performance Metrics'],
    suggestedTags: ['positive-feedback', 'testimonial', 'resolved']
  }
};

export function InteractiveDemo() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showContext, setShowContext] = useState(false);
  const controls = useAnimation();
  const textRef = useRef<string>('');

  useEffect(() => {
    if (aiResponse && selectedEmail) {
      textRef.current = aiResponse.text;
      setTypedText('');
      setIsProcessing(true);
      
      // Simulate AI processing
      setTimeout(() => {
        setIsProcessing(false);
        setShowContext(true);
        typeText();
      }, 1500);
    }
  }, [aiResponse, selectedEmail]);

  const typeText = () => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < textRef.current.length) {
        setTypedText(prev => prev + textRef.current[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setAiResponse(aiResponses[email.id]);
    setShowContext(false);
    
    // Animate the selection
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 }
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      default: return 'text-green-500';
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Animated background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-ai-purple/10 rounded-full blur-3xl animate-float delay-700" />
      </div>

      <div className="relative grid lg:grid-cols-2 gap-8 p-8">
        {/* Email Inbox */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold gradient-text">Support Inbox</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-purple-primary animate-sparkle" />
              AI-Powered
            </div>
          </div>

          <AnimatePresence>
            {mockEmails.map((email, index) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleEmailClick(email)}
                className={cn(
                  "relative p-4 rounded-xl cursor-pointer transition-all duration-300",
                  "border-2 hover:shadow-lg",
                  selectedEmail?.id === email.id 
                    ? "border-purple-primary bg-purple-primary/5 shadow-purple-primary/20" 
                    : "border-border hover:border-purple-primary/50 bg-card"
                )}
              >
                {/* Urgency indicator */}
                <div className={cn(
                  "absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse",
                  email.urgency === 'urgent' ? 'bg-red-500' : 
                  email.urgency === 'high' ? 'bg-orange-500' : 'bg-green-500'
                )} />

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-primary to-ai-purple flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{email.from}</h4>
                      <span className="text-xs text-muted-foreground">{email.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{email.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{email.preview}</p>
                    {selectedEmail?.id === email.id && (
                      <motion.div 
                        className="flex items-center gap-2 mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Tag className="w-3 h-3 text-purple-primary" />
                        <span className={cn("text-xs font-medium", getUrgencyColor(email.urgency))}>
                          {email.urgency}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* AI Response */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold gradient-text">AI Assistant</h3>
            {aiResponse && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Confidence</div>
                <div className="relative w-24 h-2 bg-border rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-primary to-ai-purple"
                    initial={{ width: 0 }}
                    animate={{ width: `${aiResponse.confidence}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="text-sm font-medium">{aiResponse?.confidence}%</span>
              </div>
            )}
          </div>

          {selectedEmail ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedEmail.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                {/* Context gathering animation */}
                {isProcessing && (
                  <motion.div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-purple-primary animate-pulse" />
                      <span className="text-sm font-medium">Analyzing context...</span>
                    </div>
                    <div className="space-y-2">
                      {['Checking knowledge base...', 'Analyzing sentiment...', 'Generating response...'].map((text, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.3 }}
                        >
                          <div className="w-1.5 h-1.5 bg-purple-primary rounded-full animate-pulse" />
                          <span className="text-xs text-muted-foreground">{text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* AI Response */}
                {!isProcessing && aiResponse && (
                  <motion.div className="space-y-4">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-primary/5 to-ai-purple/5 border-2 border-purple-primary/20">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-primary to-ai-purple flex items-center justify-center">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">AI Assistant</span>
                            <CheckCircle className="w-4 h-4 text-success-green" />
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{typedText}</p>
                        </div>
                      </div>

                      {/* Response time */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                        <Clock className="w-3 h-3" />
                        Generated in 0.8s
                      </div>
                    </div>

                    {/* Context and tags */}
                    {showContext && (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Search className="w-4 h-4 text-purple-primary" />
                            Context Used
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {aiResponse.context.map((ctx, i) => (
                              <motion.span
                                key={i}
                                className="text-xs px-3 py-1 rounded-full bg-purple-primary/10 text-purple-primary"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                {ctx}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Tag className="w-4 h-4 text-purple-primary" />
                            Suggested Tags
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {aiResponse.suggestedTags.map((tag, i) => (
                              <motion.span
                                key={i}
                                className="text-xs px-3 py-1 rounded-full bg-ai-purple/10 text-ai-purple"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                #{tag}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        <motion.button
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-primary to-purple-light text-white font-medium hover:from-purple-dark hover:to-purple-primary transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Send Response
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              <div className="text-center space-y-4">
                <Mail className="w-12 h-12 mx-auto opacity-50" />
                <p>Select an email to see AI in action</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}