import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Heart, Gift, Camera, MapPin, Plus, Sparkles, MessageCircle, Users, Book, Image, X, ArrowLeft, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { projectId } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TimelineProps {
  user: any;
  partner: any;
  session: any;
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

export default function Timeline({ user, partner, session }: TimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    locationName: '',
    type: 'memory',
  });
  const [saving, setSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  const eventTypes = [
    { value: 'memory', label: '📸 Memory', icon: Camera, color: 'from-blue-400 to-purple-400' },
    { value: 'date', label: '💕 Date', icon: Heart, color: 'from-pink-400 to-red-400' },
    { value: 'gift', label: '🎁 Gift', icon: Gift, color: 'from-yellow-400 to-orange-400' },
    { value: 'milestone', label: '🎉 Milestone', icon: Sparkles, color: 'from-green-400 to-teal-400' },
    { value: 'trip', label: '✈️ Trip', icon: MapPin, color: 'from-indigo-400 to-blue-400' },
    { value: 'journal', label: '📝 Journal', icon: Book, color: 'from-purple-400 to-pink-400' },
    { value: 'other', label: '🌟 Other', icon: Plus, color: 'from-gray-400 to-slate-400' },
  ];

  // Filter types for solo mode
  const soloEventTypes = eventTypes.filter(type => 
    ['memory', 'milestone', 'trip', 'journal'].includes(type.value)
  );

  const activeEventTypes = partner ? eventTypes : soloEventTypes;

  // Image compression function for better performance
  const compressImage = async (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original file
          }
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    if (user && session) {
      loadTimeline();
    }
  }, [user, session]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up all blob URLs when component unmounts
      imagePreviewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviewUrls]);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const limitedFiles = files.slice(0, 5);
    setSelectedImages(prev => [...prev, ...limitedFiles].slice(0, 5));

    // Create preview URLs
    limitedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviewUrls(prev => [...prev, e.target!.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    // Clean up object URL to prevent memory leaks
    const urlToRevoke = imagePreviewUrls[index];
    if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRevoke);
    }
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      // Reindex remaining items
      const reindexed: { [key: number]: number } = {};
      Object.keys(newProgress).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          reindexed[keyNum - 1] = newProgress[keyNum];
        } else {
          reindexed[keyNum] = newProgress[keyNum];
        }
      });
      return reindexed;
    });
  };

  const handleAddMemory = async () => {
    if (!newMemory.title.trim() || !newMemory.description.trim()) {
      return;
    }

    setSaving(true);
    setUploadProgress({});
    setUploadStatus('');
    
    try {
      let uploadedImageUrls: string[] = [];
      
      // Upload images to storage if any are selected
      if (selectedImages.length > 0) {
        console.log('Uploading', selectedImages.length, 'images in parallel...');
        setUploadStatus(`Uploading ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}...`);
        
        // Generate a temporary memory ID for organizing uploads
        const tempMemoryId = crypto.randomUUID();
        
        // Upload all images in parallel for much better performance
        const uploadPromises = selectedImages.map(async (imageFile, index) => {
          try {
            setUploadProgress(prev => ({ ...prev, [index]: 0 }));
            
            console.log(`Starting parallel upload for image ${index + 1}/${selectedImages.length}:`, imageFile.name);
            
            // Compress image if it's larger than 2MB
            let processedFile = imageFile;
            if (imageFile.size > 2 * 1024 * 1024) {
              setUploadProgress(prev => ({ ...prev, [index]: 10 }));
              processedFile = await compressImage(imageFile);
              console.log(`Compressed image ${index + 1} from ${imageFile.size} to ${processedFile.size} bytes`);
            }
            
            setUploadProgress(prev => ({ ...prev, [index]: 20 }));
            
            const formData = new FormData();
            formData.append('image', processedFile);
            formData.append('memoryId', tempMemoryId);
            
            setUploadProgress(prev => ({ ...prev, [index]: 30 }));
            
            // Add timeout and retry logic for better reliability
            const uploadWithTimeout = async () => {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
              
              try {
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/memories/upload-image`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: formData,
                    signal: controller.signal,
                  }
                );
                clearTimeout(timeoutId);
                return response;
              } catch (error) {
                clearTimeout(timeoutId);
                throw error;
              }
            };
            
            const uploadResponse = await uploadWithTimeout();
            
            setUploadProgress(prev => ({ ...prev, [index]: 80 }));
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              setUploadProgress(prev => ({ ...prev, [index]: 100 }));
              console.log(`Image ${index + 1} uploaded successfully`);
              return uploadData.url;
            } else {
              const errorData = await uploadResponse.json();
              console.error(`Failed to upload image ${index + 1}:`, errorData);
              setUploadProgress(prev => ({ ...prev, [index]: -1 })); // -1 indicates error
              return null;
            }
          } catch (uploadError) {
            console.error(`Error uploading image ${index + 1}:`, uploadError);
            setUploadProgress(prev => ({ ...prev, [index]: -1 })); // -1 indicates error
            return null;
          }
        });
        
        // Wait for all uploads to complete in parallel
        const uploadResults = await Promise.all(uploadPromises);
        uploadedImageUrls = uploadResults.filter(url => url !== null) as string[];
        
        console.log('Parallel image upload completed. Uploaded', uploadedImageUrls.length, 'of', selectedImages.length, 'images');
        
        if (uploadedImageUrls.length === selectedImages.length) {
          setUploadStatus(`✅ All ${selectedImages.length} images uploaded successfully`);
        } else if (uploadedImageUrls.length > 0) {
          setUploadStatus(`⚠️ ${uploadedImageUrls.length} of ${selectedImages.length} images uploaded`);
        } else {
          setUploadStatus(`❌ Upload failed for all images`);
        }
      }

      // Create the timeline event with uploaded image URLs
      setUploadStatus(uploadedImageUrls.length > 0 ? 'Creating memory with images...' : 'Creating memory...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/timeline/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventType: newMemory.type,
            title: newMemory.title,
            description: newMemory.description,
            eventDate: newMemory.eventDate,
            locationName: newMemory.locationName || undefined,
            isMilestone: newMemory.type === 'milestone',
            mediaUrls: uploadedImageUrls,
            isPrivate: false, // Default to public for now
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Add created_by info for display
        const eventWithCreator = {
          ...data.event,
          media_urls: uploadedImageUrls, // Include the uploaded image URLs
          created_by: {
            id: user?.id,
            name: user?.name || user?.username || 'You',
            username: user?.username || 'user',
          }
        };
        
        setEvents(prev => [eventWithCreator, ...prev]);
        
        // Reset form
        setNewMemory({
          title: '',
          description: '',
          eventDate: new Date().toISOString().split('T')[0],
          locationName: '',
          type: 'memory',
        });
        setSelectedImages([]);
        setImagePreviewUrls([]);
        setUploadProgress({});
        setUploadStatus('');
        setShowAddMemory(false);
        
        console.log('Memory created successfully with', uploadedImageUrls.length, 'images');
      } else {
        const errorData = await response.json();
        console.error('Failed to create memory:', errorData);
      }
    } catch (error) {
      console.error('Error adding memory:', error);
    } finally {
      setSaving(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    const type = eventTypes.find(t => t.value === eventType);
    return type?.icon || Camera;
  };

  const getEventColor = (eventType: string) => {
    const type = eventTypes.find(t => t.value === eventType);
    return type?.color || 'from-gray-400 to-gray-500';
  };

  const formatEventDate = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="p-4 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-gray-800">
              {partner ? 'Our Timeline' : 'My Timeline'}
            </h2>
            <p className="text-sm text-gray-600">
              {partner 
                ? `Your journey with ${partner.name}` 
                : 'Your personal memories and milestones'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              <Button
                size="sm"
                variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                onClick={() => setViewMode('timeline')}
                className="px-3 py-1"
              >
                <Calendar className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                onClick={() => setViewMode('calendar')}
                className="px-3 py-1"
              >
                <Book className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              onClick={() => setShowAddMemory(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Memory
            </Button>
          </div>
        </div>

        {/* Mode Indicator for Solo */}
        {!partner && (
          <Card className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">Personal Timeline</h3>
                <p className="text-sm text-gray-600">
                  Document your journey, create memories, and track your milestones
                </p>
              </div>
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                <Users className="w-4 h-4 mr-1" />
                Invite Partner
              </Button>
            </div>
          </Card>
        )}

        {/* Timeline Events */}
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">
              {partner ? 'No memories yet' : 'Start your timeline'}
            </h3>
            <p className="text-gray-600 mb-6">
              {partner 
                ? 'Start creating beautiful memories together by adding your first moment.'
                : 'Begin documenting your personal journey, milestones, and special moments.'
              }
            </p>
            
            {/* Solo Mode Suggestions */}
            {!partner && (
              <div className="space-y-3 max-w-sm mx-auto mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setNewMemory({
                        ...newMemory,
                        title: 'Started my journey',
                        description: 'Beginning my personal wellness and growth journey',
                        type: 'milestone'
                      });
                      setShowAddMemory(true);
                    }}
                    className="p-3 bg-white rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors"
                  >
                    <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-700">First Milestone</p>
                  </button>
                  <button
                    onClick={() => {
                      setNewMemory({
                        ...newMemory,
                        title: 'Today\'s reflection',
                        description: 'Thoughts and feelings about my day',
                        type: 'journal'
                      });
                      setShowAddMemory(true);
                    }}
                    className="p-3 bg-white rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors"
                  >
                    <Book className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-700">Journal Entry</p>
                  </button>
                </div>
              </div>
            )}
            
            <Button
              onClick={() => setShowAddMemory(true)}
              variant="outline"
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {partner ? 'Add First Memory' : 'Start Timeline'}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const EventIcon = getEventIcon(event.event_type);
              
              return (
                <Card key={event.id} className="p-4 relative">
                  {/* Timeline line */}
                  {index < events.length - 1 && (
                    <div className="absolute left-8 top-16 w-px h-8 bg-gradient-to-b from-pink-200 to-purple-200" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Event Icon */}
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getEventColor(event.event_type)} flex items-center justify-center flex-shrink-0`}>
                      <EventIcon className="w-6 h-6 text-white" />
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
              );
            })}
          </div>
        )}

        {/* Instagram-like Add Memory Modal */}
        {showAddMemory && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Button
                onClick={() => {
                  // Clean up all object URLs to prevent memory leaks
                  imagePreviewUrls.forEach(url => {
                    if (url.startsWith('blob:')) {
                      URL.revokeObjectURL(url);
                    }
                  });
                  
                  setShowAddMemory(false);
                  setSelectedImages([]);
                  setImagePreviewUrls([]);
                  setUploadProgress({});
                  setUploadStatus('');
                  setNewMemory({
                    title: '',
                    description: '',
                    eventDate: new Date().toISOString().split('T')[0],
                    locationName: '',
                    type: 'memory',
                  });
                }}
                variant="ghost"
                size="sm"
                disabled={saving}
              >
                <X className="w-5 h-5" />
              </Button>
              <h3 className="text-lg font-medium text-gray-800">
                New Memory
              </h3>
              <Button
                onClick={handleAddMemory}
                disabled={!newMemory.title.trim() || !newMemory.description.trim() || saving}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6"
                size="sm"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {selectedImages.length > 0 ? 'Uploading...' : 'Sharing...'}
                  </div>
                ) : 'Share'}
              </Button>
            </div>

            {/* Upload Progress */}
            {saving && selectedImages.length > 0 && (
              <div className="border-b border-gray-200 p-4 bg-blue-50">
                <div className="space-y-3">
                  {uploadStatus && (
                    <p className="text-sm text-blue-800 font-medium">{uploadStatus}</p>
                  )}
                  
                  <div className="space-y-2">
                    {selectedImages.map((file, index) => {
                      const progress = uploadProgress[index] || 0;
                      const hasError = progress === -1;
                      
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={imagePreviewUrls[index]}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600 truncate max-w-[120px]">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {hasError ? 'Failed' : progress === 100 ? 'Done' : `${progress}%`}
                              </span>
                            </div>
                            
                            <Progress 
                              value={hasError ? 100 : progress} 
                              className={`h-1.5 ${
                                hasError 
                                  ? '[&>*]:bg-red-500' 
                                  : progress === 100 
                                  ? '[&>*]:bg-green-500' 
                                  : '[&>*]:bg-blue-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Photo Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Photos</label>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Add Photos
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                    {imagePreviewUrls.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-pink-300 hover:bg-pink-50 transition-colors"
                      >
                        <Plus className="w-6 h-6 text-gray-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Memory Details */}
              <div className="space-y-4">
                {/* Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {activeEventTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setNewMemory({ ...newMemory, type: type.value })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors ${
                            newMemory.type === type.value
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Input
                    value={newMemory.title}
                    onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                    placeholder="What's this memory about?"
                    className="text-lg font-medium border-0 bg-transparent p-0 focus:ring-0 placeholder:text-gray-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <Textarea
                    value={newMemory.description}
                    onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                    placeholder="Share your thoughts about this moment..."
                    className="border-0 bg-transparent p-0 focus:ring-0 resize-none placeholder:text-gray-400"
                    rows={4}
                  />
                </div>

                {/* Date and Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <Input
                      type="date"
                      value={newMemory.eventDate}
                      onChange={(e) => setNewMemory({ ...newMemory, eventDate: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <Input
                      value={newMemory.locationName}
                      onChange={(e) => setNewMemory({ ...newMemory, locationName: e.target.value })}
                      placeholder="Add location"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}