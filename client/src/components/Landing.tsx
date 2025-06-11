import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { KeyRound, MessageCircle, Share2, Shield, Smartphone, Heart } from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text animate-fade-in">
          Connect Anonymously in 2025
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
          Share your thoughts, receive anonymous messages, and connect with a community that values privacy and authentic communication. Your identity, your choice.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/register">
            <Button size="lg" className="px-8 py-3 text-lg font-bold hover:scale-105 transition-all duration-200">
              <KeyRound className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg font-bold border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200">
              Sign In
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">
            Admin access: Use credentials Adegboyega / ibukun to access admin dashboard
          </p>
        </div>
        

      </section>
      
      {/* Features Showcase */}
      <section id="features" className="py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">Why Choose Edwards Anonymous?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="glass-card hover:scale-105 hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
            <CardContent className="p-8">
              <div className="text-primary text-4xl mb-4">
                <KeyRound className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-4">Complete Anonymity</h3>
              <p className="text-muted-foreground leading-relaxed">Your privacy is our priority. Share and receive messages without revealing your identity.</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover:scale-105 hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
            <CardContent className="p-8">
              <div className="text-primary text-4xl mb-4">
                <MessageCircle className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-4">Real-time Chat</h3>
              <p className="text-muted-foreground leading-relaxed">Join community discussions and connect with like-minded individuals instantly.</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover:scale-105 hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
            <CardContent className="p-8">
              <div className="text-primary text-4xl mb-4">
                <Share2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-4">Easy Sharing</h3>
              <p className="text-muted-foreground leading-relaxed">Generate and share your anonymous link across all your social platforms effortlessly.</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover:scale-105 hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
            <CardContent className="p-8">
              <div className="text-primary text-4xl mb-4">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-4">Secure Platform</h3>
              <p className="text-muted-foreground leading-relaxed">Built with modern security standards to keep your conversations safe and private.</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover:scale-105 hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
            <CardContent className="p-8">
              <div className="text-primary text-4xl mb-4">
                <Smartphone className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-4">Mobile Responsive</h3>
              <p className="text-muted-foreground leading-relaxed">Access your anonymous messages and chats seamlessly across all your devices.</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover:scale-105 hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
            <CardContent className="p-8">
              <div className="text-primary text-4xl mb-4">
                <Heart className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-4">Community Driven</h3>
              <p className="text-muted-foreground leading-relaxed">Be part of a supportive community that values authentic, judgment-free communication.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
