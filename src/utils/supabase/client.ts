// Mock Supabase client for development
import { projectId, publicAnonKey } from './info';

// Simple mock implementation
const createMockClient = () => {
  return {
    auth: {
      signUp: async (credentials: any) => ({ data: null, error: null }),
      signInWithPassword: async (credentials: any) => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async (jwt?: string) => ({ data: { user: null }, error: null }),
      setSession: async (session: any) => ({ data: { session: null }, error: null }),
      onAuthStateChange: (callback: any) => ({ 
        data: { subscription: { unsubscribe: () => {} } },
        unsubscribe: () => {}
      }),
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        data: [],
        error: null,
        limit: (count: number) => ({ data: [], error: null })
      }),
      insert: (values: any) => ({ data: null, error: null }),
      update: (values: any) => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  };
};

export const supabase = createMockClient();