import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, Sparkles, ArrowLeft } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useToast } from "@/hooks/use-toast";

interface FirstLoveLetterProps {
  onBack: () => void;
  onLetterSent: () => void;
}

export const FirstLoveLetter = ({ onBack, onLetterSent }: FirstLoveLetterProps) => {
  const [letter, setLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const aiSuggestions = [
    "My love, from the moment we connected, my heart knew it had found its home...",
    "Every day with you feels like a beautiful beginning, and I can't wait to write our story together...",
    "You've brought color to my world in ways I never imagined possible..."
  ];

  const handleAISuggestion = (suggestion: string) => {
    setLetter(suggestion);
  };

  const handleSendLetter = async () => {
    if (!letter.trim()) {
      toast({
        title: "Letter is empty",
        description: "Please write something beautiful for your partner",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Love letter sent! 💕",
      description: "Your first love letter has been sealed and delivered",
    });
    
    setIsLoading(false);
    onLetterSent();
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-12">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gradient">First Love Letter</h1>
          <div className="w-10"></div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <Card className="glass-effect border-primary/20 mb-6">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 romantic-gradient rounded-full flex items-center justify-center animate-pulse-soft">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gradient">
                Your First Love Letter
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                This special moment will be preserved forever in your timeline
              </p>
            </CardHeader>
          </Card>

          {/* AI Suggestions */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Sparkles className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium">AI Inspiration</span>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="soft"
                  className="w-full text-left h-auto p-3 text-xs leading-relaxed"
                  onClick={() => handleAISuggestion(suggestion)}
                >
                  "{suggestion}"
                </Button>
              ))}
            </div>
          </div>

          {/* Letter Input */}
          <div className="mb-6">
            <Textarea
              placeholder="Write your heart out... ✨"
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              className="min-h-[200px] text-base leading-relaxed resize-none"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{letter.length} characters</span>
              <span>Take your time 💕</span>
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendLetter}
            disabled={isLoading || !letter.trim()}
            variant="romantic"
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sealing your love...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Love Letter
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Once sent, this letter will be timestamped and kept safe in your shared timeline
          </p>
        </div>
      </div>
    </MobileContainer>
  );
};