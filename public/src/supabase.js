// Import the Supabase library
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://bmudmwtihiaifrodrmyz.supabase.co'; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = 'your-public-anon-keyeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdWRtd3RpaGlhaWZyb2RybXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjE4OTUsImV4cCI6MjA1NjkzNzg5NX0.3tkW9LNFY8XiWaTCYvAK-3hJn32sGChT-i6ktSNlqog'; // Replace with your Supabase public API key

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export the Supabase client for use in other files
export default supabase;

// Optional: Helper functions for common operations
export const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error fetching user:', error.message);
        return null;
    }
    return data?.user;
};

export const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error('Error signing in:', error.message);
        return null;
    }
    return data;
};

export const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        console.error('Error signing up:', error.message);
        return null;
    }
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error.message);
        return false;
    }
    return true;
};

export const sendOtp = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
        console.error('Error sending OTP:', error.message);
        return null;
    }
    return data;
};

export const verifyOtp = async (email, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) {
        console.error('Error verifying OTP:', error.message);
        return null;
    }
    return data;
};