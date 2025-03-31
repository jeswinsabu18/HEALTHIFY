import { supabase } from './config.js';

const form = document.getElementById('signup');

function displayError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

function clearError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function validateEmail(email) {
    // Basic structure check
    if (!email || email.length > 254) {
        return false;
    }

    // Check for multiple @ symbols
    const atSymbols = email.split('@');
    if (atSymbols.length !== 2) {
        return false;
    }

    // Destructure local part and domain
    const [localPart, domain] = atSymbols;

    // Local part validation
    if (!localPart || localPart.length > 64) {
        return false;
    }

    // Check for invalid characters in local part
    // Allow: letters, numbers, and !#$%&'*+-/=?^_`{|}~.
    const localPartRegex = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+$/;
    if (!localPartRegex.test(localPart)) {
        return false;
    }

    // Check for consecutive dots in local part
    if (localPart.includes('..')) {
        return false;
    }

    // Local part can't start or end with a dot
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return false;
    }

    // Domain validation
    if (!domain || domain.length > 253) {
        return false;
    }

    // Domain must contain at least one dot (for TLD)
    if (!domain.includes('.')) {
        return false;
    }

    // Split domain into parts
    const domainParts = domain.split('.');

    // Last part (TLD) should be at least 2 characters
    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) {
        return false;
    }

    // Each domain part should follow specific rules
    for (const part of domainParts) {
        // Domain parts cannot be empty
        if (!part) {
            return false;
        }

        // Domain parts can only contain letters, numbers, and hyphens
        // Cannot start or end with hyphen
        if (!/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/.test(part)) {
            return false;
        }
    }

    // Check for IP address format domains
    if (/^\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]$/.test(domain)) {
        const ipParts = domain.replace(/[\[\]]/g, '').split('.');
        for (const part of ipParts) {
            const num = parseInt(part, 10);
            if (isNaN(num) || num < 0 || num > 255) {
                return false;
            }
        }
    }

    // If all checks pass, email is valid
    return true;
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
}

async function signUpWithSupabase(email, password, fullName, birthdate, gender, weight, height) {
    let attempts = 0;
    const maxAttempts = 3; // Reduce max attempts since we're waiting longer
    const delay = 25000; // Increased to 25 seconds

    while (attempts < maxAttempts) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    fullName,
                    birthdate,
                    gender,
                    weight,
                    height
                }
            }
        });

        if (error) {
            if (error.message.includes('For security purposes, you can only request this after')) {
                // Extract the required wait time from the error message
                const waitTimeMatch = error.message.match(/after (\d+) seconds/);
                const requiredWaitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) * 1000 : delay;

                attempts++;
                console.warn(`⚠️ Supabase Sign Up Rate Limited. Retrying in ${requiredWaitTime / 1000} seconds... (Attempt ${attempts}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, requiredWaitTime));
            } else {
                console.error('❌ Supabase Sign Up Failed:', error.message);
                displayError(error.message);
                return null;
            }
        } else {
            return data.user;
        }
    }

    console.error('❌ Supabase Sign Up Failed: Max retry attempts reached.');
    displayError('Sign up is taking longer than expected. Please try again in a few minutes.');
    return null;
}

// Add event listener for form submission
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('full-name').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const gender = document.getElementById('gender').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;

    // Validate all form fields

    // Check if any fields are empty
    if (!fullName || !email || !password || !birthdate || !gender || !weight || !height) {
        displayError('Please fill in all fields');
        return;
    }

    // Validate full name
    if (fullName.length < 2 || fullName.length > 50) {
        displayError('Full name must be between 2 and 50 characters');
        return;
    }

    // Validate email format
    if (!validateEmail(email)) {
        displayError('Please enter a valid email address');
        return;
    }

    // Validate password
    if (!validatePassword(password)) {
        displayError('Password must be at least 8 characters long and include uppercase, lowercase, and a number');
        return;
    }

    // Validate date of birth
    const birthDate = new Date(birthdate);
    const minDate = new Date('1970-01-01');
    const maxDate = new Date('2006-12-31');

    if (isNaN(birthDate.getTime())) {
        displayError('Please enter a valid date of birth');
        return;
    }

    if (birthDate < minDate || birthDate > maxDate) {
        displayError('Date of birth must be between 1970 and 2006');
        return;
    }

    // Calculate age from date of birth
    const age = new Date().getFullYear() - birthDate.getFullYear();

    // Validate age
    if (age < 18) {
        displayError('Sorry!! You must be at least 18 years old');
        return;
    } else if (age > 70) {
        displayError('Sorry!! You must be at most 70 years old');
        return;
    }

    // Validate gender
    if (gender !== 'Male' && gender !== 'Female') {
        displayError('Please select a valid gender');
        return;
    }

    // Validate weight (between 30kg and 200kg)
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 200) {
        displayError('Weight must be between 30kg and 200kg');
        return;
    }

    // Validate height (between 100cm and 250cm)
    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        displayError('Height must be between 100cm and 250cm');
        return;
    }

    // Clear any previous error messages
    clearError();

    // Show loading state on button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
    }

    try {
        // Sign up user with Supabase
        const user = await signUpWithSupabase(email, password, fullName, birthdate, gender, weight, height);

        if (!user) {
            if (submitBtn) {
                submitBtn.textContent = 'Create Account';
                submitBtn.disabled = false;
            }
            return;
        }

        console.log('Supabase user created:', user);
        localStorage.setItem('userEmail', email); // 'email' is the email entered in the signup form

        // Redirect to success page
        console.log('Redirecting to signupdone.html');

        // Check if the file is named signup-success.html or signupdone.html
        // You may need to adjust this based on your actual file name
        window.location.href = 'signupdone.html';

    } catch (error) {
        console.error('Error during signup process:', error);
        displayError('An error occurred during signup. Please try again.');

        if (submitBtn) {
            submitBtn.textContent = 'Create Account';
            submitBtn.disabled = false;
        }
    }
});