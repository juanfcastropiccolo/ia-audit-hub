// Script to create test users in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.script' });

// Environment variables for Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wdhpfvgidwmporwuwtiy.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('ERROR: VITE_SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

// Initialize Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const createTestUsers = async () => {
  try {
    console.log('Creating test users...');
    
    // 1. Create test client user
    const clientEmail = 'cliente.prueba@audit-ia.com';
    const clientPassword = 'ClientePrueba123!';
    
    const { data: clientData, error: clientError } = await supabase.auth.admin.createUser({
      email: clientEmail,
      password: clientPassword,
      email_confirm: true
    });
    
    if (clientError) {
      console.error('Error creating client user:', clientError.message);
    } else {
      console.log('✅ Test client user created successfully!');
      
      // Update the user's role to 'client'
      const { error: updateClientError } = await supabase
        .from('users')
        .upsert({ 
          id: clientData.user.id,
          email: clientData.user.email,
          role: 'client'
        });
        
      if (updateClientError) {
        console.error('Error setting client role:', updateClientError.message);
      } else {
        console.log('✅ Client role assigned successfully!');
      }
    }
    
    // 2. Create test admin user
    const adminEmail = 'admin.prueba@audit-ia.com';
    const adminPassword = 'AdminPrueba123!';
    
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });
    
    if (adminError) {
      console.error('Error creating admin user:', adminError.message);
    } else {
      console.log('✅ Test admin user created successfully!');
      
      // Update the user's role to 'admin'
      const { error: updateAdminError } = await supabase
        .from('users')
        .upsert({ 
          id: adminData.user.id,
          email: adminData.user.email,
          role: 'admin'
        });
        
      if (updateAdminError) {
        console.error('Error setting admin role:', updateAdminError.message);
      } else {
        console.log('✅ Admin role assigned successfully!');
      }
    }
    
    console.log('\nTest Users Information:');
    console.log('=======================');
    console.log('Client User:');
    console.log(`Email: ${clientEmail}`);
    console.log(`Password: ${clientPassword}`);
    console.log('\nAdmin User:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

createTestUsers(); 