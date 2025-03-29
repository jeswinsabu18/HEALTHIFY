import { supabaseUrl, supabaseKey } from './config.js';

// Changed from supabaseClient to supabase
const supabaseAuth = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('login');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const { data, error } = await supabaseAuth.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        if (data.user) {
            if (!data.user.email_confirmed_at) {
                throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
            }

            // Show success state
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            submitBtn.innerHTML = 'Login Successful! <span class="success-checkmark">✓</span>';

            // Store the token
            localStorage.setItem('supabase.auth.token', data.session.access_token);

            // Reset form
            form.reset();

            // Redirect after showing success state
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        }
    } catch (error) {
        // Reset button state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Show error with animation
        submitBtn.style.backgroundColor = '#dc3545';
        submitBtn.style.color = 'white';
        submitBtn.textContent = error.message || 'Invalid email or password';

        setTimeout(() => {
            submitBtn.style.backgroundColor = '';
            submitBtn.style.color = '';
            submitBtn.textContent = 'Login';
        }, 3000);

        console.error('Error:', error);
    }
});

// Check if user is already logged in
async function checkAuthState() {
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (user) {
        window.location.href = 'home.html';
    }
}

checkAuthState();

supabaseAuth.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user);
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        localStorage.removeItem('supabase.auth.token');
    }
});