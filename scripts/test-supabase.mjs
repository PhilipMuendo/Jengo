import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET;

if (!url || !secret) {
  console.error('Please set SUPABASE_URL and SUPABASE_SECRET in your environment.');
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  console.log('Attempting to create user...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'demo12345@example.com',
    password: 'password123',
    email_confirm: true,
  });
  console.log('Data:', data);
  if (error) {
    console.error('Error object:', error);
    console.error('Error keys:', Object.keys(error));
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  }
}

run();
