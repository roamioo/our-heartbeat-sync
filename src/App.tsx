import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Calendar, User, Gift, Home, AlertTriangle, Database } from 'lucide-react';
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import OnboardingFlow from './components/OnboardingFlow';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Timeline from './components/Timeline';
import Profile from './components/Profile';
import GiftStore from './components/GiftStore';
import DatabaseSetup from './components/DatabaseSetup';
import DebugInfo from './components/DebugInfo';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';

type Tab = 'home' | 'chat' | 'timeline' | 'gifts' | 'profile';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string>('');
  const [showDatabaseError, setShowDatabaseError] = useState(false);

  useEffect(() => {
    // Check for existing session
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          await loadUserProfile(session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setPartner(null);
          setIsAuthenticated(false);
          setProfileError('');
        }
      }
    );

    // Listen for navigation events from components
    const handleNavigateToProfile = () => {
      setCurrentTab('profile');
    };

    window.addEventListener('navigate-to-profile', handleNavigateToProfile);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('navigate-to-profile', handleNavigateToProfile);
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        return;
      }
      
      if (session) {
        setSession(session);
        await loadUserProfile(session.access_token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Check session error:', error);
      setLoading(false);
    }
  };

  const loadUserProfile = async (accessToken: string) => {
    try {
      console.log('Loading user profile...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/user/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Profile response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data loaded:', data);
        setUser(data.user);
        setPartner(data.partner);
        setIsAuthenticated(true);
        setProfileError('');
      } else {
        const errorText = await response.text();
        console.error('Failed to load user profile:', response.status, errorText);
        
        // For demo purposes, if profile loading fails, we'll still authenticate the user
        // but create a minimal user object from the auth session
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser(accessToken);
          
          if (authUser) {
            console.log('Creating minimal user profile for demo...');
            // Create a minimal user object from auth data
            const minimalUser = {
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.name || 
                    (authUser.user_metadata?.username ? authUser.user_metadata.username.charAt(0).toUpperCase() + authUser.user_metadata.username.slice(1) : null) ||
                    (authUser.email?.split('@')[0]?.charAt(0).toUpperCase() + authUser.email?.split('@')[0]?.slice(1)) || 
                    'User',
              username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
              date_of_birth: authUser.user_metadata?.date_of_birth,
              gender: authUser.user_metadata?.gender,
              is_verified: true,
            };
            
            setUser(minimalUser);
            setPartner(null); // No partner in demo mode
            setIsAuthenticated(true);
            setProfileError('');
            console.log('Demo mode activated with minimal user profile:', minimalUser);
          } else {
            throw new Error('No auth user found');
          }
        } catch (authError) {
          console.error('Auth user check failed:', authError);
          
          try {
            const errorData = JSON.parse(errorText);
            setProfileError(errorData.error || `HTTP ${response.status}`);
            
            // Check if it's a database-related error
            if (errorData.hint && errorData.hint.includes('database')) {
              setShowDatabaseError(true);
            }
          } catch (e) {
            setProfileError(`HTTP ${response.status}: ${errorText}`);
          }
          
          // If the profile fails to load, we'll show the database error screen
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Load user profile error:', error);
      
      // For network errors, try to get auth user and proceed in demo mode
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser(accessToken);
        
        if (authUser) {
          console.log('Network error - proceeding with demo mode...');
          const minimalUser = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || 
                    (authUser.user_metadata?.username ? authUser.user_metadata.username.charAt(0).toUpperCase() + authUser.user_metadata.username.slice(1) : null) ||
                    (authUser.email?.split('@')[0]?.charAt(0).toUpperCase() + authUser.email?.split('@')[0]?.slice(1)) || 
                    'User',
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
            date_of_birth: authUser.user_metadata?.date_of_birth,
            gender: authUser.user_metadata?.gender,
            is_verified: true,
          };
          
          setUser(minimalUser);
          setPartner(null);
          setIsAuthenticated(true);
          setProfileError('');
        } else {
          setProfileError('Network error. Please check your connection.');
          setIsAuthenticated(false);
        }
      } catch (authError) {
        console.error('Fallback auth check failed:', authError);
        setProfileError('Network error. Please check your connection.');
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData: any, sessionData: any) => {
    setUser(userData);
    setSession(sessionData);
    setIsAuthenticated(true);
    setProfileError('');
  };

  const handlePartnerConnected = (partnerData: any) => {
    setPartner(partnerData);
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);

  const handleTestDatabase = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/debug/tables`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      console.log('Database tables status:', data);
      alert('Database status logged to console. Check developer tools.');
    } catch (error) {
      console.error('Error testing database:', error);
      alert('Error testing database. Check console for details.');
    }
  };

  const handleRetryProfile = async () => {
    if (session) {
      setLoading(true);
      setProfileError('');
      await loadUserProfile(session.access_token);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Status Bar */}
        <div className="h-12 bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
          <div className="text-white text-sm font-medium">9:41</div>
        </div>
        
        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">LoveLink</h2>
            <p className="text-gray-600">Loading your love story...</p>
          </div>
        </div>
        
        {/* Bottom Safe Area */}
        <div className="h-8 bg-gray-50"></div>
      </div>
    );
  }

  // Show database error screen if authentication succeeded but profile loading failed
  if (session && !isAuthenticated && profileError) {
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Status Bar */}
        <div className="h-12 bg-red-500 flex items-center justify-center">
          <div className="text-white text-sm font-medium">9:41</div>
        </div>
        
        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-6 border-red-200">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-800 mb-3">Setup Required</h2>
              <p className="text-gray-600 mb-6">
                There's a database configuration issue. This is likely because the database tables haven't been created yet.
              </p>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-red-800 text-sm font-medium mb-2">Error Details:</p>
                  <p className="text-red-700 text-sm">{profileError}</p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleRetryProfile}
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-full"
                  >
                    Retry Loading Profile
                  </Button>
                  
                  <Button
                    onClick={() => setShowDatabaseSetup(true)}
                    variant="outline"
                    className="w-full h-12 rounded-full"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Open Database Setup
                  </Button>
                  
                  <Button
                    onClick={async () => {
                      try {
                        await supabase.auth.signOut();
                      } catch (e) {
                        console.error('Sign out error:', e);
                      }
                    }}
                    variant="outline"
                    className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 rounded-full"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Bottom Safe Area */}
        <div className="h-8 bg-gray-50"></div>
      </div>
    );
  }

  // Show database setup if requested
  if (showDatabaseSetup) {
    return (
      <DatabaseSetup 
        session={session}
        onBack={() => setShowDatabaseSetup(false)}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <OnboardingFlow 
        onAuthSuccess={handleAuthSuccess}
        onPartnerConnected={handlePartnerConnected}
      />
    );
  }

  const tabs = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'chat' as Tab, label: 'Chat', icon: MessageCircle },
    { id: 'timeline' as Tab, label: 'Timeline', icon: Calendar },
    { id: 'gifts' as Tab, label: 'Gifts', icon: Gift },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ];

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'home':
        return <Dashboard user={user} partner={partner} session={session} onPartnerConnected={handlePartnerConnected} />;
      case 'chat':
        return <Chat user={user} partner={partner} session={session} />;
      case 'timeline':
        return <Timeline user={user} partner={partner} session={session} />;
      case 'gifts':
        return <GiftStore user={user} partner={partner} session={session} />;
      case 'profile':
        return (
          <Profile 
            user={user} 
            partner={partner} 
            session={session}
            onUpdateUser={handleUpdateUser}
            onPartnerConnected={handlePartnerConnected}
          />
        );
      default:
        return <Dashboard user={user} partner={partner} session={session} onPartnerConnected={handlePartnerConnected} />;
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col relative">
      {/* Status Bar */}
      <div className="h-12 bg-gradient-to-r from-pink-500 to-purple-500 flex items-center px-4">
        <div className="flex-1 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-white" />
            <span className="text-white font-medium">LoveLink</span>
            {!partner && (
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                Solo
              </span>
            )}
          </div>
          
          {/* Center - Time */}
          <div className="text-white text-sm font-medium">
            9:41
          </div>
          
          {/* Right Side */}
          <div className="flex items-center gap-2">
            {partner ? (
              <>
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white text-xs font-medium">
                    {partner.name?.charAt(0) || 'P'}
                  </span>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              </>
            ) : (
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-xs font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {renderCurrentTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex flex-col items-center justify-center h-14 w-16 rounded-lg transition-colors ${
                  isActive
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-500 active:bg-gray-100'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-pink-500' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-pink-500' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Bottom Safe Area */}
      <div className="h-safe-area-inset-bottom bg-white"></div>
    </div>
  );
}