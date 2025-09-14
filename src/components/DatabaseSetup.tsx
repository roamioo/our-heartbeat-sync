import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Loader, Copy, Play, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs } from './ui/tabs';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DatabaseSetupProps {
  session: any;
  onBack: () => void;
}

interface TableStatus {
  exists: boolean;
  hasData?: boolean;
  error?: string;
}

interface DatabaseStatus {
  connection: string;
  tables: Record<string, TableStatus>;
  utilityFunctions?: Record<string, string>;
  summary: {
    totalTables: number;
    existingTables: number;
    missingTables: number;
    coreTablesReady?: boolean;
    advancedTablesReady?: boolean;
  };
}

export default function DatabaseSetup({ session, onBack }: DatabaseSetupProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [setupMode, setSetupMode] = useState<'core' | 'full' | null>(null);
  const [setupResponse, setSetupResponse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    setLoading(true);
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
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        console.error('Failed to check database status');
      }
    } catch (error) {
      console.error('Error checking database:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async (mode: 'core' | 'full') => {
    setLoading(true);
    setSetupMode(mode);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/init-db`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSetupResponse(data);
        setActiveTab('setup');
      } else {
        console.error('Failed to initialize database');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (tableStatus: TableStatus) => {
    if (tableStatus.exists) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusIcon = (tableStatus: TableStatus) => {
    if (tableStatus.exists) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  const coreTables = ['users', 'user_settings', 'relationships', 'messages', 'mood_updates', 'timeline_events'];
  const advancedTables = ['period_tracking', 'location_updates', 'photo_albums', 'love_letters'];
  const commerceTables = ['gift_categories', 'gift_products', 'wishlists', 'gift_orders', 'spending_tracker'];
  const gamificationTables = ['streaks', 'challenges', 'relationship_challenges', 'achievements'];

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Status Bar */}
      <div className="h-12 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center px-4">
        <button onClick={onBack} className="text-white mr-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-white font-medium">Database Setup</span>
        </div>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">LoveLink Database Setup</h1>
          <p className="text-gray-600">Configure your comprehensive relationship database</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('status')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Database Status
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'setup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Setup Schema
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && status && (
          <div className="space-y-6">
            {/* Connection Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Connection Status</h3>
                <Badge variant={status.connection === 'connected' ? 'default' : 'destructive'}>
                  {status.connection}
                </Badge>
              </div>
              
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-semibold text-green-600">{status.summary.existingTables}</div>
                  <div className="text-sm text-gray-600">Tables Ready</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-semibold text-red-600">{status.summary.missingTables}</div>
                  <div className="text-sm text-gray-600">Tables Missing</div>
                </div>
              </div>

              {/* Feature Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`text-center p-3 rounded-lg ${
                  status.summary.coreTablesReady ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {status.summary.coreTablesReady ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  )}
                  <div className="text-sm font-medium">Core Features</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  status.summary.advancedTablesReady ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {status.summary.advancedTablesReady ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  )}
                  <div className="text-sm font-medium">Advanced Features</div>
                </div>
              </div>
            </Card>

            {/* Table Groups */}
            <div className="space-y-4">
              {/* Core Tables */}
              <Card className="p-4">
                <h4 className="font-medium mb-3 text-gray-900">Core Tables</h4>
                <div className="grid grid-cols-1 gap-2">
                  {coreTables.map(table => {
                    const tableStatus = status.tables[table];
                    return (
                      <div key={table} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tableStatus)}
                          <span className="text-sm font-medium">{table}</span>
                        </div>
                        <Badge variant={tableStatus?.exists ? 'default' : 'secondary'}>
                          {tableStatus?.exists ? 'Ready' : 'Missing'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Advanced Tables */}
              <Card className="p-4">
                <h4 className="font-medium mb-3 text-gray-900">Advanced Features</h4>
                <div className="grid grid-cols-1 gap-2">
                  {advancedTables.map(table => {
                    const tableStatus = status.tables[table];
                    return (
                      <div key={table} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tableStatus)}
                          <span className="text-sm font-medium">{table}</span>
                        </div>
                        <Badge variant={tableStatus?.exists ? 'default' : 'secondary'}>
                          {tableStatus?.exists ? 'Ready' : 'Missing'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Commerce Tables */}
              <Card className="p-4">
                <h4 className="font-medium mb-3 text-gray-900">Commerce & Gifting</h4>
                <div className="grid grid-cols-1 gap-2">
                  {commerceTables.map(table => {
                    const tableStatus = status.tables[table];
                    return (
                      <div key={table} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tableStatus)}
                          <span className="text-sm font-medium">{table}</span>
                        </div>
                        <Badge variant={tableStatus?.exists ? 'default' : 'secondary'}>
                          {tableStatus?.exists ? 'Ready' : 'Missing'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={checkDatabaseStatus}
                className="w-full h-12 rounded-full"
                disabled={loading}
              >
                {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                Refresh Status
              </Button>
              
              {!status.summary.coreTablesReady && (
                <Button
                  onClick={() => initializeDatabase('core')}
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-full"
                  disabled={loading}
                >
                  Initialize Core Tables
                </Button>
              )}
              
              {status.summary.coreTablesReady && !status.summary.advancedTablesReady && (
                <Button
                  onClick={() => initializeDatabase('full')}
                  className="w-full h-12 bg-purple-500 hover:bg-purple-600 rounded-full"
                  disabled={loading}
                >
                  Initialize All Features
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            {!setupResponse ? (
              <Card className="p-6 text-center">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Choose Setup Mode</h3>
                <p className="text-gray-600 mb-6">
                  Select which features you want to initialize in your database.
                </p>
                
                <div className="space-y-4">
                  <Button
                    onClick={() => initializeDatabase('core')}
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-full"
                    disabled={loading}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Core Features Only
                  </Button>
                  <p className="text-sm text-gray-500">
                    Users, relationships, messages, mood tracking, timeline
                  </p>
                  
                  <Button
                    onClick={() => initializeDatabase('full')}
                    className="w-full h-12 bg-purple-500 hover:bg-purple-600 rounded-full"
                    disabled={loading}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    All Features
                  </Button>
                  <p className="text-sm text-gray-500">
                    Everything including photos, gifts, challenges, AI insights
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Setup Instructions</h3>
                    <Badge variant="default">{setupResponse.mode} Mode</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {setupResponse.instructions?.map((instruction: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* SQL Schema */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Database Tables SQL</h4>
                    <Button
                      onClick={() => copyToClipboard(setupResponse.schema.tables)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{setupResponse.schema.tables}</pre>
                  </div>
                </Card>

                {/* RLS Policies */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Security Policies SQL</h4>
                    <Button
                      onClick={() => copyToClipboard(setupResponse.schema.rls_policies)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{setupResponse.schema.rls_policies}</pre>
                  </div>
                </Card>

                <Button
                  onClick={() => setSetupResponse(null)}
                  variant="outline"
                  className="w-full h-12 rounded-full"
                >
                  Back to Setup Options
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-8 bg-gray-50"></div>
    </div>
  );
}