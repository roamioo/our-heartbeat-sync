import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Heart, MessageCircle, Calendar, User, Gift } from 'lucide-react';
import OnboardingFlow from './components/OnboardingFlow';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Timeline from './components/Timeline';
import Profile from './components/Profile';
import GiftStore from './components/GiftStore';
import { supabase } from './utils/supabase/client';
import './index.css';

type TabType = 'dashboard' | 'chat' | 'timeline' | 'gifts' | 'profile';

function App() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
          await loadPartner(session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSession(session);
        setUser(session.user);
        await loadPartner(session);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setPartner(null);
      }
    });

    // Listen for navigation events
    const handleNavigateToProfile = () => {
      setActiveTab('profile');
    };

    window.addEventListener('navigate-to-profile', handleNavigateToProfile);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('navigate-to-profile', handleNavigateToProfile);
    };
  }, []);

  const loadPartner = async (sessionData: any) => {
    // Partner loading logic would be implemented here
    // For now, partner will be set via the Dashboard component
  };

  const handleAuthSuccess = (userData: any, sessionData: any) => {
    setUser(userData || sessionData.user);
    setSession(sessionData);
  };

  const handlePartnerConnected = (partnerData: any) => {
    setPartner(partnerData);
  };

  const handleUpdateUser = (userData: any) => {
    setUser(userData);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            partner={partner} 
            session={session}
            onPartnerConnected={handlePartnerConnected}
          />
        );
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
            onPartnerConnected={handlePartnerConnected}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-rose-light to-purple-light">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Loading LoveLink...</p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return (
      <OnboardingFlow 
        onAuthSuccess={handleAuthSuccess}
        onPartnerConnected={handlePartnerConnected}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderActiveTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-card border-t border-border">
        <div className="flex items-center justify-around py-2 safe-area-bottom">
          {[
            { id: 'dashboard', icon: Heart, label: 'Home' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'timeline', icon: Calendar, label: 'Timeline' },
            { id: 'gifts', icon: Gift, label: 'Gifts' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 touch-feedback ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}