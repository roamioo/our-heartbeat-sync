import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, Calendar, Gift, Plus, Settings, User } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { UserData } from "@/components/onboarding/SignupForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  userData: UserData;
}

export const Dashboard = ({ userData }: DashboardProps) => {
  const [currentMood, setCurrentMood] = useState<string>("😊");
  
  const quickActions = [
    { icon: MessageCircle, label: "Send Message", variant: "romantic" as const },
    { icon: Heart, label: "Share Mood", variant: "soft" as const },
    { icon: Gift, label: "Send Gift", variant: "outline" as const },
    { icon: Calendar, label: "Plan Date", variant: "ghost" as const },
  ];

  const recentMemories = [
    { date: "Today", title: "Good morning message", type: "message" },
    { date: "Yesterday", title: "Shared location at café", type: "location" },
    { date: "2 days ago", title: "First love letter sent", type: "letter" },
  ];

  return (
    <MobileContainer>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-12">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-rose-light to-purple-light text-white font-semibold">
                {userData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">Hi, {userData.name.split(' ')[0]}!</h1>
              <p className="text-sm text-muted-foreground">Ready to connect?</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Partner Status */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Waiting for partner</span>
                </div>
                <Button variant="soft" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Mood */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary" />
                Your Mood Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  {["😊", "😍", "🥰", "😔", "😴"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setCurrentMood(emoji)}
                      className={`text-2xl p-2 rounded-full transition-smooth ${
                        currentMood === emoji 
                          ? "bg-primary/20 scale-110" 
                          : "hover:bg-muted hover:scale-105"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <Button variant="romantic" size="sm">
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="px-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-20 flex-col space-y-1"
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Memories */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Memories</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          <div className="space-y-3">
            {recentMemories.map((memory, index) => (
              <Card key={index} className="glass-effect border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{memory.title}</p>
                      <p className="text-xs text-muted-foreground">{memory.date}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {memory.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md">
          <div className="glass-effect border-t border-white/20 p-4">
            <div className="flex justify-around">
              {[
                { icon: Heart, label: "Home", active: true },
                { icon: MessageCircle, label: "Chat" },
                { icon: Calendar, label: "Timeline" },
                { icon: User, label: "Profile" },
              ].map((item, index) => (
                <button
                  key={index}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-smooth ${
                    item.active 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
};