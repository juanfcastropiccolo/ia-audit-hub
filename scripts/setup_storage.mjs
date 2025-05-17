import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://wdhpfvgidwmporwuwtiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaHBmdmdpZHdtcG9yd3V3dGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQwNTEwOSwiZXhwIjoyMDYyOTgxMTA5fQ.XEFOF300eN56Cnxg-B3POlfRl3b3RmPwcM_D7S2htF8';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket(bucketName, isPublic = true) {
  try {
    console.log(`Setting up bucket: ${bucketName}`);
    
    // Create bucket if it doesn't exist
    const { data: bucket, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
      fileSizeLimit: 1024 * 1024 // 1MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`Bucket ${bucketName} already exists`);
      } else {
        throw error;
      }
    } else {
      console.log(`Created bucket: ${bucketName}`);
    }

    // Set bucket public/private
    const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
      public: isPublic
    });

    if (updateError) {
      throw updateError;
    }

    console.log(`Updated bucket ${bucketName} visibility to ${isPublic ? 'public' : 'private'}`);

  } catch (error) {
    console.error(`Error setting up bucket ${bucketName}:`, error);
    throw error;
  }
}

async function uploadFile(bucketName, filePath, destination) {
  try {
    console.log(`Uploading ${filePath} to ${bucketName}/${destination}`);
    
    // Read the file as a Buffer
    const fileData = await readFile(join(__dirname, '..', filePath));
    
    // Create a Blob with the correct MIME type
    const blob = new Blob([fileData], { type: 'image/png' });
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(destination, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    console.log(`Successfully uploaded ${destination} to ${bucketName}`);
    return data;
  } catch (error) {
    console.error(`Error uploading file:`, error);
    throw error;
  }
}

async function setupStorage() {
  try {
    console.log('Starting storage setup...');
    
    // Setup buckets
    console.log('Setting up public bucket...');
    await setupBucket('public', true);
    
    console.log('Setting up pictures bucket...');
    await setupBucket('pictures', true);
    
    // Check if logo exists
    const logoPath = join(__dirname, '..', 'public', 'logo.png');
    try {
      await readFile(logoPath);
      console.log('Logo file found at:', logoPath);
    } catch (err) {
      console.error('Logo file not found at:', logoPath);
      throw err;
    }
    
    // Upload logo to buckets
    console.log('Uploading logo to public bucket...');
    await uploadFile('public', 'public/logo.png', 'logo.png');
    
    console.log('Uploading logo to pictures bucket...');
    await uploadFile('pictures', 'public/logo.png', 'trimmed_logo.png');

    console.log('Storage setup completed successfully');
  } catch (error) {
    console.error('Error in storage setup:', error);
    process.exit(1);
  }
}

setupStorage();
