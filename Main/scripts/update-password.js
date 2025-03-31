// Import from CDN properly
import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2';
import { supabaseUrl, supabaseKey } from './config.js';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Check if token exists
if (!token) {
    alert("No reset token found. Please use the link from your email.");
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('updatePasswordForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('submitBtn');
            const successMessage = document.getElementById('successMessage');

            if (password !== confirmPassword) {
                alert("Passwords don't match!");
                return;
            }

            // Password validation
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                alert('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Updating...';

                // The correct way to use the password reset token with Supabase
                const { error } = await supabase.auth.resetPasswordForEmail(
                    password,
                    { token: token }
                );

                if (error) {
                    throw error;
                }

                // Show success message and redirect
                successMessage.style.display = 'block';
                // After successful password update
                console.log('Password update successful!');
                // You can also log the user in immediately to verify
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: 'user@example.com', // Use the actual user email
                    password: password
                });
                if (!signInError) {
                    console.log('Login with new password successful!');
                }

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);

            } catch (error) {
                console.error('Password reset error:', error);
                alert(error.message || 'An error occurred while updating your password.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Password';
            }
        });
    } else {
        console.error('Update password form not found in the DOM');
    }
});