import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, Calendar, Gift, Plus, Settings, User, ShoppingBag, Activity, Map } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { UserData } from "@/components/onboarding/SignupForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FirstLoveLetter } from "@/components/features/FirstLoveLetter";
import { Chat } from "@/components/features/Chat";
import { Timeline } from "@/components/features/Timeline";
import { PeriodTracker } from "@/components/features/PeriodTracker";
import { GiftStore } from "@/components/features/GiftStore";
import { Profile } from "@/components/features/Profile";

type DashboardView = "home" | "loveLetter" | "chat" | "timeline" | "periodTracker" | "giftStore" | "profile";

interface DashboardProps {
  userData: UserData;
}

export const Dashboard = ({ userData }: DashboardProps) => {
  const [currentView, setCurrentView] = useState<DashboardView>("home");
  const [currentMood, setCurrentMood] = useState<string>("😊");
  
  const quickActions = [
    { icon: MessageCircle, label: "Send Message", variant: "romantic" as const, action: () => setCurrentView("chat") },
    { icon: Heart, label: "Share Mood", variant: "soft" as const, action: () => {} },
    { icon: Gift, label: "Send Gift", variant: "outline" as const, action: () => setCurrentView("giftStore") },
    { icon: Calendar, label: "Plan Date", variant: "ghost" as const, action: () => setCurrentView("timeline") },
  ];

  const recentMemories = [
    { date: "Today", title: "Good morning message", type: "message" },
    { date: "Yesterday", title: "Shared location at café", type: "location" },
    { date: "2 days ago", title: "First love letter sent", type: "letter" },
  ];

  // Navigation handlers
  const handleBackToHome = () => setCurrentView("home");

  // Render different views
  if (currentView === "loveLetter") {
    return (
      <FirstLoveLetter 
        onBack={handleBackToHome} 
        onLetterSent={handleBackToHome}
      />
    );
  }

  if (currentView === "chat") {
    return <Chat onBack={handleBackToHome} />;
  }

  if (currentView === "timeline") {
    return <Timeline onBack={handleBackToHome} />;
  }

  if (currentView === "periodTracker") {
    return <PeriodTracker onBack={handleBackToHome} />;
  }

  if (currentView === "giftStore") {
    return <GiftStore onBack={handleBackToHome} />;
  }

  if (currentView === "profile") {
    return (
      <Profile 
        userData={userData} 
        onBack={handleBackToHome}
        onEditProfile={() => {}}
      />
    );
  }

  // Home dashboard view
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
          <Button variant="ghost" size="icon" onClick={() => setCurrentView("profile")}>
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
              <div className="mt-3 pt-3 border-t border-white/10">
                <Button 
                  variant="romantic" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setCurrentView("loveLetter")}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Write First Love Letter
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
                onClick={action.action}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Additional Quick Actions */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant="soft" 
              className="h-16 flex-col space-y-1"
              onClick={() => setCurrentView("periodTracker")}
            >
              <Activity className="w-5 h-5" />
              <span className="text-xs">Health</span>
            </Button>
            <Button variant="soft" className="h-16 flex-col space-y-1">
              <Map className="w-5 h-5" />
              <span className="text-xs">Location</span>
            </Button>
            <Button 
              variant="soft" 
              className="h-16 flex-col space-y-1"
              onClick={() => setCurrentView("timeline")}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Timeline</span>
            </Button>
          </div>
        </div>

        {/* Recent Memories */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Memories</h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("timeline")}>
              View All
            </Button>
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
                { icon: Heart, label: "Home", active: true, action: () => setCurrentView("home") },
                { icon: MessageCircle, label: "Chat", action: () => setCurrentView("chat") },
                { icon: Calendar, label: "Timeline", action: () => setCurrentView("timeline") },
                { icon: User, label: "Profile", action: () => setCurrentView("profile") },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
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