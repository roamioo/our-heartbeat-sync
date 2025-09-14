import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Calendar, Gift, Smile, MessageCircle, Camera, Plus, TrendingUp, Users, Sparkles, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { projectId } from '../utils/supabase/info';

interface DashboardProps {
  user: any;
  partner: any;
  session: any;
  onPartnerConnected?: (partnerData: any) => void;
}

interface MoodEntry {
  id: string;
  mood_emoji: string;
  mood_text: string;
  mood_scale: number;
  activity_status: string;
  created_at: string;
  date: string;
}

interface RelationshipStats {
  days_together: number;
  messages_count: number;
  memories_count: number;
  gifts_given: number;
  gifts_received: number;
  mood_updates_count: number;
  love_score: number;
}

export default function Dashboard({ user, partner, session, onPartnerConnected }: DashboardProps) {
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [partnerMood, setPartnerMood] = useState<MoodEntry | null>(null);
  const [currentActivity, setCurrentActivity] = useState('');
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [stats, setStats] = useState<RelationshipStats>({
    days_together: 0,
    messages_count: 0,
    memories_count: 0,
    gifts_given: 0,
    gifts_received: 0,
    mood_updates_count: 0,
    love_score: 0,
  });
  const [loading, setLoading] = useState(true);

  const moods = [
    { emoji: '😊', label: 'Happy', color: 'text-yellow-500', scale: 8 },
    { emoji: '💕', label: 'Loving', color: 'text-pink-500', scale: 9 },
    { emoji: '🤗', label: 'Excited', color: 'text-orange-500', scale: 7 },
    { emoji: '😌', label: 'Peaceful', color: 'text-green-500', scale: 6 },
    { emoji: '😴', label: 'Tired', color: 'text-blue-500', scale: 4 },
    { emoji: '😢', label: 'Sad', color: 'text-gray-500', scale: 2 },
  ];

  const activities = [
    'Working', 'Studying', 'At gym', 'Cooking', 'Commuting', 'Relaxing', 'Out with friends', 'Shopping', 'Reading', 'Traveling'
  ];

  useEffect(() => {
    if (user && session) {
      loadDashboardData();
    }
  }, [user, session]);

  useEffect(() => {
    // Load partner mood if partner exists
    if (partner && session) {
      loadPartnerMood();
    }
  }, [partner, session]);

  const loadDashboardData = async () => {
    try {
      // Set loading to false quickly to show dashboard faster
      setLoading(false);
      
      // Check if user has already updated mood today (from localStorage - fast)
      const today = new Date().toISOString().split('T')[0];
      const existingMood = localStorage.getItem(`mood_${user.id}_${today}`);
      if (existingMood) {
        setTodayMood(JSON.parse(existingMood));
      }

      // Load relationship statistics in background (non-blocking)
      const statsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/stats/relationship`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      } else {
        console.log('Stats loading failed, using defaults');
        // Keep default stats if loading fails
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Still continue - dashboard should work even if stats fail
    }
  };

  const loadPartnerMood = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/mood/partner`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPartnerMood(data.mood);
      }
    } catch (error) {
      console.error('Error loading partner mood:', error);
    }
  };

  const handleMoodSubmit = async (mood: any) => {
    try {
      const moodData = {
        mood: mood.label,
        emoji: mood.emoji,
        message: currentActivity ? `Currently ${currentActivity.toLowerCase()}` : `Feeling ${mood.label.toLowerCase()} today!`,
        moodScale: mood.scale,
        activityStatus: currentActivity || mood.label,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/mood/update`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(moodData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTodayMood(data.mood);
        setShowMoodSelector(false);
        setCurrentActivity('');
        
        // Cache mood for today
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`mood_${user.id}_${today}`, JSON.stringify(data.mood));
        
        // Reload stats
        loadDashboardData();
      } else {
        const errorData = await response.json();
        console.error('Failed to update mood:', errorData);
      }
    } catch (error) {
      console.error('Error updating mood:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="h-full overflow-y-auto native-scroll hide-scrollbar">
        {/* Header Section */}
        <div className="bg-white px-4 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Good morning, {(() => {
                  // First try to get name from user.name
                  if (user?.name && user.name.trim()) {
                    return user.name.split(' ')[0];
                  }
                  // Then try user_metadata name if available
                  if (user?.user_metadata?.name && user.user_metadata.name.trim()) {
                    return user.user_metadata.name.split(' ')[0];
                  }
                  // Fall back to email prefix
                  if (user?.email) {
                    return user.email.split('@')[0];
                  }
                  // Final fallback
                  return 'there';
                })()}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {partner 
                  ? `You and ${
                      partner.name && partner.name.trim()
                        ? partner.name.split(' ')[0] 
                        : partner.email?.split('@')[0] || 'your partner'
                    } are connected ❤️` 
                  : 'Ready to start your journey?'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {(() => {
                  if (user?.name && user.name.trim()) {
                    return user.name.charAt(0).toUpperCase();
                  }
                  if (user?.user_metadata?.name && user.user_metadata.name.trim()) {
                    return user.user_metadata.name.charAt(0).toUpperCase();
                  }
                  if (user?.email) {
                    return user.email.charAt(0).toUpperCase();
                  }
                  return 'U';
                })()}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-4 text-white">
              <div className="text-2xl font-bold">{stats.love_score}%</div>
              <div className="text-xs opacity-90">
                {partner ? 'Love Score' : 'Wellness'}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{stats.days_together}</div>
              <div className="text-xs text-gray-600">
                {partner ? 'Days Together' : 'Your Journey'}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{stats.memories_count}</div>
              <div className="text-xs text-gray-600">Memories</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Mood Check-in - Enhanced UI */}
          <Card className="p-4 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Smile className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Today's Check-in</h3>
                  <p className="text-xs text-gray-600">How are you feeling?</p>
                </div>
              </div>
              {todayMood && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{todayMood.mood_emoji}</span>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-900">{todayMood.mood_scale}/10</div>
                    <div className="text-xs text-gray-500">{formatTime(todayMood.created_at)}</div>
                  </div>
                </div>
              )}
            </div>
            
            {!todayMood ? (
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  {moods.slice(0, 6).map((mood) => (
                    <button
                      key={mood.label}
                      onClick={() => handleMoodSubmit(mood)}
                      className="aspect-square bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-pink-300 transition-all duration-200 touch-feedback flex flex-col items-center justify-center p-2"
                    >
                      <div className="text-xl mb-1">{mood.emoji}</div>
                      <div className="text-xs text-gray-600 text-center leading-tight">{mood.label}</div>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setShowMoodSelector(true)}
                  variant="outline"
                  className="w-full h-10 text-gray-600 border-gray-200 hover:bg-gray-50 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  More options
                </Button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 border border-pink-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-2xl">{todayMood.mood_emoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="font-medium text-gray-900">Feeling {todayMood.mood_text.toLowerCase()}</p>
                    </div>
                    <p className="text-xs text-gray-600">{todayMood.activity_status}</p>
                  </div>
                  <Button
                    onClick={() => setShowMoodSelector(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    Update
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Partner's Mood */}
          {partner && partnerMood && (
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-0 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{partner.name}'s Mood</h3>
                <MessageCircle className="w-5 h-5 text-purple-500" />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">{partnerMood.mood_emoji}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Scale: {partnerMood.mood_scale}/10</p>
                  <p className="text-gray-600 text-sm">{partnerMood.mood_text}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(partnerMood.created_at)}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-full"
                >
                  React
                </Button>
              </div>
            </Card>
          )}

          {/* Partner Connection */}
          {!partner && (
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Connect with Partner</h3>
                  <p className="text-gray-600 text-sm">Share moods, memories, and gifts together</p>
                </div>
              </div>
              
              {/* Quick Demo Partner Button */}
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/pairing/connect-dummy`,
                      {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${session.access_token}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );
                    
                    if (response.ok) {
                      const data = await response.json();
                      if (onPartnerConnected && data.partner) {
                        onPartnerConnected(data.partner);
                      }
                    } else {
                      const errorData = await response.json();
                      console.error('Failed to connect dummy partner:', errorData);
                      // Still try the fallback for demo purposes
                      if (onPartnerConnected) {
                        const dummyPartner = {
                          id: 'dummy-partner-001',
                          name: 'Dummy Darling',
                          username: 'dummydarling',
                          email: 'dummy@lovelink.app',
                          relationship_start_date: new Date().toISOString(),
                          relationship_id: 'dummy-relationship-001'
                        };
                        onPartnerConnected(dummyPartner);
                      }
                    }
                  } catch (error) {
                    console.error('Error connecting dummy partner:', error);
                    // Fallback for demo purposes
                    if (onPartnerConnected) {
                      const dummyPartner = {
                        id: 'dummy-partner-001',
                        name: 'Dummy Darling',
                        username: 'dummydarling',
                        email: 'dummy@lovelink.app',
                        relationship_start_date: new Date().toISOString(),
                        relationship_id: 'dummy-relationship-001'
                      };
                      onPartnerConnected(dummyPartner);
                    }
                  }
                }}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl font-medium touch-feedback"
              >
                <Heart className="w-4 h-4 mr-2" />
                Try with Dummy Darling 💕
              </Button>
              
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-500 px-2">or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-2">
                Go to Profile → Connection for more options
              </p>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 px-1">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2 rounded-2xl border-gray-200 bg-white touch-feedback"
              >
                <Camera className="w-6 h-6 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Add Memory</span>
              </Button>
              
              {partner ? (
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2 rounded-2xl border-gray-200 bg-white touch-feedback"
                >
                  <Gift className="w-6 h-6 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Send Gift</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2 rounded-2xl border-gray-200 bg-white touch-feedback"
                >
                  <Users className="w-6 h-6 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Invite Partner</span>
                </Button>
              )}
            </div>
          </div>

          {/* Activity Stats */}
          <Card className="p-4 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{partner ? stats.messages_count : stats.mood_updates_count}</div>
                <div className="text-sm text-gray-600">{partner ? 'Messages' : 'Check-ins'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {partner ? (stats.gifts_given + stats.gifts_received) : stats.memories_count}
                </div>
                <div className="text-sm text-gray-600">{partner ? 'Gifts' : 'Memories'}</div>
              </div>
            </div>
          </Card>

          {/* Solo Mode Features */}
          {!partner && (
            <Card className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-0 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900">Solo Mode Features</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Track your daily moods and activities</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Create a personal timeline of memories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Monitor your wellness journey</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Ready to invite a partner anytime</span>
                </div>
              </div>
            </Card>
          )}

          {/* Bottom padding for scroll */}
          <div className="h-4"></div>
        </div>
      </div>

      {/* Mood Selector Modal */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-md pb-safe-area">
            <div className="text-center mb-6">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">How are you feeling?</h3>
              {partner && (
                <p className="text-gray-600 mt-2">
                  {partner.name} will see your mood update
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => handleMoodSubmit(mood)}
                  className="p-4 text-center hover:bg-gray-50 rounded-2xl transition-colors touch-feedback"
                >
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium text-gray-900">{mood.label}</div>
                  <div className="text-xs text-gray-500">{mood.scale}/10</div>
                </button>
              ))}
            </div>
            
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">What are you doing?</p>
              <div className="flex flex-wrap gap-2">
                {activities.map((activity) => (
                  <button
                    key={activity}
                    onClick={() => setCurrentActivity(activity)}
                    className={`px-3 py-2 text-xs rounded-full border transition-colors touch-feedback ${
                      currentActivity === activity
                        ? 'bg-pink-100 border-pink-300 text-pink-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={() => setShowMoodSelector(false)}
              variant="outline"
              className="w-full h-12 rounded-full border-gray-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}