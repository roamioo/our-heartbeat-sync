import React, { useState, useEffect } from 'react';
import { User, Settings, Heart, Calendar, BarChart3, Shield, LogOut, Camera, Edit, QrCode, Share, Copy, Users, AlertTriangle, Database } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import TimelineMemories from './TimelineMemories';

interface ProfileProps {
  user: any;
  partner: any;
  session: any;
  onUpdateUser: (updatedUser: any) => void;
  onPartnerConnected: (partnerData: any) => void;
}

interface RelationshipStats {
  days_together: number;
  messages_count: number;
  memories_count: number;
  gifts_given: number;
  gifts_received: number;
  love_score: number;
}

export default function Profile({ user, partner, session, onUpdateUser, onPartnerConnected }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'connection' | 'insights' | 'settings'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<RelationshipStats>({
    days_together: 0,
    messages_count: 0,
    memories_count: 0,
    gifts_given: 0,
    gifts_received: 0,
    love_score: 0,
  });
  
  // Connection state
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [showJoinInvite, setShowJoinInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showDatabaseInfo, setShowDatabaseInfo] = useState(false);
  
  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });

  const [notifications, setNotifications] = useState({
    partnerMood: true,
    gifts: true,
    milestones: true,
    location: false,
  });

  useEffect(() => {
    if (partner && session) {
      loadRelationshipStats();
    }
    
    // Set the user's invite code if they have one
    if (user?.invite_code) {
      setInviteCode(user.invite_code);
    }
  }, [partner, session, user]);

  const loadRelationshipStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/stats/relationship`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading relationship stats:', error);
    }
  };

  const handleGetInviteCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Getting invite code with session:', session?.access_token ? 'present' : 'missing');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/pairing/create-invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('Get invite code response:', data);
      
      if (response.ok) {
        setInviteCode(data.invite_code);
        setShowInviteCode(true);
        setError('');
      } else {
        console.error('Failed to get invite code:', data);
        setError(data.error || 'Failed to get invite code');
        
        // Show database info if it's a table-related error
        if (data.hint && data.hint.includes('database')) {
          setShowDatabaseInfo(true);
        }
      }
    } catch (error) {
      console.error('Error getting invite code:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinCode || joinCode.length < 6) {
      setError('Please enter a valid invite code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/pairing/join`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inviteCode: joinCode }),
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        onPartnerConnected(data.partner);
        setShowJoinInvite(false);
        setJoinCode('');
        setError('');
      } else {
        console.error('Failed to join with code:', data);
        setError(data.error || 'Failed to join with code');
      }
    } catch (error) {
      console.error('Error joining with code:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/user/update-profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onUpdateUser(data.user);
        setIsEditingProfile(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to update profile:', errorData);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
  };

  const handleTestDatabase = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/debug/tables`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      console.log('Database tables status:', data);
      alert('Database status logged to console. Check developer tools.');
    } catch (error) {
      console.error('Error testing database:', error);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
              {showDatabaseInfo && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <p className="text-red-700 text-xs mb-2">
                    It looks like the database tables haven't been set up yet. This is a development setup issue.
                  </p>
                  <Button
                    onClick={handleTestDatabase}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <Database className="w-4 h-4 mr-1" />
                    Test Database
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* User Profile Card */}
      <Card className="p-6 bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <Camera className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          
          <div className="flex-1">
            {isEditingProfile ? (
              <div className="space-y-2">
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Your name"
                />
                <Input
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-medium text-gray-800">{user?.name}</h2>
                <p className="text-gray-600">@{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {user?.bio && <p className="text-sm text-gray-700 mt-1">{user.bio}</p>}
              </>
            )}
          </div>
          
          {isEditingProfile ? (
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateProfile}
                disabled={loading}
                size="sm"
                className="bg-green-500 hover:bg-green-600"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileData({ name: user?.name || '', bio: user?.bio || '' });
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditingProfile(true)}
              variant="outline"
              size="sm"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {partner && stats.days_together > 0 && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-medium text-gray-800">{stats.days_together}</p>
              <p className="text-sm text-gray-600">Days Together</p>
            </div>
            <div>
              <p className="text-2xl font-medium text-gray-800">{stats.love_score}%</p>
              <p className="text-sm text-gray-600">Love Score</p>
            </div>
          </div>
        )}
      </Card>

      {/* Partner Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Partner</h3>
          <Users className="w-4 h-4 text-gray-500" />
        </div>
        
        {partner ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {partner.name?.charAt(0) || 'P'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{partner.name}</p>
              <p className="text-sm text-green-600">✓ Connected</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Paired
            </Badge>
          </div>
        ) : (
          <div className="text-center py-4">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">No partner connected</p>
            <p className="text-sm text-gray-500 mb-4">
              Use the Connection tab to pair with your partner
            </p>
          </div>
        )}
      </Card>

      {/* Stats */}
      {partner && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 text-center">
            <p className="text-lg font-medium text-gray-800">{stats.messages_count}</p>
            <p className="text-xs text-gray-600">Messages</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-lg font-medium text-gray-800">{stats.memories_count}</p>
            <p className="text-xs text-gray-600">Memories</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-lg font-medium text-gray-800">{stats.gifts_given}</p>
            <p className="text-xs text-gray-600">Gifts Given</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-lg font-medium text-gray-800">{stats.gifts_received}</p>
            <p className="text-xs text-gray-600">Gifts Received</p>
          </Card>
        </div>
      )}

      {/* Timeline Memories */}
      <Card className="p-4">
        <TimelineMemories 
          user={user} 
          partner={partner} 
          session={session} 
          viewMode="grid"
        />
      </Card>
    </div>
  );

  const renderConnectionTab = () => (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-medium text-gray-800 mb-4">Partner Connection</h3>
        
        {partner ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Connected to {partner.name}</h4>
            <p className="text-sm text-gray-600">You're all set! Enjoy your journey together.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Choose how you'd like to connect with your partner:
            </p>
            
            <Button
              onClick={() => {
                if (inviteCode) {
                  setShowInviteCode(true);
                } else {
                  handleGetInviteCode();
                }
              }}
              disabled={loading}
              variant="outline"
              className="w-full h-16 flex flex-col items-center gap-2 border-2 hover:border-pink-300 hover:bg-pink-50"
            >
              <QrCode className="w-6 h-6 text-pink-500" />
              <div className="text-center">
                <div className="font-medium">
                  {inviteCode ? 'Show My Invite Code' : 'Get My Invite Code'}
                </div>
                <div className="text-xs text-gray-500">
                  {inviteCode ? 'Share your permanent code' : 'Generate your unique code'}
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => setShowJoinInvite(true)}
              variant="outline"
              className="w-full h-16 flex flex-col items-center gap-2 border-2 hover:border-purple-300 hover:bg-purple-50"
            >
              <Share className="w-6 h-6 text-purple-500" />
              <div className="text-center">
                <div className="font-medium">Join Using Code</div>
                <div className="text-xs text-gray-500">Enter your partner's invite code</div>
              </div>
            </Button>
            
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
                    if (data.partner) {
                      onPartnerConnected(data.partner);
                    }
                  } else {
                    const errorData = await response.json();
                    console.error('Failed to connect dummy partner:', errorData);
                    // Still try the fallback for demo purposes
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
                } catch (error) {
                  console.error('Error connecting dummy partner:', error);
                  // Fallback for demo purposes
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
              }}
              variant="outline"
              className="w-full h-16 flex flex-col items-center gap-2 border-2 hover:border-orange-300 hover:bg-orange-50"
            >
              <Heart className="w-6 h-6 text-orange-500" />
              <div className="text-center">
                <div className="font-medium">Connect with Dummy Darling</div>
                <div className="text-xs text-gray-500">For testing and demo purposes</div>
              </div>
            </Button>
          </div>
        )}
      </Card>

      {/* Show Invite Code Modal */}
      {showInviteCode && inviteCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <div className="p-6 text-center">
              <h3 className="font-medium text-gray-800 mb-4">Your Invite Code</h3>
              
              <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 mb-4">
                <p className="text-sm text-gray-600 mb-2">Share this code with your partner:</p>
                <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider">{inviteCode}</p>
                <Button
                  onClick={copyInviteCode}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Code
                </Button>
              </Card>
              
              <p className="text-sm text-gray-600 mb-4">
                This is your permanent invite code - it won't expire!
              </p>
              
              <Button
                onClick={() => setShowInviteCode(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Join Invite Modal */}
      {showJoinInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <div className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Join Partner</h3>
              
              <div className="space-y-4">
                <Input
                  placeholder="Enter partner's invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="text-center font-mono text-lg tracking-wider"
                  maxLength={8}
                />
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowJoinInvite(false);
                      setError('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleJoinWithCode}
                    disabled={joinCode.length < 6 || loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          Relationship Insights
        </h3>
        
        {partner ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-medium text-gray-800">{stats.love_score}%</p>
                <p className="text-sm text-gray-600">Connection Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-medium text-gray-800">{stats.days_together}</p>
                <p className="text-sm text-gray-600">Days Together</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✨ Great communication! You've exchanged {stats.messages_count} messages.
                </p>
              </div>
              
              {stats.memories_count > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    📸 You've captured {stats.memories_count} beautiful memories together.
                  </p>
                </div>
              )}
              
              {stats.gifts_given + stats.gifts_received > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    🎁 You've shared {stats.gifts_given + stats.gifts_received} thoughtful gifts.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Connect with your partner to see insights</p>
          </div>
        )}
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-medium text-gray-800 mb-4">Notifications</h3>
        
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-xs text-gray-600">
                  {key === 'partnerMood' && 'Get notified when your partner updates their mood'}
                  {key === 'gifts' && 'Reminders for gift suggestions and occasions'}
                  {key === 'milestones' && 'Anniversary and relationship milestone alerts'}
                  {key === 'location' && 'Share location updates with your partner'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => {
                  setNotifications(prev => ({ ...prev, [key]: checked }));
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          Privacy & Security
        </h3>
        
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" disabled>
            <Settings className="w-4 h-4 mr-2" />
            Privacy Settings
          </Button>
          
          <Button variant="outline" className="w-full justify-start" disabled>
            <User className="w-4 h-4 mr-2" />
            Profile Visibility
          </Button>
          
          <Button variant="outline" className="w-full justify-start" disabled>
            <Calendar className="w-4 h-4 mr-2" />
            Data Export
          </Button>
        </div>
      </Card>

      <Card className="p-4 border-red-200 bg-red-50">
        <h3 className="font-medium text-red-800 mb-4">Account Actions</h3>
        
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'connection', label: 'Connection', icon: Heart },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="p-4 space-y-4">
        
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'text-gray-600 hover:bg-pink-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'connection' && renderConnectionTab()}
        {activeTab === 'insights' && renderInsightsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
}