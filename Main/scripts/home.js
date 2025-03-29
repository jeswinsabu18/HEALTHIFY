import { supabaseUrl, supabaseKey } from './config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Create the Supabase client correctly
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to handle logout
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Force redirect to index.html after successful logout
        window.location.replace('index.html');
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
}

// Function to get and display user info
async function displayUserInfo() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
            // Display username (email or full name if available)
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                const displayName = user.user_metadata.full_name || user.email;
                usernameElement.textContent = displayName;
            }

            // Add logout functionality
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        } else {
            // If no user is logged in, redirect to login page
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error getting user info:', error);
        window.location.href = 'index.html';
    }
}

// Check authentication state when page loads
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            window.location.href = 'index.html';
            return;
        }
        displayUserInfo();
    } catch (error) {
        console.error('Error checking auth:', error);
        window.location.href = 'index.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', checkAuth); 