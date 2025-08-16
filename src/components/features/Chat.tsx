import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Smile, Camera, Mic, Heart, MapPin } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text: string;
  sender: "me" | "partner";
  timestamp: Date;
  type: "text" | "mood" | "location" | "photo";
  emoji?: string;
  location?: string;
}

interface ChatProps {
  partnerName?: string;
  onBack: () => void;
}

export const Chat = ({ partnerName = "Partner", onBack }: ChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Good morning my love! ☀️",
      sender: "partner",
      timestamp: new Date(Date.now() - 3600000),
      type: "text"
    },
    {
      id: "2",
      text: "Good morning beautiful! Hope you slept well 💕",
      sender: "me",
      timestamp: new Date(Date.now() - 3000000),
      type: "text"
    },
    {
      id: "3",
      text: "",
      sender: "partner",
      timestamp: new Date(Date.now() - 1800000),
      type: "mood",
      emoji: "😍"
    },
    {
      id: "4",
      text: "At the coffee shop thinking of you",
      sender: "partner",
      timestamp: new Date(Date.now() - 900000),
      type: "location",
      location: "Moonbean Coffee"
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "me",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");
  };

  const sendMood = (emoji: string) => {
    const moodMessage: Message = {
      id: Date.now().toString(),
      text: "",
      sender: "me",
      timestamp: new Date(),
      type: "mood",
      emoji
    };

    setMessages(prev => [...prev, moodMessage]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble = ({ msg }: { msg: Message }) => {
    const isMe = msg.sender === "me";
    
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}>
        <div className={`flex items-end space-x-2 max-w-[80%] ${isMe ? "flex-row-reverse space-x-reverse" : ""}`}>
          {!isMe && (
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-rose-light to-purple-light text-white text-xs">
                {partnerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`p-3 rounded-2xl ${
            isMe 
              ? "romantic-gradient text-white" 
              : "bg-muted"
          }`}>
            {msg.type === "text" && (
              <p className="text-sm">{msg.text}</p>
            )}
            
            {msg.type === "mood" && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{msg.emoji}</span>
                <span className="text-xs opacity-70">Shared mood</span>
              </div>
            )}
            
            {msg.type === "location" && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <div>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70">{msg.location}</p>
                </div>
              </div>
            )}
            
            <p className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MobileContainer>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="glass-effect border-b border-white/20 p-4 pt-12">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-rose-light to-purple-light text-white">
                {partnerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-semibold">{partnerName}</h1>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </div>

        {/* Quick Moods */}
        <div className="px-4 py-2">
          <div className="flex space-x-2 justify-center">
            {["😊", "😍", "🥰", "😘", "🤗"].map(emoji => (
              <Button
                key={emoji}
                variant="soft"
                size="sm"
                className="text-lg p-2"
                onClick={() => sendMood(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="glass-effect border-t border-white/20 p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Camera className="w-5 h-5" />
            </Button>
            
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />
            
            <Button variant="ghost" size="icon">
              <Mic className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="romantic" 
              size="icon"
              onClick={sendMessage}
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
};