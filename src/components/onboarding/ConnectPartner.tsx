import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Share, UserPlus, Copy, Check } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { UserData } from "./SignupForm";
import heartFlowers from "@/assets/heart-flowers.jpg";

interface ConnectPartnerProps {
  userData: UserData;
  onPartnerConnected: () => void;
}

export const ConnectPartner = ({ userData, onPartnerConnected }: ConnectPartnerProps) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const inviteCode = `LOVE${userData.username.toUpperCase()}2024`;
  const inviteLink = `https://lovesync.app/join/${inviteCode}`;

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on LoveSync!",
          text: `Hi! I'm waiting for you on LoveSync, our relationship app. Join me with this link:`,
          url: inviteLink,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyInviteLink();
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen justify-center p-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-32 h-32 mb-6">
            <img 
              src={heartFlowers} 
              alt="Heart made of flowers" 
              className="w-full h-full object-cover rounded-full shadow-romantic animate-pulse-soft"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rose/20 to-transparent rounded-full" />
          </div>
          
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Almost There, {userData.name}!
          </h1>
          <p className="text-muted-foreground">
            Invite your partner to start your love journey together
          </p>
        </div>

        {/* Invite Options */}
        <div className="space-y-4 mb-8">
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                Your Invite Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-rose-light/20 to-purple-light/20 rounded-xl border border-rose-light/30">
                  <span className="text-2xl font-bold text-gradient tracking-wider">
                    {inviteCode}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="soft"
                  onClick={copyInviteLink}
                  className="flex items-center justify-center"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                
                <Button
                  variant="romantic"
                  onClick={shareInvite}
                  className="flex items-center justify-center"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <Button
                variant="outline"
                onClick={() => setShowQR(!showQR)}
                className="w-full flex items-center justify-center"
              >
                <QrCode className="w-5 h-5 mr-2" />
                {showQR ? "Hide QR Code" : "Show QR Code"}
              </Button>
              
              {showQR && (
                <div className="mt-4 p-4 bg-white rounded-lg text-center">
                  {/* Mock QR Code */}
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-gray-500 text-center">
                      <QrCode className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">QR Code</p>
                      <p className="text-xs">{inviteCode}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Your partner can also join later
          </p>
          <Button
            variant="ghost"
            onClick={onPartnerConnected}
            className="text-primary"
          >
            Continue Solo for Now
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
};