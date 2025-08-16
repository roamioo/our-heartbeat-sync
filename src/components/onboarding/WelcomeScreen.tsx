import { Button } from "@/components/ui/button";
import { Heart, Users, Gift, Calendar } from "lucide-react";
import heroCouple from "@/assets/hero-couple.jpg";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  const features = [
    {
      icon: Heart,
      title: "Share Love",
      description: "Send letters, moods, and moments"
    },
    {
      icon: Users,
      title: "Stay Connected",
      description: "Track your relationship journey together"
    },
    {
      icon: Gift,
      title: "Surprise Each Other",
      description: "Integrated gifting and wishlist features"
    },
    {
      icon: Calendar,
      title: "Remember Everything",
      description: "Never miss an anniversary or special moment"
    }
  ];

  return (
    <MobileContainer>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* Hero Image */}
        <div className="relative mb-8 animate-float">
          <img 
            src={heroCouple} 
            alt="Romantic couple silhouette" 
            className="w-80 h-48 object-cover rounded-3xl shadow-romantic"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4 text-gradient">
          LoveSync
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-sm">
          The ultimate relationship companion for couples who want to grow closer together
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-effect p-4 rounded-xl transition-smooth hover:scale-105"
            >
              <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onGetStarted}
          variant="hero"
          className="w-full max-w-xs animate-pulse-soft"
        >
          Start Your Journey
          <Heart className="w-5 h-5 ml-2 animate-heart-beat" />
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Join thousands of couples already using LoveSync
        </p>
      </div>
    </MobileContainer>
  );
};