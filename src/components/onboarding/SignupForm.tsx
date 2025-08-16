import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, User, Calendar, Heart } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SignupFormProps {
  onBack: () => void;
  onComplete: (userData: UserData) => void;
}

export interface UserData {
  phoneNumber: string;
  name: string;
  username: string;
  dateOfBirth: string;
  gender: string;
}

export const SignupForm = ({ onBack, onComplete }: SignupFormProps) => {
  const [formData, setFormData] = useState<UserData>({
    phoneNumber: "",
    name: "",
    username: "",
    dateOfBirth: "",
    gender: ""
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Your Phone Number",
      subtitle: "We'll send a verification code",
      fields: ["phoneNumber"]
    },
    {
      title: "Tell Us About You",
      subtitle: "Create your profile",
      fields: ["name", "username"]
    },
    {
      title: "Almost Done!",
      subtitle: "Just a few more details",
      fields: ["dateOfBirth", "gender"]
    }
  ];

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canContinue = () => {
    const currentFields = steps[currentStep].fields;
    return currentFields.every(field => formData[field as keyof UserData].trim() !== "");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-smooth ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center p-6">
          <Card className="glass-effect border-white/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 romantic-gradient rounded-full flex items-center justify-center">
                {currentStep === 0 && <Phone className="w-8 h-8 text-white" />}
                {currentStep === 1 && <User className="w-8 h-8 text-white" />}
                {currentStep === 2 && <Heart className="w-8 h-8 text-white" />}
              </div>
              <CardTitle className="text-2xl font-bold text-gradient">
                {currentStepData.title}
              </CardTitle>
              <p className="text-muted-foreground">{currentStepData.subtitle}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Phone Number Step */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {/* Profile Step */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your beautiful name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="@yourusername"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {/* Details Step */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleNext}
                disabled={!canContinue()}
                variant="romantic"
                className="w-full"
              >
                {currentStep < steps.length - 1 ? "Continue" : "Create Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileContainer>
  );
};