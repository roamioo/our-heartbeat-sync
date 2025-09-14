import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, Database, Server, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

interface DebugInfoProps {
  session: any;
  user: any;
  profileError: string;
}

export default function DebugInfo({ session, user, profileError }: DebugInfoProps) {
  const [expanded, setExpanded] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      supabaseConnection: 'unknown',
      serverConnection: 'unknown',
      serverPing: 'unknown',
      serverEcho: 'unknown',
      databaseTables: 'unknown',
      authState: 'unknown',
      profileLoad: 'unknown',
    };

    try {
      // Test Supabase connection
      const { error: supabaseError } = await supabase.from('users').select('*').limit(0);
      results.supabaseConnection = supabaseError ? `Error: ${supabaseError.message}` : 'Connected';
    } catch (e) {
      results.supabaseConnection = `Exception: ${e.message}`;
    }

    try {
      // Test basic server ping
      const pingResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/test/ping`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (pingResponse.ok) {
        const pingData = await pingResponse.json();
        results.serverPing = 'Connected';
      } else {
        results.serverPing = `HTTP ${pingResponse.status}`;
      }
    } catch (e) {
      results.serverPing = `Exception: ${e.message}`;
    }

    try {
      // Test echo endpoint with JSON body
      const echoResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/test/echo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ test: 'data' }),
        }
      );
      
      if (echoResponse.ok) {
        const echoData = await echoResponse.json();
        results.serverEcho = 'Connected';
      } else {
        results.serverEcho = `HTTP ${echoResponse.status}`;
      }
    } catch (e) {
      results.serverEcho = `Exception: ${e.message}`;
    }

    try {
      // Test server connection with tables endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/debug/tables`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        results.serverConnection = 'Connected';
        results.databaseTables = `${data.summary.existingTables}/${data.summary.totalTables} tables exist`;
      } else {
        results.serverConnection = `HTTP ${response.status}`;
      }
    } catch (e) {
      results.serverConnection = `Exception: ${e.message}`;
    }

    // Test auth state
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        results.authState = `Error: ${error.message}`;
      } else if (currentSession) {
        results.authState = `Active session for ${currentSession.user?.email}`;
      } else {
        results.authState = 'No active session';
      }
    } catch (e) {
      results.authState = `Exception: ${e.message}`;
    }

    // Test profile load
    if (session?.access_token) {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/user/profile`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.ok) {
          results.profileLoad = 'Success';
        } else {
          const errorText = await response.text();
          results.profileLoad = `HTTP ${response.status}: ${errorText.slice(0, 100)}`;
        }
      } catch (e) {
        results.profileLoad = `Exception: ${e.message}`;
      }
    } else {
      results.profileLoad = 'No access token';
    }

    setTestResults(results);
    setTesting(false);
  };

  const testSignin = async () => {
    setTesting(true);
    console.log('=== DEBUG SIGNIN TEST ===');
    
    try {
      console.log('Testing signin endpoint with dummy credentials...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/auth/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'testpassword123',
          }),
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      try {
        const responseData = JSON.parse(responseText);
        console.log('Response data:', responseData);
        
        if (response.status === 401) {
          alert(`Signin test: Got 401 Unauthorized. Response: ${JSON.stringify(responseData, null, 2)}`);
        } else {
          alert(`Signin test: Status ${response.status}. Check console for details.`);
        }
      } catch (parseError) {
        console.log('Failed to parse response as JSON:', parseError);
        alert(`Signin test: Status ${response.status}. Raw response: ${responseText.slice(0, 200)}`);
      }
      
    } catch (error) {
      console.error('Signin test error:', error);
      alert(`Signin test failed: ${error.message}`);
    }
    
    console.log('=== DEBUG SIGNIN TEST END ===');
    setTesting(false);
  };

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setExpanded(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-gray-200 hover:bg-gray-50"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="p-4 bg-white shadow-xl border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            <span className="text-sm font-medium">Debug Info</span>
          </div>
          <Button
            onClick={() => setExpanded(false)}
            variant="ghost"
            size="sm"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Session:</span>
              <div className="font-mono text-green-600">
                {session ? '✓ Active' : '✗ None'}
              </div>
            </div>
            <div>
              <span className="text-gray-500">User:</span>
              <div className="font-mono text-green-600">
                {user ? '✓ Loaded' : '✗ None'}
              </div>
            </div>
          </div>

          {profileError && (
            <div>
              <span className="text-gray-500">Error:</span>
              <div className="font-mono text-red-600 text-xs break-words">
                {profileError.slice(0, 100)}...
              </div>
            </div>
          )}

          {session && (
            <div>
              <span className="text-gray-500">Email:</span>
              <div className="font-mono text-blue-600">
                {session.user?.email || 'Unknown'}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Button
            onClick={runDiagnostics}
            disabled={testing}
            className="w-full h-8 text-xs"
            size="sm"
          >
            {testing ? 'Testing...' : 'Run Diagnostics'}
          </Button>
          
          <Button
            onClick={testSignin}
            disabled={testing}
            className="w-full h-8 text-xs bg-purple-500 hover:bg-purple-600"
            size="sm"
          >
            Test Signin Endpoint
          </Button>
        </div>

        {testResults && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Supabase:</span>
                <span className={testResults.supabaseConnection.includes('Connected') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.supabaseConnection.slice(0, 20)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ping:</span>
                <span className={testResults.serverPing.includes('Connected') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.serverPing}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Echo:</span>
                <span className={testResults.serverEcho.includes('Connected') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.serverEcho}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Server:</span>
                <span className={testResults.serverConnection.includes('Connected') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.serverConnection}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tables:</span>
                <span className="text-blue-600">
                  {testResults.databaseTables}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Auth:</span>
                <span className={testResults.authState.includes('Active') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.authState.slice(0, 20)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Profile:</span>
                <span className={testResults.profileLoad === 'Success' ? 'text-green-600' : 'text-red-600'}>
                  {testResults.profileLoad.slice(0, 20)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}