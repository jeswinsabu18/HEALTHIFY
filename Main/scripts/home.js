import { supabase } from './config.js';

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
            // Extract full name from raw_user_meta_data (key: fullName)
            const fullName = user?.user_metadata?.fullName ||
                user?.raw_user_meta_data?.fullName ||
                user.email;

            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = fullName;
            }

            // Add profile picture - use avatar URL directly from user metadata
            const profilePic = document.getElementById('profilePic');
            if (profilePic) {
                // Get avatarUrl from metadata (matching how it's stored in profile.js)
                const avatarUrl = user?.user_metadata?.avatarUrl ||
                    user?.raw_user_meta_data?.avatarUrl;

                if (avatarUrl) {
                    profilePic.src = avatarUrl;
                } else {
                    // Set a default avatar if none exists
                    profilePic.src = "./assets/default-avatar.png";
                }
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