import { useState } from "react";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";
import { SignupForm, UserData } from "@/components/onboarding/SignupForm";
import { ConnectPartner } from "@/components/onboarding/ConnectPartner";
import { Dashboard } from "@/components/dashboard/Dashboard";

type AppState = "welcome" | "signup" | "connect" | "dashboard";

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("welcome");
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleGetStarted = () => {
    setCurrentState("signup");
  };

  const handleSignupComplete = (data: UserData) => {
    setUserData(data);
    setCurrentState("connect");
  };

  const handlePartnerConnected = () => {
    setCurrentState("dashboard");
  };

  const handleBackToWelcome = () => {
    setCurrentState("welcome");
    setUserData(null);
  };

  return (
    <div className="min-h-screen">
      {currentState === "welcome" && (
        <WelcomeScreen onGetStarted={handleGetStarted} />
      )}
      
      {currentState === "signup" && (
        <SignupForm 
          onBack={handleBackToWelcome}
          onComplete={handleSignupComplete}
        />
      )}
      
      {currentState === "connect" && userData && (
        <ConnectPartner 
          userData={userData}
          onPartnerConnected={handlePartnerConnected}
        />
      )}
      
      {currentState === "dashboard" && userData && (
        <Dashboard userData={userData} />
      )}
    </div>
  );
};

export default Index;
