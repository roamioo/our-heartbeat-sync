import React, { useState, useEffect, useRef } from 'react';
import { Send, Camera, Mic, Heart, Smile, MapPin, Plus, Image as ImageIcon, Users, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { projectId } from '../utils/supabase/info';

interface ChatProps {
  user: any;
  partner: any;
  session: any;
}

interface Message {
  id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'voice' | 'sticker' | 'location';
  content: string;
  media_url?: string;
  location_name?: string;
  sticker_id?: string;
  sent_at: string;
  sender: {
    id: string;
    name: string;
    username: string;
  };
}

export default function Chat({ user, partner, session }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const moodStickers = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'love', emoji: '💕', label: 'Love' },
    { id: 'kiss', emoji: '😘', label: 'Kiss' },
    { id: 'hug', emoji: '🤗', label: 'Hug' },
    { id: 'excited', emoji: '🤩', label: 'Excited' },
    { id: 'heart_eyes', emoji: '😍', label: 'Heart Eyes' },
    { id: 'thinking', emoji: '🤔', label: 'Thinking' },
    { id: 'sleepy', emoji: '😴', label: 'Sleepy' },
  ];

  useEffect(() => {
    if (user && session) {
      if (partner) {
        loadMessages();
        
        // Set up polling for new messages (in production, use websockets)
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
      } else {
        setLoading(false);
      }
    }
  }, [user, session, partner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/messages`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to load messages:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text', mediaUrl?: string, stickerId?: string) => {
    if ((!content.trim() && messageType === 'text') || !partner) return;
    
    setSending(true);
    
    try {
      const messageData = {
        content: content || '',
        type: messageType,
        media_url: mediaUrl,
        sticker_id: stickerId,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Add sender info to the message
        const messageWithSender = {
          ...data.message,
          sender: {
            id: user?.id,
            name: user?.name || user?.username || 'You',
            username: user?.username || 'user',
          }
        };
        
        setMessages(prev => [...prev, messageWithSender]);
        setNewMessage('');
        setShowStickers(false);
      } else {
        try {
          const errorData = await response.json();
          console.error('Failed to send message:', errorData);
        } catch (e) {
          const errorText = await response.text();
          console.error('Failed to send message:', response.status, errorText);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendText = () => {
    sendMessage(newMessage, 'text');
  };

  const handleSendSticker = (sticker: any) => {
    sendMessage(sticker.label, 'sticker', undefined, sticker.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (!partner) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-12 h-12 text-pink-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Chat in Solo Mode</h3>
          <p className="text-gray-600 mb-6">
            Connect with your partner to start sending messages, sharing stickers, and having intimate conversations together.
          </p>
          
          <div className="space-y-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Coming Soon in Chat:</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• Send mood stickers and emojis</p>
                <p>• Share voice messages</p>
                <p>• Send photos and memories</p>
                <p>• Real-time conversation sync</p>
              </div>
            </Card>
            
            <Button 
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              onClick={() => {
                // Navigate to profile tab for partner connection
                const event = new CustomEvent('navigate-to-profile');
                window.dispatchEvent(event);
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Connect Partner
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Chat Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-100 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
          <span className="text-white font-medium">
            {partner.name?.charAt(0) || 'P'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">{partner.name}</h3>
          <p className="text-sm text-green-600">Connected</p>
        </div>
        <Badge variant="secondary" className="bg-pink-100 text-pink-700">
          💕 Paired
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Start your conversation</h3>
            <p className="text-sm text-gray-500 mb-4">
              Send your first message to {partner.name}!
            </p>
            
            {/* Conversation Starters */}
            <div className="space-y-2 max-w-xs mx-auto">
              <button
                onClick={() => setNewMessage("Hey love! How's your day going? 💕")}
                className="w-full text-left p-3 bg-white rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors"
              >
                <p className="text-sm text-gray-700">"Hey love! How's your day going? 💕"</p>
              </button>
              <button
                onClick={() => setNewMessage("Thinking of you right now ❤️")}
                className="w-full text-left p-3 bg-white rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors"
              >
                <p className="text-sm text-gray-700">"Thinking of you right now ❤️"</p>
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-white border border-pink-100 text-gray-800'
                  }`}
                >
                  {message.message_type === 'sticker' ? (
                    <div className="text-center">
                      <span className="text-4xl">
                        {moodStickers.find(s => s.id === message.sticker_id)?.emoji || '😊'}
                      </span>
                      <p className="text-xs mt-1 opacity-75">{message.content}</p>
                    </div>
                  ) : message.message_type === 'text' ? (
                    <p>{message.content}</p>
                  ) : message.message_type === 'image' ? (
                    <div>
                      <div className="w-48 h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      {message.content && <p className="text-sm">{message.content}</p>}
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  
                  <div className="flex justify-between items-center mt-2 text-xs opacity-75">
                    <span>{formatMessageTime(message.sent_at)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticker Selector */}
      {showStickers && (
        <div className="bg-white border-t border-pink-100 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Smile className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-700">Mood Stickers</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {moodStickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleSendSticker(sticker)}
                className="p-3 text-center hover:bg-pink-50 rounded-lg transition-colors"
              >
                <div className="text-3xl mb-1">{sticker.emoji}</div>
                <div className="text-xs text-gray-600">{sticker.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-pink-100 p-4">
        <div className="flex items-center gap-2">
          {/* Action Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStickers(!showStickers)}
            className="text-pink-500 hover:bg-pink-50"
          >
            <Smile className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:bg-gray-50"
            disabled
          >
            <Camera className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:bg-gray-50"
            disabled
          >
            <MapPin className="w-5 h-5" />
          </Button>
          
          {/* Message Input */}
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${partner.name}...`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              className="border-pink-200 focus:border-pink-300"
            />
            
            <Button
              onClick={handleSendText}
              disabled={!newMessage.trim() || sending}
              size="sm"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}