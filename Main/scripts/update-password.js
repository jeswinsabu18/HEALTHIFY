// Import from CDN properly
//import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2';
import { supabase } from './config.js';


// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const email = urlParams.get('email'); // Email from the reset link

// Check if token exists
if (!token) {
    alert("No reset token found. Please use the link from your email.");
    // Optionally redirect to forgot password page
    // window.location.href = 'forgot-password.html';
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('updatePasswordForm');

    // Auto-fill token in OTP field if present in URL
    if (token && document.getElementById('otp')) {
        document.getElementById('otp').value = token;
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const otpInput = document.getElementById('otp').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('submitBtn');
            const successMessage = document.getElementById('successMessage');
            const errorMessage = document.getElementById('errorMessage');

            // Reset messages
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';

            if (password !== confirmPassword) {
                errorMessage.textContent = "Passwords don't match!";
                errorMessage.style.display = 'block';
                return;
            }

            // Password validation
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                errorMessage.textContent = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Updating...';

                // First verify the OTP token is valid
                const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                    email: email,
                    token: otpInput,
                    type: 'recovery'
                });

                if (verifyError) {
                    throw verifyError;
                }

                // If OTP is valid, update the password
                const { error: updateError } = await supabase.auth.updateUser({
                    password: password
                });

                if (updateError) {
                    throw updateError;
                }

                // Show success message
                successMessage.style.display = 'block';
                console.log('Password update successful!');

                // Optional: Automatically sign in the user
                try {
                    const { error: signInError } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                    if (!signInError) {
                        console.log('Login with new password successful!');
                    }
                } catch (signInError) {
                    console.log('Automatic login skipped or failed', signInError);
                }

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);

            } catch (error) {
                console.error('Password reset error:', error);
                errorMessage.textContent = error.message || 'An error occurred while updating your password. The OTP may have expired or be incorrect.';
                errorMessage.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Password';
            }
        });
    } else {
        console.error('Update password form not found in the DOM');
    }
});