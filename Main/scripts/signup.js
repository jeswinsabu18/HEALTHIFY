import { supabaseUrl, supabaseKey } from './config.js';

const supabaseAuth = supabase.createClient(supabaseUrl, supabaseKey);

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

async function sendToMongoDB(userData) {
    console.log('Sending to MongoDB:', userData); // Log the data being sent
    try {
        const response = await fetch('http://localhost:5000/api/addUserToMongo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ MongoDB Data Added:', result);
    } catch (error) {
        console.error('❌ MongoDB Sync Failed:', error.message);
        displayError(error.message);
    }
}

async function signUpWithSupabase(email, password, fullName, birthdate, gender, weight, height) {
    let attempts = 0;
    const maxAttempts = 5;
    const delay = 7000; // 7 seconds

    while (attempts < maxAttempts) {
        const { user, error } = await supabaseAuth.auth.signUp({
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
            if (error.message.includes('For security purposes, you can only request this after 7 seconds.')) {
                attempts++;
                console.warn(`⚠️ Supabase Sign Up Rate Limited. Retrying in ${delay / 1000} seconds... (Attempt ${attempts}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('❌ Supabase Sign Up Failed:', error.message);
                displayError(error.message);
                return null;
            }
        } else {
            return user;
        }
    }

    console.error('❌ Supabase Sign Up Failed: Max retry attempts reached.');
    displayError('Supabase Sign Up Failed: Max retry attempts reached.');
    return null;
}

// Add event listener for form submission
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('full-name').value;
    const birthdate = document.getElementById('birthdate').value;
    const gender = document.getElementById('gender').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;

    // Validate date of birth
    const birthDate = new Date(birthdate);
    const minDate = new Date('1970-01-01');
    const maxDate = new Date('2006-12-31');

    if (birthDate < minDate || birthDate > maxDate) {
        displayError('Date of birth must be between 1970 and 2006.');
        return;
    }

    // Calculate age from date of birth
    const age = new Date().getFullYear() - birthDate.getFullYear();

    // Validate age
    if (age < 18) {
        displayError('Sorry!! You must be at least 18 years old.');
        return;
    } else if (age > 70) {
        displayError('Sorry!! You must be at most 70 years old.');
        return;
    }

    // Clear any previous error messages
    clearError();

    // Sign up user with Supabase
    const user = await signUpWithSupabase(email, password, fullName, birthdate, gender, weight, height);

    if (!user) {
        return;
    }

    // Send user data to MongoDB
    await sendToMongoDB({ email, fullName, birthdate, gender, weight, height });
});