import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Users,
  Zap,
  BarChart3,
  Globe,
  CheckCircle,
  Star,
  Github,
  Twitter,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  Moon,
  Sun,
} from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';
import { useScrollPerformance } from './hooks/useScrollPerformance';
import { InteractiveDemo } from './components/InteractiveDemo';
import { ParticleBackground } from './components/ParticleBackground';
import {
  ScrollAnimation,
  Parallax,
  TextReveal,
  CountUp,
} from './components/ScrollAnimations';
import { MetricsDashboard } from './components/MetricsDashboard';
import { CursorEffect } from './components/CursorEffect';
import { FloatingChat } from './components/FloatingChat';
import './index.css';

const APP_URL = process.env.BUN_PUBLIC_APP_URL ?? 'http://localhost:5173';

export function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  useScrollPerformance();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-accent/30 to-background dark:from-background dark:via-purple-accent/10 dark:to-background overflow-hidden transition-all duration-500">
      {/* Custom Cursor Effect */}
      <CursorEffect />

      {/* Floating Chat Widget */}
      <FloatingChat />

      {/* Particle Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ParticleBackground />
      </div>
      {/* Premium animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-primary/20 to-ai-purple/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-ai-blue/20 to-purple-light/20 rounded-full blur-3xl animate-glow delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-primary/10 via-ai-purple/10 to-purple-light/10 rounded-full blur-3xl animate-aurora" />

        {/* Additional floating orbs for depth */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-light/15 to-transparent rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tl from-ai-purple/15 to-transparent rounded-full blur-2xl animate-float delay-700" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-primary to-purple-light rounded-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">
              OpenSupport
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
            <a
              href="https://github.com"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="relative w-10 h-10 rounded-full hover:bg-purple-primary/10 dark:hover:bg-purple-primary/20 transition-all duration-300"
              aria-label={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hover:text-purple-primary transition-colors underline-hover"
            >
              <a href={`${APP_URL}/login`}>Sign In</a>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-primary to-purple-light hover:from-purple-dark hover:to-purple-primary text-white border-0 shadow-lg hover:shadow-purple-primary/25 transition-all duration-300 hover:scale-105 button-ripple glow-hover"
              asChild
            >
              <a href={`${APP_URL}/signup`}>Get Started Free</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Typography Revolution */}
      <section className="relative z-10 px-6 pt-20 pb-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Viral-worthy badge with enhanced animation */}
            <div className="inline-flex items-center gap-2 px-4 py-2 gradient-border glass sparkle-container animate-slide-up">
              <Sparkles className="w-4 h-4 text-purple-primary animate-sparkle" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-primary to-ai-purple bg-clip-text text-transparent">
                Open-source AI-powered support
              </span>
            </div>

            {/* Bold Typography - Main Headline with stunning effects */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter animate-slide-up delay-300">
              <span className="block">
                {/* SEO-friendly screen reader content */}
                <span className="sr-only">Customer Support</span>
                {/* No-JS fallback */}
                <noscript>
                  <span className="animate-gradient bg-gradient-to-r from-purple-dark via-purple-primary to-ai-purple bg-clip-text text-transparent">
                    Customer Support
                  </span>
                </noscript>
                <TextReveal
                  text="Customer Support"
                  className="bg-gradient-to-r from-purple-dark via-purple-primary to-ai-purple bg-clip-text text-transparent"
                  aria-hidden="true"
                />
              </span>
              <span className="block mt-2 text-4xl md:text-6xl lg:text-7xl text-muted-foreground font-light">
                That Actually{' '}
                <span className="text-purple-primary font-bold neon-glow">
                  Cares
                </span>
              </span>
            </h1>

            {/* Value Proposition */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The open-source alternative to Intercom. AI agents handle 80% of
              queries instantly, so your team can focus on what matters
              most—building relationships.
            </p>

            {/* CTA Buttons with premium effects */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-slide-up delay-700">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-primary to-purple-light hover:from-purple-dark hover:to-purple-primary text-white border-0 text-lg px-8 py-6 rounded-full group shadow-2xl hover:shadow-purple-primary/40 transition-all duration-300 hover:scale-105 hover-lift button-ripple button-3d"
                asChild
              >
                <a href={`${APP_URL}/signup`}>
                  <span className="relative">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full border-2 border-purple-primary/30 hover:border-purple-primary hover:bg-purple-primary/5 transition-all duration-300 group magnetic-hover"
                asChild
              >
                <a href={`${APP_URL}/login`}>
                  <span className="bg-gradient-to-r from-purple-primary to-ai-purple bg-clip-text text-transparent group-hover:from-purple-dark group-hover:to-purple-primary text-gradient-hover">
                    View Live Demo
                  </span>
                </a>
              </Button>
            </div>

            {/* Social Proof Stats with animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto animate-slide-up delay-1000">
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold gradient-text animate-shimmer">
                  <CountUp end={92} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                  Query Resolution
                </div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-ai-blue">
                  <CountUp end={3.2} suffix="s" duration={1.5} />
                </div>
                <div className="text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                  Avg Response Time
                </div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-ai-purple">
                  <CountUp end={500} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                  Active Teams
                </div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-success-green">$0</div>
                <div className="text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                  To Get Started
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stunning Visual Divider Section */}
      <section className="relative z-10 px-6 py-32 lg:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-primary/20 via-transparent to-ai-purple/20 animate-gradient" />
            <div
              className="absolute inset-0 animate-float"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          <div className="relative text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-primary to-ai-purple mb-8 animate-float shadow-2xl">
              <Sparkles className="w-10 h-10 text-white animate-sparkle" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black">
              <span className="block mb-2 text-foreground">
                Why teams are switching to
              </span>
              <span className="block animate-gradient bg-gradient-to-r from-purple-dark via-purple-primary to-ai-purple bg-clip-text text-transparent text-5xl md:text-6xl lg:text-7xl">
                OpenSupport
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8 pt-12 max-w-5xl mx-auto">
              <div className="group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-primary to-ai-purple rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-glow" />
                  <div className="relative glass rounded-2xl p-8 hover-lift">
                    <TrendingUp className="w-8 h-8 text-purple-primary mb-4 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">
                      10x Faster Resolution
                    </h3>
                    <p className="text-muted-foreground">
                      AI handles 80% of queries instantly, freeing your team for
                      complex issues
                    </p>
                  </div>
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-ai-purple to-purple-light rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-glow delay-300" />
                  <div className="relative glass rounded-2xl p-8 hover-lift">
                    <Shield className="w-8 h-8 text-ai-purple mb-4 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">
                      Your Data, Your Control
                    </h3>
                    <p className="text-muted-foreground">
                      Self-host on your infrastructure with complete data
                      sovereignty
                    </p>
                  </div>
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-light to-purple-primary rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-glow delay-700" />
                  <div className="relative glass rounded-2xl p-8 hover-lift">
                    <Zap className="w-8 h-8 text-purple-light mb-4 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">
                      Zero Learning Curve
                    </h3>
                    <p className="text-muted-foreground">
                      Intuitive interface your team will love from day one
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Product Preview */}
      <section className="relative z-10 px-6 pb-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation animation="fadeUp">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="animate-gradient bg-gradient-to-r from-purple-dark via-purple-primary to-ai-purple bg-clip-text text-transparent">
                  See OpenSupport in Action
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Click on any email to watch our AI instantly analyze and respond
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="scaleIn" delay={0.2}>
            <InteractiveDemo />
          </ScrollAnimation>
        </div>
      </section>

      {/* Real-time Metrics Dashboard */}
      <section className="relative z-10 px-6 pb-32 lg:px-12">
        <ScrollAnimation animation="fadeUp">
          <MetricsDashboard />
        </ScrollAnimation>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 pb-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 animate-slide-up">
              <span className="animate-gradient bg-gradient-to-r from-purple-dark via-purple-primary to-ai-purple bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-muted-foreground animate-slide-up delay-300">
              Built by developers, for developers. Open-source and extensible.
            </p>
          </div>

          <ScrollAnimation animation="fadeUp" stagger={0.1}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group hover-lift premium-card border-2 border-purple-primary/10 hover:border-purple-primary/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ai-blue to-ai-purple flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">AI-First Approach</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced AI agents understand context, learn from
                    interactions, and provide human-like responses in
                    milliseconds.
                  </p>
                  <div className="flex items-center text-sm font-medium gradient-text group-hover:translate-x-2 transition-transform">
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover-lift premium-card border-2 border-purple-primary/10 hover:border-purple-primary/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-primary to-purple-light flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">100% Open Source</h3>
                  <p className="text-muted-foreground mb-4">
                    Full transparency, no vendor lock-in. Deploy on your
                    infrastructure, customize everything, own your data.
                  </p>
                  <div className="flex items-center text-sm font-medium gradient-text group-hover:translate-x-2 transition-transform">
                    View on GitHub <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover-lift premium-card border-2 border-purple-primary/10 hover:border-purple-primary/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ai-purple to-purple-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
                  <p className="text-muted-foreground mb-4">
                    Sub-second response times with intelligent caching and edge
                    deployment. Your customers won't wait.
                  </p>
                  <div className="flex items-center text-sm font-medium gradient-text group-hover:translate-x-2 transition-transform">
                    See benchmarks <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover-lift premium-card border-2 border-purple-primary/10 hover:border-purple-primary/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success-green to-ai-blue flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Rich Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Deep insights into customer behavior, agent performance, and
                    conversation patterns. Make data-driven decisions.
                  </p>
                  <div className="flex items-center text-sm font-medium gradient-text group-hover:translate-x-2 transition-transform">
                    Explore analytics <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover-lift premium-card border-2 border-purple-primary/10 hover:border-purple-primary/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-dark to-ai-purple flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Team Collaboration
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Seamless handoff between AI and human agents. Internal
                    notes, collision detection, and smart routing.
                  </p>
                  <div className="flex items-center text-sm font-medium gradient-text group-hover:translate-x-2 transition-transform">
                    See workflow <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover-lift premium-card border-2 border-purple-primary/10 hover:border-purple-primary/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ai-blue to-success-green flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Enterprise Security
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    SOC2 compliant, end-to-end encryption, SSO support, and
                    audit logs. Your data stays yours.
                  </p>
                  <div className="flex items-center text-sm font-medium gradient-text group-hover:translate-x-2 transition-transform">
                    Security details <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 pb-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 animate-slide-up">
              <span className="animate-gradient bg-gradient-to-r from-purple-dark via-purple-primary to-ai-purple bg-clip-text text-transparent">
                Pricing That Makes Sense
              </span>
            </h2>
            <p className="text-xl text-muted-foreground animate-slide-up delay-300">
              Start free, scale as you grow. No surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-ai-blue to-ai-purple" />
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Open Source</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Unlimited agents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Self-hosted deployment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Community support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">All core features</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`${APP_URL}/signup`}>Deploy Now</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden gradient-border premium-card shadow-2xl scale-105 animate-slide-up delay-300">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-primary to-purple-light animate-gradient" />
              <div className="absolute -top-4 -right-4 px-4 py-1 bg-gradient-to-r from-purple-primary to-purple-light text-white text-sm font-medium rounded-full sparkle-container shadow-lg">
                Popular
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Cloud Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold gradient-text">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Everything in Open Source</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Managed hosting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">99.9% uptime SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Advanced analytics</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-purple-primary to-purple-light hover:from-purple-dark hover:to-purple-primary text-white border-0 shadow-lg hover:shadow-purple-primary/40 transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <a href={`${APP_URL}/signup`}>Start Free Trial</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-ai-purple to-purple-primary" />
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Everything in Cloud Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Dedicated infrastructure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">Custom AI training</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">White-label options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="text-sm">24/7 phone support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 px-6 pb-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 animate-slide-up">
              <span className="animate-gradient bg-gradient-to-r from-purple-dark via-purple-primary to-ai-purple bg-clip-text text-transparent">
                Loved by Teams Worldwide
              </span>
            </h2>
            <p className="text-xl text-muted-foreground animate-slide-up delay-300">
              Join hundreds of companies delivering exceptional support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-purple-primary/10 hover:border-purple-primary/30 transition-all duration-300 hover-lift animate-slide-up">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-current text-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-lg mb-6">
                  "Switching to OpenSupport reduced our response time by 85%.
                  Our customers love the instant, accurate responses."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ai-blue to-ai-purple" />
                  <div>
                    <div className="font-semibold">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">
                      CTO at TechFlow
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-primary/10 hover:border-purple-primary/30 transition-all duration-300 hover-lift animate-slide-up delay-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-current text-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-lg mb-6">
                  "The open-source nature means we can customize everything.
                  It's like having a support team that speaks our language."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-primary to-purple-light" />
                  <div>
                    <div className="font-semibold">Mike Rodriguez</div>
                    <div className="text-sm text-muted-foreground">
                      Head of Support at Scale.io
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-primary/10 hover:border-purple-primary/30 transition-all duration-300 hover-lift animate-slide-up delay-700">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-current text-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-lg mb-6">
                  "AI agents handle repetitive queries perfectly. Our team now
                  focuses on complex issues that need human touch."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ai-purple to-purple-primary" />
                  <div>
                    <div className="font-semibold">Lisa Thompson</div>
                    <div className="text-sm text-muted-foreground">
                      CEO at CloudBase
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA - Stunning Section */}
      <section className="relative z-10 px-6 pb-32 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-primary/30 via-ai-purple/30 to-purple-light/30 blur-3xl animate-glow" />

            <Card className="relative overflow-hidden gradient-border premium-card">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/10 via-transparent to-ai-purple/10" />
              <CardContent className="relative p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-primary to-ai-purple mb-8 animate-float shadow-2xl sparkle-container">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="animate-gradient bg-gradient-to-r from-purple-dark via-purple-primary to-ai-purple bg-clip-text text-transparent">
                    Ready to Transform Your Support?
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join the open-source revolution. Deploy in minutes, customize
                  everything, own your data.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-primary to-purple-light hover:from-purple-dark hover:to-purple-primary text-white border-0 text-lg px-8 py-6 rounded-full shadow-2xl hover:shadow-purple-primary/40 transition-all duration-300 hover:scale-105 hover-lift"
                    asChild
                  >
                    <a href={`${APP_URL}/signup`}>Deploy Open Source Version</a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 rounded-full border-2 border-purple-primary/30 hover:border-purple-primary hover:bg-purple-primary/5 transition-all duration-300 group"
                    asChild
                  >
                    <a href={`${APP_URL}/signup`}>
                      <span className="bg-gradient-to-r from-purple-primary to-ai-purple bg-clip-text text-transparent group-hover:from-purple-dark group-hover:to-purple-primary">
                        Start Cloud Trial
                      </span>
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  No credit card required • Deploy in 5 minutes • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-card/50 dark:bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-primary to-purple-light rounded-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">
                  OpenSupport
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                The open-source AI-powered customer support platform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>© 2025 OpenSupport. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
