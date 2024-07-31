// Import the Supabase client
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your Supabase URL and API key
const supabase = createClient('https://jtnfikbfeyffdoteshjz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bmZpa2JmZXlmZmRvdGVzaGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA2MjgyMDQsImV4cCI6MjAxNjIwNDIwNH0.vqrQXoRNOQHbKyyrLK113t-2b-DCze0LihNlLTnfIBA');

// Example: User Authentication
async function loginUser(email, password) {
    const { user, error } = await supabase.auth.signIn({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Login error:', error.message);
    } else {
        console.log('Logged in user:', user);
    }
}

// Example: Database Operation
async function fetchUserFavorites(userId) {
    const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Database query error:', error.message);
    } else {
        console.log('User favorites:', data);
    }
}

// Example: Real-Time Updates
const subscription = supabase
    .from('favorites')
    .on('INSERT', payload => {
        console.log('New favorite added:', payload.new);
    })
    .subscribe();

// Use the functions as needed in your application
// e.g., loginUser('user@example.com', 'password123');
// e.g., fetchUserFavorites('123');

// Remember to handle errors appropriately and customize the code based on your application's requirements.
