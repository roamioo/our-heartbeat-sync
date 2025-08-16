import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, ArrowLeft, Heart, Droplets, Moon, Sun, AlertCircle } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PeriodTrackerProps {
  onBack: () => void;
  partnerName?: string;
}

export const PeriodTracker = ({ onBack, partnerName = "Partner" }: PeriodTrackerProps) => {
  const [currentDay, setCurrentDay] = useState(15);
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriod, setLastPeriod] = useState(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000));

  const getDaysSinceLastPeriod = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastPeriod.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilNext = cycleLength - getDaysSinceLastPeriod();
  const progressPercentage = (getDaysSinceLastPeriod() / cycleLength) * 100;

  const getCurrentPhase = () => {
    const dayInCycle = getDaysSinceLastPeriod();
    
    if (dayInCycle <= 5) {
      return { phase: "Menstrual", color: "text-red-500", bg: "bg-red-50", icon: Droplets };
    } else if (dayInCycle <= 13) {
      return { phase: "Follicular", color: "text-green-500", bg: "bg-green-50", icon: Sun };
    } else if (dayInCycle <= 16) {
      return { phase: "Ovulation", color: "text-yellow-500", bg: "bg-yellow-50", icon: Sun };
    } else {
      return { phase: "Luteal", color: "text-purple-500", bg: "bg-purple-50", icon: Moon };
    }
  };

  const currentPhase = getCurrentPhase();
  const PhaseIcon = currentPhase.icon;

  const symptoms = [
    { name: "Mood", level: 3, color: "bg-rose" },
    { name: "Energy", level: 4, color: "bg-green-400" },
    { name: "Cramps", level: 1, color: "bg-red-400" },
    { name: "Sleep", level: 5, color: "bg-blue-400" }
  ];

  const tips = [
    "Stay hydrated throughout the day",
    "Light exercise can help with mood",
    "Consider iron-rich foods",
    "Practice relaxation techniques"
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-12">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gradient">Period Tracker</h1>
          <Button variant="ghost" size="icon">
            <Calendar className="w-5 h-5" />
          </Button>
        </div>

        {/* Current Cycle Overview */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-primary/20">
            <CardHeader className="text-center">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${currentPhase.bg}`}>
                <PhaseIcon className={`w-10 h-10 ${currentPhase.color}`} />
              </div>
              <CardTitle className="text-2xl text-gradient">
                {currentPhase.phase} Phase
              </CardTitle>
              <p className="text-muted-foreground">
                Day {getDaysSinceLastPeriod()} of your cycle
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Cycle Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{daysUntilNext}</p>
                    <p className="text-xs text-muted-foreground">Days until next</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{cycleLength}</p>
                    <p className="text-xs text-muted-foreground">Cycle length</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Notification */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-rose-light/30 bg-rose-light/5">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-rose-light to-purple-light text-white">
                    {partnerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {partnerName} is notified about your cycle
                  </p>
                  <p className="text-xs text-muted-foreground">
                    They'll get caring reminders during PMS and period days
                  </p>
                </div>
                <Heart className="w-5 h-5 text-rose animate-heart-beat" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Symptoms */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                How are you feeling?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {symptoms.map((symptom, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{symptom.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <div
                            key={level}
                            className={`w-3 h-3 rounded-full ${
                              level <= symptom.level 
                                ? symptom.color 
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {symptom.level}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wellness Tips */}
        <div className="px-6 mb-6">
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-lg">Wellness Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <div className="px-6 mb-20">
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-lg">Recent History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Period</span>
                  <Badge variant="secondary">{formatDate(lastPeriod)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Cycle</span>
                  <Badge variant="secondary">{cycleLength} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Next Expected</span>
                  <Badge variant="secondary">
                    {formatDate(new Date(Date.now() + daysUntilNext * 24 * 60 * 60 * 1000))}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileContainer>
  );
};