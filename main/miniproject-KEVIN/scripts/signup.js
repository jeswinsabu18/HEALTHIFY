import { supabaseUrl, supabaseAnonKey } from './config.js';

// Changed from supabaseClient to supabase
const supabaseAuth = supabase.createClient(supabaseUrl, supabaseAnonKey);

const form = document.getElementById('signup');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('full-name').value;
    const birthdate = document.getElementById('birthdate').value;
    const gender = document.getElementById('gender').value;

    try {
        // First, sign up the user with Supabase Auth
        const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    birthdate: birthdate,
                    gender: gender
                },
                emailRedirectTo: `${window.location.origin}/index.html` // Redirect to login page after verification
            }
        });

        if (authError) {
            throw authError;
        }

        if (authData.user) {
            try {
                // Create profile record
                const { error: profileError } = await supabaseAuth
                    .from('profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            full_name: fullName,
                            birthdate: birthdate,
                            gender: gender,
                            email: email
                        }
                    ]);

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                }

                // Show verification message
                form.innerHTML = `
                    <div style="text-align: center;">
                        <h2 style="color: #28a745; margin-bottom: 1.5rem;">✉️ Verify Your Email</h2>
                        <p style="margin-bottom: 1rem; line-height: 1.5;">
                            We've sent a verification link to:<br>
                            <strong>${email}</strong>
                        </p>
                        <p style="margin-bottom: 2rem; line-height: 1.5;">
                            Please check your email and click the link to verify your account.
                            The link will expire in 24 hours.
                        </p>
                        <div style="margin-bottom: 1rem;">
                            <button type="button" onclick="window.location.href='index.html'" 
                                    style="background-color: #fdfa91; width: auto; padding: 0.75rem 2rem;">
                                Back to Login
                            </button>
                        </div>
                        <p style="font-size: 0.9rem; color: #666;">
                            Didn't receive the email? Check your spam folder or 
                            <a href="#" onclick="resendVerification('${email}')" style="color: #28a745;">
                                click here to resend
                            </a>
                        </p>
                    </div>
                `;

                // Add resend verification function to window scope
                window.resendVerification = async function(email) {
                    try {
                        const { error } = await supabaseAuth.auth.resend({
                            type: 'signup',
                            email: email,
                            options: {
                                emailRedirectTo: `${window.location.origin}/index.html`
                            }
                        });
                        
                        if (error) throw error;
                        
                        alert('Verification email resent! Please check your inbox.');
                    } catch (error) {
                        console.error('Error resending verification:', error);
                        alert('Failed to resend verification email. Please try again.');
                    }
                };

            } catch (error) {
                console.error('Error:', error);
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '#dc3545';
                submitBtn.style.color = 'white';
                submitBtn.textContent = error.message || 'An error occurred';
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        submitBtn.style.backgroundColor = '#dc3545';
        submitBtn.style.color = 'white';
        submitBtn.textContent = error.message || 'An error occurred';
        
        setTimeout(() => {
            submitBtn.style.backgroundColor = '';
            submitBtn.style.color = '';
            submitBtn.textContent = 'Create Account';
        }, 3000);
    }
}); 