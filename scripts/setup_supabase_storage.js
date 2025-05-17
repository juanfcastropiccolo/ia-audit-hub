#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://wdhpfvgidwmporwuwtiy.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaHBmdmdpZHdtcG9yd3V3dGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQwNTEwOSwiZXhwIjoyMDYyOTgxMTA5fQ.XEFOF300eN56Cnxg-B3POlfRl3b3RmPwcM_D7S2htF8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    // Create public bucket if it doesn't exist
    const { data: publicBucket, error: publicError } = await supabase
      .storage
      .createBucket('public', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 1024 * 1024 // 1MB
      })
    
    if (publicError && !publicError.message.includes('already exists')) {
      console.error('Error creating public bucket:', publicError)
    } else {
      console.log('Public bucket ready')
    }

    // Create pictures bucket if it doesn't exist
    const { data: picturesBucket, error: picturesError } = await supabase
      .storage
      .createBucket('pictures', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 1024 * 1024 // 1MB
      })
    
    if (picturesError && !picturesError.message.includes('already exists')) {
      console.error('Error creating pictures bucket:', picturesError)
    } else {
      console.log('Pictures bucket ready')
    }

    // Upload logo to public bucket
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('public')
      .upload('logo.png', await fetch('/public/logo.png').then(res => res.blob()), {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      console.error('Error uploading logo:', uploadError)
    } else {
      console.log('Logo uploaded successfully')
    }

  } catch (error) {
    console.error('Error in setup:', error)
  }
}

setupStorage()
