import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Heart, 
  Bell, 
  Shield, 
  Settings, 
  LogOut, 
  Edit3, 
  MapPin, 
  Calendar,
  Gift,
  MessageCircle,
  ArrowLeft,
  Camera
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { UserData } from "@/components/onboarding/SignupForm";

interface ProfileProps {
  userData: UserData;
  onBack: () => void;
  onEditProfile: () => void;
}

export const Profile = ({ userData, onBack, onEditProfile }: ProfileProps) => {
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [periodReminders, setPeriodReminders] = useState(true);

  const stats = [
    { label: "Days Together", value: "7", icon: Calendar },
    { label: "Messages Sent", value: "142", icon: MessageCircle },
    { label: "Gifts Given", value: "3", icon: Gift },
    { label: "Memories", value: "8", icon: Heart }
  ];

  const relationshipHistory = [
    { count: 2, status: "Previous relationships on app" },
    { count: 0, status: "Reports received" },
    { count: 1, status: "Current relationship" }
  ];

  const settings = [
    {
      title: "Notifications",
      description: "Get updates about your partner",
      value: notifications,
      onChange: setNotifications,
      icon: Bell
    },
    {
      title: "Location Sharing",
      description: "Share your location for safety",
      value: locationSharing,
      onChange: setLocationSharing,
      icon: MapPin
    },
    {
      title: "Period Reminders",
      description: "Notify partner about your cycle",
      value: periodReminders,
      onChange: setPeriodReminders,
      icon: Calendar
    }
  ];

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-12">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gradient">Profile</h1>
          <Button variant="ghost" size="icon" onClick={onEditProfile}>
            <Edit3 className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile Header */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-4 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-rose-light to-purple-light text-white text-2xl font-bold">
                      {userData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="romantic"
                    size="icon"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  <p className="text-muted-foreground">@{userData.username}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-muted-foreground">
                      In relationship
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Relationship Stats */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary" />
                Relationship Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-muted/30 rounded-lg">
                    <stat.icon className="w-5 h-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transparency Section */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Transparency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relationshipHistory.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{item.status}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary" />
                Privacy & Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <setting.icon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{setting.title}</p>
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={setting.value}
                      onCheckedChange={setting.onChange}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <div className="px-6 mb-20">
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              Account Settings
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
            
            <Button variant="outline" className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              End Relationship
            </Button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
};