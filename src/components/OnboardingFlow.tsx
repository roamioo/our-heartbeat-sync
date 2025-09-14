import React, { useState, useEffect } from 'react';
import { Heart, Eye, EyeOff, Check, X, Loader, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface OnboardingFlowProps {
  onAuthSuccess: (userData: any, sessionData: any) => void;
  onPartnerConnected: (partnerData: any) => void;
}

interface UsernameStatus {
  checking: boolean;
  available: boolean | null;
  message: string;
}

export default function OnboardingFlow({ onAuthSuccess, onPartnerConnected }: OnboardingFlowProps) {
  const [step, setStep] = useState<'welcome' | 'signup' | 'signin'>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    dateOfBirth: '',
    gender: '',
  });

  // Username validation
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({
    checking: false,
    available: null,
    message: ''
  });

  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
      }
    };
  }, [usernameCheckTimeout]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus({
        checking: false,
        available: null,
        message: ''
      });
      return;
    }

    setUsernameStatus({
      checking: true,
      available: null,
      message: 'Checking...'
    });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/auth/check-username/${username}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsernameStatus({
          checking: false,
          available: data.available,
          message: data.message
        });
      } else {
        setUsernameStatus({
          checking: false,
          available: false,
          message: 'Unable to check username'
        });
      }
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Network error'
      });
    }
  };

  const handleUsernameChange = (username: string) => {
    setFormData({ ...formData, username });
    
    // Clear previous timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    // Set new timeout for checking
    const timeout = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500); // Wait 500ms after user stops typing

    setUsernameCheckTimeout(timeout);
  };

  const handleSignUp = async () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (usernameStatus.available === false) {
      setError('Please choose an available username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        onAuthSuccess(data.user, data.session);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Starting sign in process for:', formData.email);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/auth/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      console.log('Server response status:', response.status);
      const data = await response.json();
      console.log('Server response data:', data);

      if (response.ok && data.session) {
        console.log('Setting session in Supabase client...');
        
        // Set the session in Supabase client
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        if (sessionError) {
          console.error('Session set error:', sessionError);
          setError('Failed to authenticate. Please try again.');
          return;
        }
        
        console.log('Session set successfully, calling onAuthSuccess');
        // Pass the session data to parent component
        onAuthSuccess(null, sessionData.session);
      } else {
        console.error('Sign in failed:', data);
        setError(data.error || 'Failed to sign in');
      }
    } catch (error) {
      console.error('Signin network error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderWelcome = () => (
    <div className="h-screen bg-gradient-to-b from-pink-400 via-purple-500 to-pink-600 flex flex-col">
      {/* Status Bar Simulation */}
      <div className="h-12 bg-black/10 flex items-center justify-center">
        <div className="text-white text-sm font-medium">9:41</div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Logo */}
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-8">
          <Heart className="w-12 h-12 text-white" />
        </div>
        
        {/* Title */}
        <h1 className="text-4xl font-medium text-white mb-4">LoveLink</h1>
        <p className="text-white/90 text-lg mb-12 leading-relaxed">
          Connect hearts, share moments,{'\n'}create memories together
        </p>
        
        {/* Buttons */}
        <div className="w-full space-y-4 max-w-sm">
          <Button
            onClick={() => setStep('signup')}
            className="w-full h-12 bg-white text-pink-600 hover:bg-white/90 font-medium rounded-full"
          >
            Create Account
          </Button>
          
          <Button
            onClick={() => setStep('signin')}
            variant="outline"
            className="w-full h-12 border-2 border-white text-white hover:bg-white/10 font-medium rounded-full"
          >
            Sign In
          </Button>
        </div>
      </div>
      
      {/* Bottom Safe Area */}
      <div className="h-8 bg-black/10"></div>
    </div>
  );

  const renderSignUp = () => (
    <div className="h-screen bg-white flex flex-col">
      {/* Status Bar */}
      <div className="h-12 bg-gradient-to-r from-pink-500 to-purple-500 flex items-center px-4">
        <button
          onClick={() => setStep('welcome')}
          className="text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-white font-medium">Create Account</span>
        </div>
        <div className="w-6" />
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Join LoveLink</h2>
            <p className="text-gray-600">Create your account to start connecting</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 border-gray-300 rounded-lg"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className={`h-12 pr-10 rounded-lg ${
                    usernameStatus.available === true
                      ? 'border-green-300 focus:border-green-500'
                      : usernameStatus.available === false
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                
                {/* Status Indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {usernameStatus.checking ? (
                    <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : usernameStatus.available === true ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : usernameStatus.available === false ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              
              {/* Status Message */}
              {usernameStatus.message && (
                <p className={`text-xs mt-1 ${
                  usernameStatus.available === true
                    ? 'text-green-600'
                    : usernameStatus.available === false
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}>
                  {usernameStatus.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 border-gray-300 rounded-lg"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 pr-10 border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="h-12 border-gray-300 rounded-lg"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-12 border border-gray-300 rounded-lg px-3 bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSignUp}
            disabled={loading || usernameStatus.available === false}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium rounded-full"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Sign In Link */}
          <div className="text-center pt-4">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setStep('signin')}
                className="text-pink-600 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Safe Area */}
      <div className="h-8 bg-gray-50"></div>
    </div>
  );

  const renderSignIn = () => (
    <div className="h-screen bg-white flex flex-col">
      {/* Status Bar */}
      <div className="h-12 bg-gradient-to-r from-pink-500 to-purple-500 flex items-center px-4">
        <button
          onClick={() => setStep('welcome')}
          className="text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-white font-medium">Sign In</span>
        </div>
        <div className="w-6" />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 pr-10 border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium rounded-full"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setStep('signup')}
                className="text-pink-600 font-medium"
              >
                Create Account
              </button>
            </p>
            
            {/* Test Helper - For Development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-xs mb-2 font-medium">Quick Test:</p>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      email: 'test@lovelink.demo',
                      password: 'testpass123'
                    });
                  }}
                  className="text-blue-600 text-xs underline"
                >
                  Fill Test Credentials
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Safe Area */}
      <div className="h-8 bg-gray-50"></div>
    </div>
  );

  switch (step) {
    case 'welcome':
      return renderWelcome();
    case 'signup':
      return renderSignUp();
    case 'signin':
      return renderSignIn();
    default:
      return renderWelcome();
  }
}