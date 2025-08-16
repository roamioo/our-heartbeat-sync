import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Gift, MapPin, Calendar, Camera, ArrowLeft, Filter } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface TimelineEvent {
  id: string;
  type: "letter" | "message" | "gift" | "location" | "mood" | "milestone" | "photo";
  title: string;
  description: string;
  date: Date;
  emoji?: string;
  location?: string;
  special?: boolean;
}

interface TimelineProps {
  onBack: () => void;
}

export const Timeline = ({ onBack }: TimelineProps) => {
  const [filter, setFilter] = useState<string>("all");
  
  const events: TimelineEvent[] = [
    {
      id: "1",
      type: "milestone",
      title: "Relationship Started",
      description: "Our beautiful journey began",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      special: true
    },
    {
      id: "2",
      type: "letter",
      title: "First Love Letter",
      description: "\"My love, from the moment we connected...\"",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      special: true
    },
    {
      id: "3",
      type: "location",
      title: "Coffee Date",
      description: "First check-in together",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      location: "Moonbean Coffee"
    },
    {
      id: "4",
      type: "mood",
      title: "Happy Vibes",
      description: "Both feeling amazing today",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      emoji: "😍"
    },
    {
      id: "5",
      type: "gift",
      title: "Surprise Flowers",
      description: "Beautiful roses delivered",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: "6",
      type: "photo",
      title: "Shared Memory",
      description: "Beautiful sunset together",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: "7",
      type: "message",
      title: "Good Morning Love",
      description: "Sweet messages to start the day",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: "8",
      type: "mood",
      title: "Current Mood",
      description: "Feeling blessed and loved",
      date: new Date(),
      emoji: "🥰"
    }
  ];

  const filteredEvents = filter === "all" 
    ? events 
    : events.filter(event => event.type === filter);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "letter": return MessageCircle;
      case "message": return MessageCircle;
      case "gift": return Gift;
      case "location": return MapPin;
      case "mood": return Heart;
      case "milestone": return Calendar;
      case "photo": return Camera;
      default: return Heart;
    }
  };

  const getEventColor = (type: string, special?: boolean) => {
    if (special) return "romantic";
    switch (type) {
      case "letter": return "bg-purple-light/20 text-purple";
      case "gift": return "bg-gold/20 text-yellow-700";
      case "location": return "bg-blue-100 text-blue-700";
      case "mood": return "bg-rose-light/20 text-rose";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filterOptions = [
    { value: "all", label: "All", icon: Heart },
    { value: "letter", label: "Letters", icon: MessageCircle },
    { value: "gift", label: "Gifts", icon: Gift },
    { value: "location", label: "Places", icon: MapPin },
    { value: "mood", label: "Moods", icon: Heart }
  ];

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-12">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gradient">Our Timeline</h1>
          <Button variant="ghost" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {filterOptions.map(option => (
              <Button
                key={option.value}
                variant={filter === option.value ? "romantic" : "soft"}
                size="sm"
                onClick={() => setFilter(option.value)}
                className="flex-shrink-0"
              >
                <option.icon className="w-3 h-3 mr-1" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 px-6 pb-20">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-purple to-rose-light"></div>
            
            <div className="space-y-6">
              {filteredEvents.map((event, index) => {
                const IconComponent = getEventIcon(event.type);
                
                return (
                  <div key={event.id} className="relative flex items-start space-x-4">
                    {/* Timeline Dot */}
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                      event.special 
                        ? "romantic-gradient text-white shadow-romantic" 
                        : "glass-effect border-2 border-primary/20"
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Event Card */}
                    <Card className={`flex-1 glass-effect border-white/20 ${
                      event.special ? "ring-2 ring-primary/20" : ""
                    }`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold">
                            {event.title}
                            {event.emoji && <span className="ml-2">{event.emoji}</span>}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(event.date)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                        {event.location && (
                          <div className="flex items-center space-x-1 text-xs text-primary">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Add Memory Button */}
        <div className="fixed bottom-20 right-6">
          <Button variant="romantic" size="icon" className="w-14 h-14 rounded-full shadow-romantic">
            <Calendar className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
};