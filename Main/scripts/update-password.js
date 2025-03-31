import { supabase } from './config.js';


document.getElementById('updatePasswordForm').addEventListener('submit', async (e) => {
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

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) throw error;

        // Show success message and redirect
        successMessage.style.display = 'block';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);

    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Password';
    }
}); 