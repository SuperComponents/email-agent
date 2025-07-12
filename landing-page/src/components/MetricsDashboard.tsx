import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Clock, 
  Zap,
  BarChart3,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: number;
  change: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  color: string;
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: 'Active Tickets',
      value: 47,
      change: -23,
      icon: MessageSquare,
      color: 'from-purple-primary to-purple-light'
    },
    {
      label: 'Avg Response Time',
      value: 3.2,
      change: -47,
      suffix: 's',
      icon: Clock,
      color: 'from-ai-blue to-ai-purple'
    },
    {
      label: 'Resolution Rate',
      value: 92,
      change: 12,
      suffix: '%',
      icon: Zap,
      color: 'from-success-green to-ai-blue'
    },
    {
      label: 'Customer Satisfaction',
      value: 4.8,
      change: 5,
      suffix: '/5',
      icon: Users,
      color: 'from-ai-purple to-purple-primary'
    }
  ]);

  const [liveUpdates, setLiveUpdates] = useState<string[]>([]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * (metric.suffix === '%' ? 2 : 0.2),
        change: metric.change + (Math.random() - 0.5) * 5
      })));

      // Add live update
      const updates = [
        'Ticket #1234 resolved in 2.1s',
        'New customer inquiry received',
        'AI confidence: 98% on billing question',
        'Escalation avoided - AI handled complex query',
        '5 tickets auto-tagged and routed'
      ];
      
      setLiveUpdates(prev => [updates[Math.floor(Math.random() * updates.length)], ...prev.slice(0, 4)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-primary/10 to-ai-purple/10 mb-4"
        >
          <Activity className="w-4 h-4 text-purple-primary animate-pulse" />
          <span className="text-sm font-medium gradient-text">Real-time Performance</span>
        </motion.div>
        <h3 className="text-3xl font-bold mb-2">Watch AI Transform Your Support</h3>
        <p className="text-muted-foreground">Live metrics from teams using OpenSupport</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10",
              metric.color
            )} />
            <div className="relative bg-card border-2 border-border hover:border-purple-primary/30 rounded-2xl p-6 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", metric.color)}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <motion.div 
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    metric.change > 0 ? "text-success-green" : "text-red-500"
                  )}
                  animate={{ 
                    y: [0, -2, 0],
                    transition: { duration: 2, repeat: Infinity }
                  }}
                >
                  {metric.change > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(metric.change).toFixed(0)}%
                </motion.div>
              </div>
              
              <div className="space-y-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={metric.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-3xl font-bold"
                  >
                    {metric.prefix}{metric.value.toFixed(metric.suffix === 's' ? 1 : 0)}{metric.suffix}
                  </motion.div>
                </AnimatePresence>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>

              {/* Animated background chart */}
              <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden rounded-b-2xl opacity-10">
                <svg className="w-full h-full">
                  <motion.path
                    d={`M 0 32 Q 20 ${20 + Math.random() * 20} 40 32 T 80 32 T 120 32 T 160 32 T 200 32 T 240 32`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    animate={{
                      d: [
                        `M 0 32 Q 20 20 40 32 T 80 32 T 120 32 T 160 32 T 200 32 T 240 32`,
                        `M 0 32 Q 20 40 40 32 T 80 32 T 120 32 T 160 32 T 200 32 T 240 32`,
                        `M 0 32 Q 20 20 40 32 T 80 32 T 120 32 T 160 32 T 200 32 T 240 32`
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Live Activity</h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success-green rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
        
        <div className="bg-card border-2 border-border rounded-xl p-4 space-y-2 max-h-48 overflow-hidden">
          <AnimatePresence>
            {liveUpdates.map((update, index) => (
              <motion.div
                key={`${update}-${index}`}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 py-2"
              >
                <div className="w-2 h-2 bg-purple-primary rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">{update}</span>
                <span className="text-xs text-muted-foreground/50 ml-auto">just now</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Comparison Chart */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-primary/5 to-ai-purple/5 border-2 border-purple-primary/20 rounded-2xl p-6"
          >
            <h5 className="font-semibold mb-4">Before OpenSupport</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="text-sm font-medium">45 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Resolution Rate</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Efficiency</span>
                <span className="text-sm font-medium">Low</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-success-green/5 to-ai-blue/5 border-2 border-success-green/20 rounded-2xl p-6"
          >
            <h5 className="font-semibold mb-4">With OpenSupport</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="text-sm font-medium text-success-green">3.2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Resolution Rate</span>
                <span className="text-sm font-medium text-success-green">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Efficiency</span>
                <span className="text-sm font-medium text-success-green">10x</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}