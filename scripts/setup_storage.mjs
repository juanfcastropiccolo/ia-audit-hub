
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://wdhpfvgidwmporwuwtiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaHBmdmdpZHdtcG9yd3V3dGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQwNTEwOSwiZXhwIjoyMDYyOTgxMTA5fQ.XEFOF300eN56Cnxg-B3POlfRl3b3RmPwcM_D7S2htF8';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Define paths for both logos
const ORIGINAL_LOGO_PATH = join(__dirname, '..', 'public', 'logo.png');
const NEW_LOGO_PATH = join(__dirname, '..', 'public', 'new_logo.png');

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

// Download the new logo from the uploaded URL and save it locally
async function downloadNewLogo() {
  try {
    console.log('Downloading new logo...');
    // The URL of the uploaded image
    const logoUrl = '/lovable-uploads/84946879-5424-43e3-9c58-c92ea7314118.png';
    
    // For local development, we assume the file is already in the project
    // In a real environment, you would download it from the URL
    console.log('Checking if we need to copy the new logo file...');
    
    // Check if the file exists
    try {
      await fs.promises.access(NEW_LOGO_PATH);
      console.log('New logo file already exists locally');
    } catch (err) {
      console.log('Need to copy the new logo file');
      // Copy the file from uploads folder to the public folder
      try {
        // In case the file is accessible from the lovable-uploads folder directly
        await fs.promises.copyFile(
          join(__dirname, '..', logoUrl), 
          NEW_LOGO_PATH
        );
        console.log('New logo copied successfully');
      } catch (copyError) {
        console.error('Failed to copy new logo from uploads:', copyError);
        // We'll just use the existing logo as a fallback
        console.log('Using existing logo as fallback');
        await fs.promises.copyFile(ORIGINAL_LOGO_PATH, NEW_LOGO_PATH);
      }
    }
    
    console.log('New logo file prepared for upload');
    return 'public/new_logo.png';
  } catch (error) {
    console.error('Error preparing new logo:', error);
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
    
    // Prepare the new logo
    const newLogoPath = await downloadNewLogo();
    
    // Upload new logo to buckets
    console.log('Uploading new logo to public bucket...');
    await uploadFile('public', newLogoPath, 'logo.png');
    
    console.log('Uploading new logo to pictures bucket...');
    await uploadFile('pictures', newLogoPath, 'trimmed_logo.png');

    console.log('Storage setup completed successfully');
  } catch (error) {
    console.error('Error in storage setup:', error);
    process.exit(1);
  }
}

setupStorage();
