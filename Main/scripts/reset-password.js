import { supabaseUrl, supabaseKey } from './config.js';

const supabaseAuth = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password.html`,
        });

        if (error) throw error;

        // Show success message
        successMessage.style.display = 'block';
        document.getElementById('resetPasswordForm').reset();

    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    }
}); 