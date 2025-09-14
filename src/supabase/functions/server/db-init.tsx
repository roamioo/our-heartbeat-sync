import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

export async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Create users table
    const usersSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone_number VARCHAR(20),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255),
        name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(20),
        profile_image_url TEXT,
        bio TEXT,
        timezone VARCHAR(50) DEFAULT 'UTC',
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        subscription_tier VARCHAR(20) DEFAULT 'free',
        subscription_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create relationships table
    const relationshipsSQL = `
      CREATE TABLE IF NOT EXISTS relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active',
        relationship_type VARCHAR(20) DEFAULT 'romantic',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        end_reason VARCHAR(50),
        invite_code VARCHAR(20) UNIQUE,
        invite_expires_at TIMESTAMP,
        first_love_letter_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT no_self_relationship CHECK (user1_id != user2_id)
      );
    `;
    
    // Create messages table
    const messagesSQL = `
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message_type VARCHAR(20) DEFAULT 'text',
        content TEXT,
        media_url TEXT,
        media_type VARCHAR(50),
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        location_name VARCHAR(255),
        sticker_id VARCHAR(50),
        reply_to_message_id UUID REFERENCES messages(id),
        is_encrypted BOOLEAN DEFAULT FALSE,
        is_secret_vault BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivered_at TIMESTAMP,
        read_at TIMESTAMP,
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `;
    
    // Create mood_updates table
    const moodUpdatesSQL = `
      CREATE TABLE IF NOT EXISTS mood_updates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
        mood_emoji VARCHAR(10) NOT NULL,
        mood_scale INTEGER CHECK (mood_scale >= 1 AND mood_scale <= 10),
        mood_text VARCHAR(500),
        activity_status VARCHAR(100),
        selfie_url TEXT,
        is_visible_to_partner BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date DATE DEFAULT CURRENT_DATE
      );
    `;
    
    // Create timeline_events table
    const timelineEventsSQL = `
      CREATE TABLE IF NOT EXISTS timeline_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        created_by_user_id UUID REFERENCES users(id),
        media_urls TEXT[],
        location_name VARCHAR(255),
        is_milestone BOOLEAN DEFAULT FALSE,
        milestone_type VARCHAR(50),
        is_auto_generated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Execute SQL commands
    const tables = [
      { name: 'users', sql: usersSQL },
      { name: 'relationships', sql: relationshipsSQL },
      { name: 'messages', sql: messagesSQL },
      { name: 'mood_updates', sql: moodUpdatesSQL },
      { name: 'timeline_events', sql: timelineEventsSQL },
    ];
    
    for (const table of tables) {
      try {
        console.log(`Creating table: ${table.name}`);
        const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
        if (error) {
          console.log(`Error creating ${table.name}:`, error);
        } else {
          console.log(`✓ Table ${table.name} ready`);
        }
      } catch (e) {
        console.log(`Error with table ${table.name}:`, e);
      }
    }
    
    console.log('Database initialization complete');
    return true;
    
  } catch (error) {
    console.log('Database initialization error:', error);
    return false;
  }
}