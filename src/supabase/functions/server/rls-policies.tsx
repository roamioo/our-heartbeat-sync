// =============================================
// ROW LEVEL SECURITY POLICIES
// Complete RLS implementation for LoveLink
// =============================================

export const CORE_RLS_POLICIES = `
-- =============================================
-- CORE USER MANAGEMENT POLICIES
-- =============================================

-- Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
    FOR SELECT
    USING (id = current_user_id());

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
    FOR UPDATE
    USING (id = current_user_id())
    WITH CHECK (id = current_user_id());

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users
    FOR INSERT
    WITH CHECK (id = current_user_id());

-- Allow partners to see basic profile info
DROP POLICY IF EXISTS "users_select_partner_basic" ON users;
CREATE POLICY "users_select_partner_basic" ON users
    FOR SELECT
    USING (
        id IN (
            SELECT CASE 
                WHEN user1_id = current_user_id() THEN user2_id
                WHEN user2_id = current_user_id() THEN user1_id
            END
            FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

-- User settings - only own settings
DROP POLICY IF EXISTS "user_settings_own_only" ON user_settings;
CREATE POLICY "user_settings_own_only" ON user_settings
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

-- =============================================
-- RELATIONSHIP MANAGEMENT POLICIES
-- =============================================

-- Relationships - users can see their own relationships
DROP POLICY IF EXISTS "relationships_participants_only" ON relationships;
CREATE POLICY "relationships_participants_only" ON relationships
    FOR SELECT
    USING (user1_id = current_user_id() OR user2_id = current_user_id());

DROP POLICY IF EXISTS "relationships_update_participants" ON relationships;
CREATE POLICY "relationships_update_participants" ON relationships
    FOR UPDATE
    USING (user1_id = current_user_id() OR user2_id = current_user_id())
    WITH CHECK (user1_id = current_user_id() OR user2_id = current_user_id());

DROP POLICY IF EXISTS "relationships_insert_own" ON relationships;
CREATE POLICY "relationships_insert_own" ON relationships
    FOR INSERT
    WITH CHECK (user1_id = current_user_id() OR user2_id = current_user_id());

-- =============================================
-- COMMUNICATION POLICIES
-- =============================================

-- Messages - both partners can access, only sender can edit/delete
DROP POLICY IF EXISTS "messages_relationship_access" ON messages;
CREATE POLICY "messages_relationship_access" ON messages
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
        -- Secret vault messages only visible to sender unless shared
        AND (
            is_secret_vault = FALSE 
            OR sender_id = current_user_id()
        )
    );

DROP POLICY IF EXISTS "messages_sender_insert" ON messages;
CREATE POLICY "messages_sender_insert" ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = current_user_id()
        AND relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "messages_sender_update" ON messages;
CREATE POLICY "messages_sender_update" ON messages
    FOR UPDATE
    USING (sender_id = current_user_id())
    WITH CHECK (sender_id = current_user_id());

DROP POLICY IF EXISTS "messages_sender_delete" ON messages;
CREATE POLICY "messages_sender_delete" ON messages
    FOR DELETE
    USING (sender_id = current_user_id());

-- =============================================
-- MOOD & ACTIVITY POLICIES
-- =============================================

-- Mood updates - own data + partner's shared data
DROP POLICY IF EXISTS "mood_updates_own" ON mood_updates;
CREATE POLICY "mood_updates_own" ON mood_updates
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

DROP POLICY IF EXISTS "mood_updates_partner_visible" ON mood_updates;
CREATE POLICY "mood_updates_partner_visible" ON mood_updates
    FOR SELECT
    USING (
        is_visible_to_partner = TRUE
        AND relationship_id = get_user_active_relationship(current_user_id())
        AND user_id != current_user_id()
    );

-- =============================================
-- TIMELINE & MEMORIES POLICIES
-- =============================================

-- Timeline events - both partners can view/create
DROP POLICY IF EXISTS "timeline_events_relationship_access" ON timeline_events;
CREATE POLICY "timeline_events_relationship_access" ON timeline_events
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
        AND (is_private = FALSE OR created_by_user_id = current_user_id())
    );

DROP POLICY IF EXISTS "timeline_events_partner_create" ON timeline_events;
CREATE POLICY "timeline_events_partner_create" ON timeline_events
    FOR INSERT
    WITH CHECK (
        (created_by_user_id = current_user_id() OR created_by_user_id IS NULL)
        AND relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "timeline_events_creator_edit" ON timeline_events;
CREATE POLICY "timeline_events_creator_edit" ON timeline_events
    FOR UPDATE
    USING (created_by_user_id = current_user_id())
    WITH CHECK (created_by_user_id = current_user_id());

DROP POLICY IF EXISTS "timeline_events_creator_delete" ON timeline_events;  
CREATE POLICY "timeline_events_creator_delete" ON timeline_events
    FOR DELETE
    USING (created_by_user_id = current_user_id());
`;

export const ADVANCED_RLS_POLICIES = `
-- =============================================
-- ADVANCED FEATURES POLICIES
-- =============================================

-- Enable RLS on advanced tables
ALTER TABLE period_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_letters ENABLE ROW LEVEL SECURITY;

-- Period tracking - own data + partner visibility if enabled
DROP POLICY IF EXISTS "period_tracking_own" ON period_tracking;
CREATE POLICY "period_tracking_own" ON period_tracking
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

DROP POLICY IF EXISTS "period_tracking_partner_view" ON period_tracking;
CREATE POLICY "period_tracking_partner_view" ON period_tracking
    FOR SELECT
    USING (
        relationship_id = get_user_active_relationship(current_user_id())
        AND user_id != current_user_id()
        AND EXISTS (
            SELECT 1 FROM user_settings 
            WHERE user_id = period_tracking.user_id 
            AND period_tracking_enabled = TRUE
        )
    );

-- Location updates - own data + partner's shared data  
DROP POLICY IF EXISTS "location_updates_own" ON location_updates;
CREATE POLICY "location_updates_own" ON location_updates
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

DROP POLICY IF EXISTS "location_updates_partner_shared" ON location_updates;
CREATE POLICY "location_updates_partner_shared" ON location_updates
    FOR SELECT
    USING (
        relationship_id = get_user_active_relationship(current_user_id())
        AND user_id != current_user_id()
        AND (is_check_in = TRUE OR is_live_location = TRUE)
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- Photo albums - both partners can access
DROP POLICY IF EXISTS "photo_albums_relationship_access" ON photo_albums;
CREATE POLICY "photo_albums_relationship_access" ON photo_albums
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
        AND (is_private = FALSE OR created_by_user_id = current_user_id())
    );

DROP POLICY IF EXISTS "photo_albums_create" ON photo_albums;
CREATE POLICY "photo_albums_create" ON photo_albums
    FOR INSERT
    WITH CHECK (
        created_by_user_id = current_user_id()
        AND relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "photo_albums_creator_edit" ON photo_albums;
CREATE POLICY "photo_albums_creator_edit" ON photo_albums
    FOR UPDATE
    USING (created_by_user_id = current_user_id())
    WITH CHECK (created_by_user_id = current_user_id());

-- Album photos - both partners can add/view
DROP POLICY IF EXISTS "album_photos_relationship_access" ON album_photos;
CREATE POLICY "album_photos_relationship_access" ON album_photos
    FOR SELECT
    USING (
        album_id IN (
            SELECT pa.id FROM photo_albums pa
            JOIN relationships r ON pa.relationship_id = r.id
            WHERE r.status = 'active'
            AND (r.user1_id = current_user_id() OR r.user2_id = current_user_id())
            AND (pa.is_private = FALSE OR pa.created_by_user_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "album_photos_partner_insert" ON album_photos;
CREATE POLICY "album_photos_partner_insert" ON album_photos
    FOR INSERT
    WITH CHECK (
        uploaded_by_user_id = current_user_id()
        AND album_id IN (
            SELECT pa.id FROM photo_albums pa
            JOIN relationships r ON pa.relationship_id = r.id
            WHERE r.status = 'active'
            AND (r.user1_id = current_user_id() OR r.user2_id = current_user_id())
            AND (pa.is_collaborative = TRUE OR pa.created_by_user_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "album_photos_uploader_edit" ON album_photos;
CREATE POLICY "album_photos_uploader_edit" ON album_photos
    FOR UPDATE
    USING (uploaded_by_user_id = current_user_id())
    WITH CHECK (uploaded_by_user_id = current_user_id());

-- Love letters - both partners can read, only sender can edit
DROP POLICY IF EXISTS "love_letters_relationship_access" ON love_letters;
CREATE POLICY "love_letters_relationship_access" ON love_letters
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
        AND (is_delivered = TRUE OR sender_id = current_user_id())
    );

DROP POLICY IF EXISTS "love_letters_sender_edit" ON love_letters;
CREATE POLICY "love_letters_sender_edit" ON love_letters
    FOR UPDATE
    USING (sender_id = current_user_id())
    WITH CHECK (sender_id = current_user_id());

DROP POLICY IF EXISTS "love_letters_sender_insert" ON love_letters;
CREATE POLICY "love_letters_sender_insert" ON love_letters
    FOR INSERT
    WITH CHECK (
        sender_id = current_user_id()
        AND relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );
`;

export const COMMERCE_RLS_POLICIES = `
-- =============================================
-- GIFTING & COMMERCE POLICIES
-- =============================================

-- Enable RLS on commerce tables
ALTER TABLE gift_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_tracker ENABLE ROW LEVEL SECURITY;

-- Gift categories and products - public read access
DROP POLICY IF EXISTS "gift_categories_public_read" ON gift_categories;
CREATE POLICY "gift_categories_public_read" ON gift_categories
    FOR SELECT
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "gift_products_public_read" ON gift_products;
CREATE POLICY "gift_products_public_read" ON gift_products
    FOR SELECT
    USING (is_active = TRUE);

-- Wishlists - own wishlist + partner can view
DROP POLICY IF EXISTS "wishlists_own" ON wishlists;
CREATE POLICY "wishlists_own" ON wishlists
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

DROP POLICY IF EXISTS "wishlists_partner_view" ON wishlists;
CREATE POLICY "wishlists_partner_view" ON wishlists
    FOR SELECT
    USING (
        relationship_id = get_user_active_relationship(current_user_id())
        AND user_id != current_user_id()
        AND is_surprise = FALSE
    );

-- Gift orders - both partners can view their relationship orders
DROP POLICY IF EXISTS "gift_orders_relationship_access" ON gift_orders;
CREATE POLICY "gift_orders_relationship_access" ON gift_orders
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "gift_orders_sender_create" ON gift_orders;
CREATE POLICY "gift_orders_sender_create" ON gift_orders
    FOR INSERT
    WITH CHECK (
        sender_id = current_user_id()
        AND relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "gift_orders_sender_update" ON gift_orders;
CREATE POLICY "gift_orders_sender_update" ON gift_orders
    FOR UPDATE
    USING (sender_id = current_user_id())
    WITH CHECK (sender_id = current_user_id());

-- Spending tracker - both partners can view/add
DROP POLICY IF EXISTS "spending_tracker_relationship_access" ON spending_tracker;
CREATE POLICY "spending_tracker_relationship_access" ON spending_tracker
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "spending_tracker_spender_create" ON spending_tracker;
CREATE POLICY "spending_tracker_spender_create" ON spending_tracker
    FOR INSERT
    WITH CHECK (
        spender_id = current_user_id()
        AND relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "spending_tracker_spender_edit" ON spending_tracker;
CREATE POLICY "spending_tracker_spender_edit" ON spending_tracker
    FOR UPDATE
    USING (spender_id = current_user_id())
    WITH CHECK (spender_id = current_user_id());
`;

export const GAMIFICATION_RLS_POLICIES = `
-- =============================================
-- GAMIFICATION POLICIES
-- =============================================

-- Enable RLS on gamification tables
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Streaks - relationship level access
DROP POLICY IF EXISTS "streaks_relationship_access" ON streaks;
CREATE POLICY "streaks_relationship_access" ON streaks
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

-- Challenges - public read access for active challenges
DROP POLICY IF EXISTS "challenges_public_active" ON challenges;
CREATE POLICY "challenges_public_active" ON challenges
    FOR SELECT
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "challenge_questions_public" ON challenge_questions;
CREATE POLICY "challenge_questions_public" ON challenge_questions
    FOR SELECT
    USING (
        challenge_id IN (
            SELECT id FROM challenges WHERE is_active = TRUE
        )
    );

-- Relationship challenges - both partners can access
DROP POLICY IF EXISTS "relationship_challenges_access" ON relationship_challenges;
CREATE POLICY "relationship_challenges_access" ON relationship_challenges
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "relationship_challenges_create" ON relationship_challenges;
CREATE POLICY "relationship_challenges_create" ON relationship_challenges
    FOR INSERT
    WITH CHECK (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

-- Challenge responses - own responses + partner's responses in shared challenge
DROP POLICY IF EXISTS "challenge_responses_own" ON challenge_responses;
CREATE POLICY "challenge_responses_own" ON challenge_responses
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

DROP POLICY IF EXISTS "challenge_responses_partner_view" ON challenge_responses;
CREATE POLICY "challenge_responses_partner_view" ON challenge_responses
    FOR SELECT
    USING (
        relationship_challenge_id IN (
            SELECT rc.id FROM relationship_challenges rc
            JOIN relationships r ON rc.relationship_id = r.id
            WHERE r.status = 'active'
            AND (r.user1_id = current_user_id() OR r.user2_id = current_user_id())
        )
    );

-- Achievements - relationship level access
DROP POLICY IF EXISTS "achievements_relationship_access" ON achievements;
CREATE POLICY "achievements_relationship_access" ON achievements
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );
`;

export const SYSTEM_RLS_POLICIES = `
-- =============================================
-- SYSTEM & NOTIFICATIONS POLICIES
-- =============================================

-- Enable RLS on system tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakup_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE closure_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_reports ENABLE ROW LEVEL SECURITY;

-- Notifications - only own notifications
DROP POLICY IF EXISTS "notifications_own_only" ON notifications;
CREATE POLICY "notifications_own_only" ON notifications
    FOR SELECT
    USING (user_id = current_user_id());

DROP POLICY IF EXISTS "notifications_mark_read" ON notifications;
CREATE POLICY "notifications_mark_read" ON notifications
    FOR UPDATE
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

-- Breakup archives - only own archives
DROP POLICY IF EXISTS "breakup_archives_own_only" ON breakup_archives;
CREATE POLICY "breakup_archives_own_only" ON breakup_archives
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

-- Closure activities - only own activities
DROP POLICY IF EXISTS "closure_activities_own_only" ON closure_activities;
CREATE POLICY "closure_activities_own_only" ON closure_activities
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

-- Relationship history - only own history + partner visibility if enabled
DROP POLICY IF EXISTS "relationship_history_own" ON relationship_history;
CREATE POLICY "relationship_history_own" ON relationship_history
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

DROP POLICY IF EXISTS "relationship_history_partner_visible" ON relationship_history;
CREATE POLICY "relationship_history_partner_visible" ON relationship_history
    FOR SELECT
    USING (
        is_visible = TRUE 
        AND user_id IN (
            SELECT CASE 
                WHEN user1_id = current_user_id() THEN user2_id
                WHEN user2_id = current_user_id() THEN user1_id
            END
            FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

-- Wellness data - own data only
DROP POLICY IF EXISTS "wellness_data_own_only" ON wellness_data;
CREATE POLICY "wellness_data_own_only" ON wellness_data
    FOR ALL
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

-- Couple insights - both partners can view
DROP POLICY IF EXISTS "couple_insights_relationship_access" ON couple_insights;
CREATE POLICY "couple_insights_relationship_access" ON couple_insights
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

DROP POLICY IF EXISTS "couple_insights_mark_read" ON couple_insights;
CREATE POLICY "couple_insights_mark_read" ON couple_insights
    FOR UPDATE
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

-- AI suggestions - targeted to specific user or both
DROP POLICY IF EXISTS "ai_suggestions_targeted" ON ai_suggestions;
CREATE POLICY "ai_suggestions_targeted" ON ai_suggestions
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
        AND (target_user_id IS NULL OR target_user_id = current_user_id())
    );

DROP POLICY IF EXISTS "ai_suggestions_feedback" ON ai_suggestions;
CREATE POLICY "ai_suggestions_feedback" ON ai_suggestions
    FOR UPDATE
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
        AND (target_user_id IS NULL OR target_user_id = current_user_id())
    );

-- Relationship reports - both partners can view
DROP POLICY IF EXISTS "relationship_reports_access" ON relationship_reports;
CREATE POLICY "relationship_reports_access" ON relationship_reports
    FOR SELECT
    USING (
        relationship_id IN (
            SELECT id FROM relationships 
            WHERE status = 'active'
            AND (user1_id = current_user_id() OR user2_id = current_user_id())
        )
    );

-- App analytics - own analytics only + admin access
DROP POLICY IF EXISTS "app_analytics_own_only" ON app_analytics;
CREATE POLICY "app_analytics_own_only" ON app_analytics
    FOR SELECT
    USING (user_id = current_user_id());

DROP POLICY IF EXISTS "app_analytics_insert_own" ON app_analytics;
CREATE POLICY "app_analytics_insert_own" ON app_analytics
    FOR INSERT
    WITH CHECK (user_id = current_user_id());

DROP POLICY IF EXISTS "app_analytics_admin_access" ON app_analytics;
CREATE POLICY "app_analytics_admin_access" ON app_analytics
    FOR SELECT
    USING (is_admin());

-- Audit logs - admin only
DROP POLICY IF EXISTS "audit_logs_admin_only" ON audit_logs;
CREATE POLICY "audit_logs_admin_only" ON audit_logs
    FOR SELECT
    USING (is_admin());
`;

export const getAllRlsPolicies = () => {
  return [
    CORE_RLS_POLICIES,
    ADVANCED_RLS_POLICIES,
    COMMERCE_RLS_POLICIES,
    GAMIFICATION_RLS_POLICIES,
    SYSTEM_RLS_POLICIES
  ].join('\n\n');
};

export const getCoreRlsPolicies = () => {
  return CORE_RLS_POLICIES;
};