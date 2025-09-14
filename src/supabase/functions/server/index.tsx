import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { registerTimelineEndpoints } from './timeline-endpoints.tsx';
import { initializeMemoryBucket, uploadMemoryImage, validateImageFile } from './memory-storage.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Global error handler to ensure JSON responses
app.onError((err, c) => {
  console.error('Global error handler:', err);
  return c.json({ 
    error: 'Internal server error: ' + err.message,
    stack: err.stack 
  }, 500);
});

// Handle 404s with JSON response
app.notFound((c) => {
  console.log('404 - Route not found:', c.req.path);
  return c.json({ 
    error: 'Route not found: ' + c.req.path,
    availableRoutes: [
      'GET /make-server-46bfb162/test/ping',
      'GET /make-server-46bfb162/user/profile',
      'POST /make-server-46bfb162/auth/signup',
      'POST /make-server-46bfb162/auth/signin',
      'GET /make-server-46bfb162/auth/check-username/:username',
      'POST /make-server-46bfb162/memories/upload-image',
      'GET /make-server-46bfb162/timeline/events',
      'POST /make-server-46bfb162/timeline/events',
      'POST /make-server-46bfb162/pairing/connect-dummy',
      'GET /make-server-46bfb162/messages',
      'POST /make-server-46bfb162/messages',
      'GET /make-server-46bfb162/gifts/categories',
      'GET /make-server-46bfb162/gifts/products',
      'POST /make-server-46bfb162/gifts/purchase'
    ]
  }, 404);
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize memory storage bucket on startup
initializeMemoryBucket().then(() => {
  console.log('Memory storage initialization completed');
}).catch((error) => {
  console.error('Failed to initialize memory storage:', error);
});

// Register timeline endpoints
registerTimelineEndpoints(app);

// =============================================
// MEMORY IMAGE UPLOAD ENDPOINT
// =============================================

app.post('/make-server-46bfb162/memories/upload-image', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('Memory image upload request from user:', user.id);
    
    // Parse multipart form data
    const formData = await c.req.formData();
    const imageFile = formData.get('image') as File;
    const memoryId = formData.get('memoryId') as string;
    
    if (!imageFile) {
      return c.json({ error: 'No image file provided' }, 400);
    }
    
    if (!memoryId) {
      return c.json({ error: 'Memory ID is required' }, 400);
    }
    
    // Validate the image file
    const validation = validateImageFile(imageFile);
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400);
    }
    
    console.log('Uploading image:', imageFile.name, 'size:', imageFile.size, 'type:', imageFile.type);
    
    // Convert file to ArrayBuffer
    const imageBuffer = await imageFile.arrayBuffer();
    
    // Upload to storage
    const uploadResult = await uploadMemoryImage(
      user.id,
      memoryId,
      imageBuffer,
      imageFile.name,
      imageFile.type
    );
    
    if (!uploadResult.success) {
      console.error('Image upload failed:', uploadResult.error);
      return c.json({ error: uploadResult.error }, 500);
    }
    
    console.log('Image uploaded successfully:', uploadResult.url);
    
    return c.json({
      success: true,
      url: uploadResult.url,
      path: uploadResult.path
    });
    
  } catch (error) {
    console.error('Memory image upload error:', error);
    return c.json({ error: 'Failed to upload image: ' + error.message }, 500);
  }
});

// =============================================
// USERNAME VALIDATION ROUTE
// =============================================

app.get('/make-server-46bfb162/auth/check-username/:username', async (c) => {
  try {
    const username = c.req.param('username');
    
    if (!username || username.length < 3) {
      return c.json({ 
        available: false, 
        message: 'Username must be at least 3 characters long' 
      });
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return c.json({ 
        available: false, 
        message: 'Username can only contain letters, numbers, and underscores' 
      });
    }
    
    // Check if username exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Username check error:', checkError);
      
      // If table doesn't exist, show available for now but log the issue
      if (checkError.code === '42P01') {
        console.log('Users table does not exist - treating username as available');
        return c.json({ 
          available: true,
          username,
          message: 'Username is available (database table not yet configured)'
        });
      }
      
      return c.json({ 
        available: false, 
        message: 'Unable to check username availability' 
      });
    }
    
    const available = !existingUser;
    
    return c.json({ 
      available,
      username,
      message: available ? 'Username is available' : 'Username is already taken'
    });
    
  } catch (error) {
    console.log('Check username error:', error);
    return c.json({ 
      available: false, 
      message: 'Internal server error checking username' 
    }, 500);
  }
});

// =============================================
// AUTHENTICATION ROUTES
// =============================================

app.post('/make-server-46bfb162/auth/signup', async (c) => {
  try {
    const { email, password, name, username, dateOfBirth, gender } = await c.req.json();
    console.log('Signup attempt for:', email, username);
    
    // Create user with Supabase Auth first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        username,
        date_of_birth: dateOfBirth,
        gender,
      },
      email_confirm: true,
    });
    
    if (authError) {
      console.log('Auth signup error:', authError);
      return c.json({ error: authError.message }, 400);
    }
    
    console.log('User created successfully:', authData.user.id);
    return c.json({ user: authData.user, session: authData.session });
    
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup: ' + error.message }, 500);
  }
});

app.post('/make-server-46bfb162/auth/signin', async (c) => {
  try {
    console.log('=== SIGNIN REQUEST START ===');
    
    const { email, password } = await c.req.json();
    console.log('Signin attempt for:', email);
    
    // Attempt Supabase auth
    console.log('Calling supabase.auth.signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.log('Supabase signin error:', error);
      return c.json({ 
        error: error.message,
        code: error.status || 400,
        supabaseError: true
      }, error.status || 400);
    }
    
    console.log('Signin successful for:', email);
    console.log('Session created:', data.session ? 'yes' : 'no');
    
    return c.json({ session: data.session });
    
  } catch (error) {
    console.log('Signin catch block error:', error);
    return c.json({ 
      error: 'Internal server error during signin: ' + error.message,
      code: 500,
      details: error.toString()
    }, 500);
  } finally {
    console.log('=== SIGNIN REQUEST END ===');
  }
});

// =============================================
// USER PROFILE ROUTES
// =============================================

app.get('/make-server-46bfb162/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    console.log('Profile request with token:', accessToken ? 'present' : 'missing');
    
    const { data: { user: authUser }, error } = await supabase.auth.getUser(accessToken);
    
    if (!authUser?.id || error) {
      console.log('Profile auth error:', error);
      return c.json({ error: 'Unauthorized: ' + (error?.message || 'Invalid token') }, 401);
    }
    
    console.log('Loading profile for user:', authUser.id);
    
    // Return minimal user data from auth
    const userData = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || 'User',
      username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
      date_of_birth: authUser.user_metadata?.date_of_birth,
      gender: authUser.user_metadata?.gender,
      is_verified: true,
    };
    
    return c.json({ user: userData, partner: null, relationship: null });
    
  } catch (error) {
    console.log('Get user profile error:', error);
    return c.json({ error: 'Internal server error retrieving profile: ' + error.message }, 500);
  }
});

// =============================================
// RELATIONSHIP & PAIRING ROUTES
// =============================================

app.post('/make-server-46bfb162/pairing/connect-dummy', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    console.log('Creating dummy partner connection for user:', user.id);
    
    // Create a dummy partner for testing
    const dummyPartner = {
      id: 'dummy-partner-id',
      name: 'Dummy Darling',
      username: 'dummydarling',
      email: 'dummy@lovelink.app',
      relationship_start_date: new Date().toISOString(),
      relationship_id: 'dummy-relationship-id'
    };
    
    console.log('Successfully created dummy relationship');
    return c.json({ 
      success: true,
      partner: dummyPartner,
      relationship: {
        id: 'dummy-relationship-id',
        started_at: new Date().toISOString()
      },
      relationship_start_date: new Date().toISOString()
    });
    
  } catch (error) {
    console.log('Connect dummy partner error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// =============================================
// CHAT/MESSAGING ROUTES
// =============================================

app.get('/make-server-46bfb162/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    console.log('Loading messages for user:', user.id);
    
    // Return empty messages array for now
    return c.json({ messages: [] });
    
  } catch (error) {
    console.log('Load messages error:', error);
    return c.json({ error: 'Failed to load messages: ' + error.message }, 500);
  }
});

app.post('/make-server-46bfb162/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { content, type, media_url, sticker_id } = await c.req.json();
    console.log('Sending message from user:', user.id, 'type:', type);
    
    // Create a mock message response
    const message = {
      id: crypto.randomUUID(),
      content: content,
      message_type: type || 'text',
      media_url: media_url,
      sticker_id: sticker_id,
      sender_id: user.id,
      sent_at: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name || 'You',
        username: user.username || 'user'
      }
    };
    
    console.log('Message sent successfully:', message.id);
    return c.json({ 
      message: message,
      success: true 
    });
    
  } catch (error) {
    console.log('Send message error:', error);
    return c.json({ error: 'Failed to send message: ' + error.message }, 500);
  }
});

// =============================================
// GIFT STORE ROUTES
// =============================================

app.get('/make-server-46bfb162/gifts/categories', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    console.log('Loading gift categories for user:', user.id);
    
    // Mock categories for demo
    const categories = [
      { id: 'cat-1', name: 'Luxury', description: 'Premium luxury gifts', icon_url: '', sort_order: 1, is_active: true },
      { id: 'cat-2', name: 'Jewelry', description: 'Beautiful jewelry pieces', icon_url: '', sort_order: 2, is_active: true },
      { id: 'cat-3', name: 'Flowers', description: 'Fresh flower arrangements', icon_url: '', sort_order: 3, is_active: true },
      { id: 'cat-4', name: 'Sweets', description: 'Delicious chocolates & treats', icon_url: '', sort_order: 4, is_active: true },
      { id: 'cat-5', name: 'Fragrance', description: 'Exquisite perfumes', icon_url: '', sort_order: 5, is_active: true },
    ];
    
    return c.json({ categories: categories });
    
  } catch (error) {
    console.log('Load gift categories error:', error);
    return c.json({ error: 'Failed to load categories: ' + error.message }, 500);
  }
});

app.get('/make-server-46bfb162/gifts/products', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    console.log('Loading gift products for user:', user.id);
    
    // Mock products for demo
    const products = [
      {
        id: 'gift-1',
        category_id: 'cat-1',
        name: 'Luxury Gift Box',
        description: 'Beautiful handcrafted gift box perfect for special occasions',
        price_cents: 2999,
        currency: 'INR',
        image_urls: ['https://images.unsplash.com/photo-1700142678566-601b048b39db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnaWZ0JTIwYm94fGVufDF8fHx8MTc1NzgwOTM4MHww&ixlib=rb-4.1.0&q=80&w=1080'],
        vendor: 'LuxeGifts',
        rating: 4.8,
        review_count: 124,
        is_active: true,
        category: { name: 'Luxury', icon_url: '' }
      },
      {
        id: 'gift-2',
        category_id: 'cat-2',
        name: 'Romantic Jewelry Set',
        description: 'Elegant necklace and earring set for your special someone',
        price_cents: 4999,
        currency: 'INR',
        image_urls: ['https://images.unsplash.com/photo-1707466982048-f06e0ced30cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwcm9tYW50aWMlMjBnaWZ0fGVufDF8fHx8MTc1NzgwOTM4NHww&ixlib=rb-4.1.0&q=80&w=1080'],
        vendor: 'JewelCraft',
        rating: 4.9,
        review_count: 89,
        is_active: true,
        category: { name: 'Jewelry', icon_url: '' }
      },
      {
        id: 'gift-3',
        category_id: 'cat-3',
        name: 'Pink Rose Bouquet',
        description: 'Fresh pink roses arranged in a beautiful bouquet',
        price_cents: 1599,
        currency: 'INR',
        image_urls: ['https://images.unsplash.com/photo-1707486142706-d2749b04459a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXJzJTIwYm91cXVldCUyMHBpbmt8ZW58MXx8fHwxNzU3ODA5Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080'],
        vendor: 'FlowerBoutique',
        rating: 4.7,
        review_count: 156,
        is_active: true,
        category: { name: 'Flowers', icon_url: '' }
      }
    ];
    
    return c.json({ products: products });
    
  } catch (error) {
    console.log('Load gift products error:', error);
    return c.json({ error: 'Failed to load products: ' + error.message }, 500);
  }
});

app.post('/make-server-46bfb162/gifts/purchase', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { productId, personalMessage } = await c.req.json();
    console.log('Processing gift purchase for user:', user.id, 'product:', productId);
    
    // Mock successful purchase
    const purchase = {
      id: crypto.randomUUID(),
      product_id: productId,
      buyer_id: user.id,
      personal_message: personalMessage,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    
    console.log('Gift purchase completed:', purchase.id);
    return c.json({ 
      purchase: purchase,
      success: true,
      message: 'Gift purchased successfully!'
    });
    
  } catch (error) {
    console.log('Gift purchase error:', error);
    return c.json({ error: 'Failed to purchase gift: ' + error.message }, 500);
  }
});

// =============================================
// TEST ROUTES
// =============================================

app.get('/make-server-46bfb162/test/ping', async (c) => {
  console.log('Ping test request received');
  const authHeader = c.req.header('Authorization');
  console.log('Authorization header:', authHeader ? 'present' : 'missing');
  
  return c.json({ 
    message: 'Server is working',
    authHeader: authHeader ? 'present' : 'missing',
    timestamp: new Date().toISOString()
  });
});

// Start the server
Deno.serve(app.fetch);