// Timeline endpoints for LoveLink
import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { getMemoryImageUrls } from './memory-storage.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

export function registerTimelineEndpoints(app: Hono) {
  // Get timeline events
  app.get('/make-server-46bfb162/timeline/events', async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (!user?.id || error) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      console.log('Loading timeline events for user:', user.id);

      // Get user's active relationship if exists
      const { data: relationship } = await supabase
        .from('relationships')
        .select('id')
        .or(`and(user1_id.eq.${user.id},status.eq.active),and(user2_id.eq.${user.id},status.eq.active)`)
        .maybeSingle();

      // Query timeline events for the user or their relationship
      let query = supabase
        .from('timeline_events')
        .select(`
          *,
          created_by:users!timeline_events_created_by_user_id_fkey(id, name, username)
        `)
        .order('event_date', { ascending: false });

      if (relationship) {
        // If user has relationship, get relationship events
        query = query.eq('relationship_id', relationship.id);
      } else {
        // If no relationship, get user's personal events
        query = query.eq('created_by_user_id', user.id).is('relationship_id', null);
      }

      const { data: events, error: eventsError } = await query;

      if (eventsError) {
        console.log('Error loading timeline events:', eventsError);
        return c.json({ error: 'Failed to load timeline events: ' + eventsError.message }, 500);
      }

      // Process events to generate signed URLs for images
      const processedEvents = await Promise.all((events || []).map(async (event) => {
        if (event.media_urls && event.media_urls.length > 0) {
          // Get signed URLs for the media
          const signedUrls = await getMemoryImageUrls(event.media_urls);
          return {
            ...event,
            media_urls: signedUrls
          };
        }
        return event;
      }));

      console.log('Loaded', processedEvents?.length || 0, 'timeline events');
      return c.json({ events: processedEvents || [] });

    } catch (error) {
      console.log('Timeline events error:', error);
      return c.json({ error: 'Internal server error loading timeline: ' + error.message }, 500);
    }
  });

  // Create timeline event
  app.post('/make-server-46bfb162/timeline/events', async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (!user?.id || error) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const {
        eventType,
        title,
        description,
        eventDate,
        locationName,
        isMilestone,
        mediaUrls,
        isPrivate
      } = await c.req.json();

      console.log('Creating timeline event for user:', user.id, 'type:', eventType);

      if (!title || !description || !eventDate) {
        return c.json({ error: 'Title, description, and event date are required' }, 400);
      }

      // Get user's active relationship if exists
      const { data: relationship } = await supabase
        .from('relationships')
        .select('id')
        .or(`and(user1_id.eq.${user.id},status.eq.active),and(user2_id.eq.${user.id},status.eq.active)`)
        .maybeSingle();

      // Create the timeline event
      const eventData = {
        relationship_id: relationship?.id || null,
        created_by_user_id: user.id,
        event_type: eventType || 'memory',
        title: title.trim(),
        description: description.trim(),
        event_date: eventDate,
        media_urls: mediaUrls && Array.isArray(mediaUrls) ? mediaUrls : [],
        location_name: locationName?.trim() || null,
        is_milestone: Boolean(isMilestone),
        // Only include is_private if the column exists
        ...(isPrivate !== undefined && { is_private: Boolean(isPrivate) }),
        // Remove metadata column as it doesn't exist in the schema
      };

      const { data: createdEvent, error: createError } = await supabase
        .from('timeline_events')
        .insert(eventData)
        .select()
        .single();

      if (createError) {
        console.log('Error creating timeline event:', createError);
        
        // Check if it's because is_private column doesn't exist
        if (createError.message && createError.message.includes('is_private')) {
          console.log('is_private column issue detected, retrying without it...');
          
          // Retry without is_private column
          const { is_private, ...eventDataWithoutPrivate } = eventData;
          const { data: retryEvent, error: retryError } = await supabase
            .from('timeline_events')
            .insert(eventDataWithoutPrivate)
            .select()
            .single();

          if (retryError) {
            return c.json({ error: 'Failed to create timeline event: ' + retryError.message }, 500);
          }

          console.log('Timeline event created successfully (without is_private):', retryEvent.id);
          return c.json({ 
            event: retryEvent,
            success: true,
            message: 'Timeline event created successfully'
          });
        }

        return c.json({ error: 'Failed to create timeline event: ' + createError.message }, 500);
      }

      console.log('Timeline event created successfully:', createdEvent.id);
      return c.json({ 
        event: createdEvent,
        success: true,
        message: 'Timeline event created successfully'
      });

    } catch (error) {
      console.log('Create timeline event error:', error);
      return c.json({ error: 'Failed to create timeline event: ' + error.message }, 500);
    }
  });
}