import { Helmet } from 'react-helmet-async';
import ChatWidget from '@/components/chat/ChatWidget';
import { Leaf, MessageCircle, Zap, Shield } from 'lucide-react';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Farm Vaidya - AI-Powered Agricultural Support</title>
        <meta
          name="description"
          content="Get instant agricultural support with Farm Vaidya's AI chatbot. Expert advice on farming, crop management, and agricultural solutions."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
            <div className="text-center max-w-3xl mx-auto">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary shadow-glow mb-8 animate-float">
                <Leaf className="w-10 h-10 text-primary-foreground" />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Agricultural Intelligence
                <span className="block text-gradient">at Your Fingertips</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Farm Vaidya brings you AI-powered agricultural support. Get instant answers
                about crop management, products, and sustainable farming practices.
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 shadow-sm">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-foreground">24/7 Support</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 shadow-sm">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-foreground">Instant Responses</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 shadow-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Expert Knowledge</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Leaf className="w-6 h-6" />}
              title="Product Information"
              description="Get detailed information about our agricultural products, their usage, and benefits."
            />
            <FeatureCard
              icon={<MessageCircle className="w-6 h-6" />}
              title="Smart Conversations"
              description="Our AI understands context and provides personalized recommendations."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Instant Answers"
              description="No waiting. Get immediate responses to your farming questions."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="bg-card rounded-3xl p-8 md:p-12 border border-border/50 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Click the chat bubble in the bottom-right corner to start a conversation
              with our AI assistant.
            </p>
            <div className="inline-flex items-center gap-2 text-primary font-medium">
              <span>Try the chat widget</span>
              <span className="animate-pulse">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Index;
