// scripts/auth.js
import { supabase } from './config.js';

export async function checkAuthAndRedirect() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

export function displayUserInfo() {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
        if (error || !user) {
            console.error('Error fetching user:', error);
            return;
        }
        const profilePic = document.getElementById('profilePic');
        const username = document.getElementById('username');
        if (profilePic) {
            const avatarUrl = user?.user_metadata?.avatarUrl || user?.raw_user_meta_data?.avatarUrl;
            username.textContent = user?.user_metadata?.fullName ||
                user?.raw_user_meta_data?.fullName ||
                user.email;

            if (avatarUrl) {
                profilePic.src = avatarUrl;
            } else {
                profilePic.src = "./assets/default-avatar.png";
            }
        }
    });
}

export async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout error:', error);
    } else {
        window.location.href = 'index.html'; // Redirect to login page after logout
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndRedirect().then(isAuthenticated => {
        if (isAuthenticated) {
            displayUserInfo();
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogout();
        });
    }
});