// Memory storage service for LoveLink Timeline
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const BUCKET_NAME = 'make-46bfb162-memories';

// Cache bucket initialization status to avoid repeated checks
let bucketInitialized = false;

// Initialize bucket on startup
export async function initializeMemoryBucket() {
  try {
    // Skip if already initialized to improve performance
    if (bucketInitialized) {
      return true;
    }
    
    console.log('Initializing memory bucket...');
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log('Creating memory bucket...');
      const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Private bucket for security
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
      
      console.log('Memory bucket created successfully:', data);
    } else {
      console.log('Memory bucket already exists');
    }
    
    bucketInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing memory bucket:', error);
    return false;
  }
}

// Upload image to memory bucket
export async function uploadMemoryImage(
  userId: string, 
  memoryId: string, 
  imageBuffer: ArrayBuffer, 
  fileName: string, 
  mimeType: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    // Ensure bucket exists (optimized with caching)
    if (!bucketInitialized) {
      await initializeMemoryBucket();
    }
    
    // Create a unique path for the image
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${memoryId}/${timestamp}_${sanitizedFileName}`;
    
    console.log('Uploading memory image to:', filePath);
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Image uploaded successfully:', data.path);
    
    // Create signed URL for access (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(data.path, 31536000); // 1 year
    
    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      return { success: false, error: urlError.message };
    }
    
    return { 
      success: true, 
      url: urlData.signedUrl,
      path: data.path 
    };
    
  } catch (error) {
    console.error('Exception uploading memory image:', error);
    return { success: false, error: error.message };
  }
}

// Get signed URLs for existing memory images
export async function getMemoryImageUrls(imagePaths: string[]): Promise<string[]> {
  try {
    if (!imagePaths || imagePaths.length === 0) {
      return [];
    }
    
    const urls: string[] = [];
    
    for (const path of imagePaths) {
      // Skip if path is already a full URL (signed URL)
      if (path.startsWith('http')) {
        urls.push(path);
        continue;
      }
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, 31536000); // 1 year
      
      if (error) {
        console.error('Error creating signed URL for path:', path, error);
        // Skip this image if we can't get a URL
        continue;
      }
      
      urls.push(data.signedUrl);
    }
    
    return urls;
  } catch (error) {
    console.error('Error getting memory image URLs:', error);
    return [];
  }
}

// Delete memory images when a memory is deleted
export async function deleteMemoryImages(imagePaths: string[]): Promise<void> {
  try {
    if (!imagePaths || imagePaths.length === 0) {
      return;
    }
    
    // Filter out full URLs and keep only storage paths
    const storagePaths = imagePaths.filter(path => !path.startsWith('http'));
    
    if (storagePaths.length === 0) {
      return;
    }
    
    console.log('Deleting memory images:', storagePaths);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(storagePaths);
    
    if (error) {
      console.error('Error deleting memory images:', error);
    } else {
      console.log('Memory images deleted successfully');
    }
  } catch (error) {
    console.error('Exception deleting memory images:', error);
  }
}

// Helper function to extract file info from FormData
export async function extractFileFromFormData(formData: FormData, fieldName: string): Promise<{
  buffer: ArrayBuffer | null;
  fileName: string | null;
  mimeType: string | null;
}> {
  try {
    const file = formData.get(fieldName) as File;
    
    if (!file || !file.size) {
      return { buffer: null, fileName: null, mimeType: null };
    }
    
    return {
      buffer: await file.arrayBuffer(),
      fileName: file.name,
      mimeType: file.type,
    };
  } catch (error) {
    console.error('Error extracting file from FormData:', error);
    return { buffer: null, fileName: null, mimeType: null };
  }
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be JPEG, PNG, GIF, or WebP' };
  }
  
  return { valid: true };
}