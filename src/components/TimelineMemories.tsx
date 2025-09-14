import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Gift, Camera, MapPin, Plus, Sparkles, MessageCircle, Users, Book, Grid3X3, List } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { projectId } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TimelineMemoriesProps {
  user: any;
  partner: any;
  session: any;
  viewMode?: 'grid' | 'list';
}

interface TimelineEvent {
  id: string;
  event_type: string;
  title: string;
  description: string;
  event_date: string;
  media_urls: string[];
  location_name?: string;
  is_milestone: boolean;
  is_auto_generated: boolean;
  created_at: string;
  created_by: {
    id: string;
    name: string;
    username: string;
  };
}

export default function TimelineMemories({ user, partner, session, viewMode = 'grid' }: TimelineMemoriesProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>(viewMode);

  useEffect(() => {
    if (user && session) {
      loadTimeline();
    }
  }, [user, session]);

  const loadTimeline = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/timeline/events`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        console.error('Failed to load timeline');
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (date: string) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter events with images for grid view
  const eventsWithImages = events.filter(event => event.media_urls && event.media_urls.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Heart className="w-8 h-8 text-pink-500 animate-pulse" />
      </div>
    );
  }

  if (view === 'grid') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Memories</h3>
            <p className="text-sm text-gray-600">{eventsWithImages.length} photos</p>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="default"
              onClick={() => setView('grid')}
              className="px-2"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setView('list')}
              className="px-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Instagram-like Grid */}
        {eventsWithImages.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No photos yet</p>
            <p className="text-sm text-gray-500">Start adding memories with photos</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {eventsWithImages.map((event) => (
              <div key={event.id} className="aspect-square relative group cursor-pointer">
                <ImageWithFallback
                  src={event.media_urls[0]}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Multiple photos indicator */}
                {event.media_urls.length > 1 && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-0.5">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs">{formatEventDate(event.event_date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-800">Timeline</h3>
          <p className="text-sm text-gray-600">{events.length} memories</p>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setView('grid')}
            className="px-2"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => setView('list')}
            className="px-2"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline List */}
      {events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No memories yet</p>
          <p className="text-sm text-gray-500">Start creating your timeline</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex gap-4">
                {/* Event Icon */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                
                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        by {event.created_by?.name || 'You'} • {formatEventDate(event.event_date)}
                      </p>
                    </div>
                    
                    {event.is_milestone && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex-shrink-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Milestone
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{event.description}</p>
                  
                  {event.location_name && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location_name}</span>
                    </div>
                  )}
                  
                  {event.media_urls && event.media_urls.length > 0 && (
                    <div className="mt-3">
                      {event.media_urls.length === 1 ? (
                        <div className="rounded-xl overflow-hidden">
                          <ImageWithFallback
                            src={event.media_urls[0]}
                            alt="Memory"
                            className="w-full h-64 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {event.media_urls.slice(0, 4).map((url, idx) => (
                            <div key={idx} className="relative rounded-lg overflow-hidden">
                              <ImageWithFallback
                                src={url}
                                alt={`Memory ${idx + 1}`}
                                className="w-full h-32 object-cover"
                              />
                              {idx === 3 && event.media_urls.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                  <span className="text-white font-medium">
                                    +{event.media_urls.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}