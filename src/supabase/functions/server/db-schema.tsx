// =============================================
// LOVELINK DATABASE SCHEMA & RLS POLICIES
// Complete schema for relationship super app
// =============================================

export const CORE_SCHEMA_SQL = `
-- =============================================
-- CORE TABLES (Phase 1)
-- =============================================

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_picture_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period_tracking_enabled BOOLEAN DEFAULT FALSE,
    location_sharing_enabled BOOLEAN DEFAULT FALSE,
    mood_sharing_enabled BOOLEAN DEFAULT TRUE,
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    privacy_mode BOOLEAN DEFAULT FALSE,
    theme_preference VARCHAR(20) DEFAULT 'system',
    language_preference VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Relationships table (enhanced)
CREATE TABLE IF NOT EXISTS relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'blocked')),
    invite_code VARCHAR(20) UNIQUE,
    invite_expires_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    end_reason VARCHAR(50),
    anniversary_date DATE,
    relationship_type VARCHAR(20) DEFAULT 'romantic',
    is_long_distance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (user1_id != user2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice', 'video', 'sticker', 'location', 'gift')),
    content TEXT,
    media_url TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name VARCHAR(255),
    sticker_id VARCHAR(50),
    is_secret_vault BOOLEAN DEFAULT FALSE,
    reply_to_message_id UUID REFERENCES messages(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood updates table
CREATE TABLE IF NOT EXISTS mood_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relationship_id UUID REFERENCES relationships(id) ON DELETE SET NULL,
    mood_emoji VARCHAR(10) NOT NULL,
    mood_scale INTEGER CHECK (mood_scale >= 1 AND mood_scale <= 10),
    mood_text TEXT,
    activity_status VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name VARCHAR(255),
    is_visible_to_partner BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline events table
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    media_urls TEXT[], -- Array of media URLs
    location_name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    is_milestone BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    metadata JSONB, -- For extensible event data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

export const ADVANCED_FEATURES_SQL = `
-- =============================================
-- ADVANCED FEATURES (Phase 2)
-- =============================================

-- Period tracking
CREATE TABLE IF NOT EXISTS period_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relationship_id UUID REFERENCES relationships(id) ON DELETE SET NULL,
    cycle_start_date DATE NOT NULL,
    cycle_length INTEGER DEFAULT 28,
    period_length INTEGER DEFAULT 5,
    symptoms TEXT[],
    mood_notes TEXT,
    flow_intensity VARCHAR(20) CHECK (flow_intensity IN ('light', 'medium', 'heavy')),
    is_predicted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location updates
CREATE TABLE IF NOT EXISTS location_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relationship_id UUID REFERENCES relationships(id) ON DELETE SET NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    location_name VARCHAR(255),
    location_type VARCHAR(50), -- 'home', 'work', 'date', 'travel', etc.
    is_check_in BOOLEAN DEFAULT FALSE,
    is_live_location BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo albums
CREATE TABLE IF NOT EXISTS photo_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_photo_url TEXT,
    is_collaborative BOOLEAN DEFAULT TRUE,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Album photos
CREATE TABLE IF NOT EXISTS album_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES photo_albums(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    photo_url TEXT NOT NULL,
    caption TEXT,
    taken_at TIMESTAMP WITH TIME ZONE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Love letters
CREATE TABLE IF NOT EXISTS love_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    letter_type VARCHAR(20) DEFAULT 'letter' CHECK (letter_type IN ('letter', 'poem', 'note', 'promise')),
    delivery_date TIMESTAMP WITH TIME ZONE,
    is_delivered BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    background_theme VARCHAR(50),
    font_style VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

export const GIFTING_COMMERCE_SQL = `
-- =============================================
-- GIFTING & COMMERCE (Phase 3)
-- =============================================

-- Gift categories
CREATE TABLE IF NOT EXISTS gift_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift products
CREATE TABLE IF NOT EXISTS gift_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES gift_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    image_urls TEXT[],
    vendor_name VARCHAR(255),
    vendor_url TEXT,
    availability_status VARCHAR(20) DEFAULT 'available',
    tags TEXT[],
    metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relationship_id UUID REFERENCES relationships(id) ON DELETE SET NULL,
    product_id UUID REFERENCES gift_products(id) ON DELETE CASCADE,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
    notes TEXT,
    is_surprise BOOLEAN DEFAULT FALSE, -- Hidden from partner
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift orders
CREATE TABLE IF NOT EXISTS gift_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES gift_products(id),
    order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    delivery_address TEXT,
    delivery_date DATE,
    special_message TEXT,
    tracking_number VARCHAR(255),
    external_order_id VARCHAR(255), -- For third-party vendors
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spending tracker
CREATE TABLE IF NOT EXISTS spending_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    spender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    date DATE NOT NULL,
    is_gift BOOLEAN DEFAULT FALSE,
    recipient_id UUID REFERENCES users(id),
    receipt_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

export const GAMIFICATION_SQL = `
-- =============================================
-- GAMIFICATION & CHALLENGES (Phase 4)
-- =============================================

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    streak_type VARCHAR(50) NOT NULL,
    current_count INTEGER DEFAULT 0,
    best_count INTEGER DEFAULT 0,
    last_activity_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(relationship_id, streak_type)
);

-- Challenges (templates)
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    duration_days INTEGER,
    points_reward INTEGER DEFAULT 0,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge questions
CREATE TABLE IF NOT EXISTS challenge_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'open' CHECK (question_type IN ('open', 'multiple_choice', 'rating', 'yes_no')),
    options TEXT[], -- For multiple choice
    sort_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE
);

-- Relationship challenges (instances)
CREATE TABLE IF NOT EXISTS relationship_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0,
    metadata JSONB
);

-- Challenge responses
CREATE TABLE IF NOT EXISTS challenge_responses (  
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_challenge_id UUID REFERENCES relationship_challenges(id) ON DELETE CASCADE,
    question_id UUID REFERENCES challenge_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    response_text TEXT,
    response_data JSONB, -- For structured responses
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    points_earned INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);
`;

export const AI_INSIGHTS_SQL = `
-- =============================================
-- AI INSIGHTS & ANALYTICS (Phase 5)
-- =============================================

-- Couple insights
CREATE TABLE IF NOT EXISTS couple_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    insight_data JSONB,
    priority_level INTEGER DEFAULT 3,
    is_read BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI suggestions
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id), -- NULL means for both
    suggestion_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    action_data JSONB, -- Structured action data
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    is_dismissed BOOLEAN DEFAULT FALSE,
    acted_upon_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationship reports
CREATE TABLE IF NOT EXISTS relationship_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    report_data JSONB NOT NULL,
    insights TEXT[],
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness data
CREATE TABLE IF NOT EXISTS wellness_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL, -- 'sleep', 'exercise', 'meditation', etc.
    value DECIMAL(10, 2),
    unit VARCHAR(20),
    date DATE NOT NULL,
    source VARCHAR(50), -- 'manual', 'apple_health', 'google_fit', etc.
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, data_type, date, source)
);
`;

export const SYSTEM_TABLES_SQL = `
-- =============================================
-- SYSTEM & NOTIFICATIONS (Phase 6)
-- =============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breakup archives
CREATE TABLE IF NOT EXISTS breakup_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relationship_id UUID REFERENCES relationships(id),
    archive_type VARCHAR(20) DEFAULT 'full' CHECK (archive_type IN ('full', 'messages_only', 'photos_only', 'minimal')),
    access_pin_hash VARCHAR(255),
    cooldown_expires_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    archived_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Closure activities
CREATE TABLE IF NOT EXISTS closure_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completion_data JSONB,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App analytics
CREATE TABLE IF NOT EXISTS app_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationship history (for transparency)
CREATE TABLE IF NOT EXISTS relationship_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relationship_count INTEGER DEFAULT 0,
    average_relationship_duration INTERVAL,
    longest_relationship_duration INTERVAL,
    total_relationships_ended INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT FALSE, -- User controls visibility to future partners
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
`;

export const UTILITY_FUNCTIONS_SQL = `
-- =============================================
-- UTILITY FUNCTIONS FOR RLS
-- =============================================

-- Function to get current authenticated user ID
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
BEGIN
    -- Get user ID from JWT claims
    RETURN COALESCE(
        (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid,
        (current_setting('app.current_user_id', true))::uuid
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in an active relationship with another user
CREATE OR REPLACE FUNCTION is_partner_with(user1_id UUID, user2_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM relationships 
        WHERE status = 'active' 
        AND ((user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active relationship ID
CREATE OR REPLACE FUNCTION get_user_active_relationship(user_id UUID) RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM relationships 
        WHERE status = 'active' 
        AND (user1_id = user_id OR user2_id = user_id)
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(
        (current_setting('request.jwt.claims', true)::json ->> 'app_metadata')::json ->> 'role' = 'admin',
        current_setting('app.user_role', true) = 'admin',
        FALSE
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely end a relationship
CREATE OR REPLACE FUNCTION end_relationship_safely(
    relationship_id UUID,
    end_reason VARCHAR(50) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_uid UUID;
BEGIN
    current_uid := current_user_id();
    
    -- Check if user is part of this relationship
    IF NOT EXISTS (
        SELECT 1 FROM relationships 
        WHERE id = relationship_id 
        AND status = 'active'
        AND (user1_id = current_uid OR user2_id = current_uid)
    ) THEN
        RAISE EXCEPTION 'Unauthorized access to relationship';
    END IF;
    
    -- Update relationship status
    UPDATE relationships 
    SET status = 'ended', 
        ended_at = NOW(),
        end_reason = COALESCE(end_reason, 'user_initiated')
    WHERE id = relationship_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user's last active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active() RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET last_active_at = NOW() WHERE id = current_user_id();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating last active time
CREATE OR REPLACE FUNCTION create_activity_triggers() RETURNS VOID AS $$
BEGIN
    -- Drop existing triggers
    DROP TRIGGER IF EXISTS update_last_active_messages ON messages;
    DROP TRIGGER IF EXISTS update_last_active_mood ON mood_updates;
    
    -- Create new triggers  
    CREATE TRIGGER update_last_active_messages
        AFTER INSERT ON messages
        FOR EACH ROW EXECUTE FUNCTION update_user_last_active();
        
    CREATE TRIGGER update_last_active_mood
        AFTER INSERT ON mood_updates
        FOR EACH ROW EXECUTE FUNCTION update_user_last_active();
END;
$$ LANGUAGE plpgsql;
`;

export const INDEXES_SQL = `
-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Core relationship indexes
CREATE INDEX IF NOT EXISTS idx_relationships_active_users 
    ON relationships(user1_id, user2_id, status) 
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_relationships_invite_code 
    ON relationships(invite_code) 
    WHERE invite_code IS NOT NULL;

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_messages_relationship_time 
    ON messages(relationship_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender 
    ON messages(sender_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread 
    ON messages(relationship_id, read_at) 
    WHERE read_at IS NULL;

-- Mood updates indexes
CREATE INDEX IF NOT EXISTS idx_mood_updates_user_time 
    ON mood_updates(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mood_updates_relationship 
    ON mood_updates(relationship_id, created_at DESC) 
    WHERE is_visible_to_partner = TRUE;

-- Timeline events indexes
CREATE INDEX IF NOT EXISTS idx_timeline_events_relationship 
    ON timeline_events(relationship_id, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_events_milestones 
    ON timeline_events(relationship_id, is_milestone) 
    WHERE is_milestone = TRUE;

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_username 
    ON users(username) 
    WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_last_active 
    ON users(last_active_at DESC);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON notifications(user_id, scheduled_at DESC) 
    WHERE is_read = FALSE;

-- Gift and commerce indexes
CREATE INDEX IF NOT EXISTS idx_gift_orders_relationship 
    ON gift_orders(relationship_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spending_tracker_relationship 
    ON spending_tracker(relationship_id, date DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_app_analytics_user_time 
    ON app_analytics(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_analytics_event_type 
    ON app_analytics(event_type, created_at DESC);
`;

export const getAllSchemaSql = () => {
  return [
    UTILITY_FUNCTIONS_SQL,
    CORE_SCHEMA_SQL,
    ADVANCED_FEATURES_SQL,
    GIFTING_COMMERCE_SQL,
    GAMIFICATION_SQL,
    AI_INSIGHTS_SQL,
    SYSTEM_TABLES_SQL,
    INDEXES_SQL
  ].join('\n\n');
};

export const getBasicSchemaSql = () => {
  return [
    UTILITY_FUNCTIONS_SQL,
    CORE_SCHEMA_SQL,
    INDEXES_SQL.split('-- Core relationship indexes')[1].split('-- Message indexes')[0] + 
    INDEXES_SQL.split('-- Message indexes')[1].split('-- Mood updates indexes')[0] +
    INDEXES_SQL.split('-- User indexes')[1].split('-- Notification indexes')[0]
  ].join('\n\n');
};