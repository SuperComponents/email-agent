import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Sun
} from "lucide-react";
import { useDarkMode } from "./hooks/useDarkMode";
import "./index.css";

const APP_URL = process.env.BUN_PUBLIC_APP_URL ?? "http://localhost:5173";

export function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-cream to-background dark:from-background dark:via-background dark:to-background overflow-hidden transition-all duration-500">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ai-blue/10 dark:bg-ai-blue/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-ai-purple/10 dark:bg-ai-purple/5 rounded-full blur-3xl animate-pulse delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mocha-light/5 dark:bg-mocha/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-mocha to-mocha-light rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-mocha-dark to-mocha bg-clip-text text-transparent">
              OpenSupport
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
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
              className="relative w-10 h-10 rounded-full hover:bg-mocha/10 dark:hover:bg-mocha/20 transition-all duration-300"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            
            <Button asChild variant="ghost" size="sm">
              <a href={`${APP_URL}/handler/sign-in`}>Sign In</a>
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-mocha to-mocha-light hover:from-mocha-dark hover:to-mocha text-white border-0"
            >
              <a href={`${APP_URL}/handler/sign-up`}>Get Started Free</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Typography Revolution */}
      <section className="relative z-10 px-6 pt-20 pb-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Viral-worthy badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ai-blue/10 dark:bg-ai-blue/20 rounded-full border border-ai-blue/20 dark:border-ai-blue/30">
              <Sparkles className="w-4 h-4 text-ai-blue dark:text-ai-blue animate-pulse" />
              <span className="text-sm font-medium text-ai-blue dark:text-ai-blue">Open-source AI-powered support</span>
            </div>

            {/* Bold Typography - Main Headline */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter">
              <span className="block bg-gradient-to-r from-mocha-dark via-mocha to-mocha-light dark:from-mocha-light dark:via-mocha dark:to-mocha-dark bg-clip-text text-transparent">
                Customer Support
              </span>
              <span className="block mt-2 text-4xl md:text-6xl lg:text-7xl text-muted-foreground font-light">
                That Actually Cares
              </span>
            </h1>

            {/* Value Proposition */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The open-source alternative to Intercom. AI agents handle 80% of queries instantly, 
              so your team can focus on what matters most—building relationships.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-mocha to-mocha-light hover:from-mocha-dark hover:to-mocha text-white border-0 text-lg px-8 py-6 rounded-full group"
                asChild
              >
                <a href={`${APP_URL}/handler/sign-up`}>
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full border-2"
                asChild
              >
                <a href={`${APP_URL}/handler/sign-in`}>
                  View Live Demo
                </a>
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-mocha dark:text-mocha-light">92%</div>
                <div className="text-sm text-muted-foreground mt-1">Query Resolution</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-ai-blue dark:text-ai-blue">3.2s</div>
                <div className="text-sm text-muted-foreground mt-1">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-ai-purple dark:text-ai-purple">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Teams</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-success-green dark:text-success-green">$0</div>
                <div className="text-sm text-muted-foreground mt-1">To Get Started</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Product Preview */}
      <section className="relative z-10 px-6 pb-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-ai-blue/20 via-ai-purple/20 to-mocha/20 dark:from-ai-blue/10 dark:via-ai-purple/10 dark:to-mocha/10 blur-3xl" />
            
            <Card className="relative overflow-hidden border-2 border-mocha/20 dark:border-mocha/30 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Fake browser window */}
                <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-background dark:bg-card rounded-md text-sm">
                      <Shield className="w-3 h-3 text-success-green dark:text-success-green" />
                      app.opensupport.ai
                    </div>
                  </div>
                </div>
                
                {/* Chat interface preview */}
                <div className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ai-blue to-ai-purple flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted dark:bg-muted/80 rounded-2xl rounded-tl-none p-4 max-w-md">
                        <p className="text-sm">Hi! I'm your AI support assistant. I've already analyzed your account and I see you're asking about billing. I can help you with that right away!</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Responded in 0.8s
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-4 max-w-md">
                      <p className="text-sm">How do I update my payment method?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-success-green/10 dark:bg-success-green/20 rounded-full">
                      <CheckCircle className="w-4 h-4 text-success-green dark:text-success-green" />
                      <span className="text-sm font-medium text-success-green dark:text-success-green">AI Agent is typing...</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 pb-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-mocha-dark to-mocha bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Built by developers, for developers. Open-source and extensible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-mocha/20 dark:hover:border-mocha/40">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ai-blue to-ai-purple flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">AI-First Approach</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced AI agents understand context, learn from interactions, and provide human-like responses in milliseconds.
                </p>
                <div className="flex items-center text-sm text-ai-blue font-medium">
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-mocha/20 dark:hover:border-mocha/40">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-mocha to-mocha-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">100% Open Source</h3>
                <p className="text-muted-foreground mb-4">
                  Full transparency, no vendor lock-in. Deploy on your infrastructure, customize everything, own your data.
                </p>
                <div className="flex items-center text-sm text-mocha font-medium">
                  View on GitHub <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-mocha/20 dark:hover:border-mocha/40">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ai-purple to-mocha flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground mb-4">
                  Sub-second response times with intelligent caching and edge deployment. Your customers won't wait.
                </p>
                <div className="flex items-center text-sm text-ai-purple font-medium">
                  See benchmarks <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-mocha/20 dark:hover:border-mocha/40">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success-green to-ai-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Rich Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Deep insights into customer behavior, agent performance, and conversation patterns. Make data-driven decisions.
                </p>
                <div className="flex items-center text-sm text-success-green font-medium">
                  Explore analytics <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-mocha/20 dark:hover:border-mocha/40">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-mocha-dark to-ai-purple flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Team Collaboration</h3>
                <p className="text-muted-foreground mb-4">
                  Seamless handoff between AI and human agents. Internal notes, collision detection, and smart routing.
                </p>
                <div className="flex items-center text-sm text-mocha-dark font-medium">
                  See workflow <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-mocha/20 dark:hover:border-mocha/40">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ai-blue to-success-green flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Enterprise Security</h3>
                <p className="text-muted-foreground mb-4">
                  SOC2 compliant, end-to-end encryption, SSO support, and audit logs. Your data stays yours.
                </p>
                <div className="flex items-center text-sm text-ai-blue font-medium">
                  Security details <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 pb-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-mocha-dark to-mocha bg-clip-text text-transparent">
                Pricing That Makes Sense
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
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
                  <a href={`${APP_URL}/handler/sign-up`}>Deploy Now</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-mocha/20 dark:border-mocha/40 shadow-xl scale-105">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-mocha to-mocha-light" />
              <div className="absolute -top-4 -right-4 px-4 py-1 bg-gradient-to-r from-mocha to-mocha-light text-white text-sm font-medium rounded-full">
                Popular
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Cloud Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$29</span>
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
                <Button className="w-full bg-gradient-to-r from-mocha to-mocha-light hover:from-mocha-dark hover:to-mocha text-white border-0" asChild>
                  <a href={`${APP_URL}/handler/sign-up`}>Start Free Trial</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-ai-purple to-mocha" />
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
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-mocha-dark to-mocha bg-clip-text text-transparent">
                Loved by Teams Worldwide
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join hundreds of companies delivering exceptional support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-mocha/20 dark:hover:border-mocha/40 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-500" />
                  ))}
                </div>
                <p className="text-lg mb-6">
                  "Switching to OpenSupport reduced our response time by 85%. Our customers love the instant, accurate responses."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ai-blue to-ai-purple" />
                  <div>
                    <div className="font-semibold">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">CTO at TechFlow</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-mocha/20 dark:hover:border-mocha/40 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-500" />
                  ))}
                </div>
                <p className="text-lg mb-6">
                  "The open-source nature means we can customize everything. It's like having a support team that speaks our language."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mocha to-mocha-light" />
                  <div>
                    <div className="font-semibold">Mike Rodriguez</div>
                    <div className="text-sm text-muted-foreground">Head of Support at Scale.io</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-mocha/20 dark:hover:border-mocha/40 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-500" />
                  ))}
                </div>
                <p className="text-lg mb-6">
                  "AI agents handle repetitive queries perfectly. Our team now focuses on complex issues that need human touch."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ai-purple to-mocha" />
                  <div>
                    <div className="font-semibold">Lisa Thompson</div>
                    <div className="text-sm text-muted-foreground">CEO at CloudBase</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 pb-32 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-mocha via-mocha-light to-ai-purple dark:from-mocha-dark dark:via-mocha dark:to-ai-purple p-1">
            <div className="bg-background dark:bg-card rounded-[calc(var(--radius)-1px)]">
              <CardContent className="p-12 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Ready to Transform Your Support?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join the open-source revolution. Deploy in minutes, customize everything, own your data.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-mocha to-mocha-light hover:from-mocha-dark hover:to-mocha text-white border-0 text-lg px-8 py-6 rounded-full"
                    asChild
                  >
                    <a href={`${APP_URL}/handler/sign-up`}>Deploy Open Source Version</a>
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 rounded-full"
                    asChild
                  >
                    <a href={`${APP_URL}/handler/sign-up`}>Start Cloud Trial</a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  No credit card required • Deploy in 5 minutes • Cancel anytime
                </p>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-card/50 dark:bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-mocha to-mocha-light rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">OpenSupport</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The open-source AI-powered customer support platform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>© 2025 OpenSupport. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;