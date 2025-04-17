import { supabase } from './config.js';

// Simple hash function for profile versioning
function generateProfileHash(profile) {
    const relevantFields = {
        birthdate: profile.birthdate || '',
        gender: profile.gender || '',
        weight: profile.weight || '',
        height: profile.height || '',
        medicalInfo: profile.medicalInfo || '',
        country: profile.country || '',
        customCountry: profile.customCountry || ''
    };
    const str = JSON.stringify(relevantFields);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profile-form');
    const emailField = document.getElementById('email');
    const fullNameField = document.getElementById('full-name');
    const birthdateField = document.getElementById('birthdate');
    const genderField = document.getElementById('gender');
    const weightField = document.getElementById('weight');
    const heightField = document.getElementById('height');
    const medicalInfoField = document.getElementById('medical-info');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const spinner = document.getElementById('spinner');
    const usernameDisplay = document.getElementById('username');
    const logoutBtn = document.querySelectorAll('#logoutBtn');
    const countryField = document.getElementById('country');
    const customCountryGroup = document.getElementById('custom-country-group');
    const customCountryField = document.getElementById('custom-country');

    countryField.addEventListener('change', () => {
        if (countryField.value === 'Other') {
            customCountryGroup.style.display = 'block';
        } else {
            customCountryGroup.style.display = 'none';
            customCountryField.value = '';
        }
    });

    // Avatar elements
    const avatarContainer = document.getElementById('avatar-container');
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatar-preview');

    let avatarUrl = null;
    let oldAvatarPath = null;

    // Function to display error
    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        spinner.style.display = 'none';
    }

    // Function to clear error
    function clearError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    // Function to display success message
    function displaySuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        spinner.style.display = 'none';
    }

    // Check if user is authenticated
    const checkAuthStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = 'login.html';
                return null;
            }
            usernameDisplay.textContent = user?.user_metadata?.fullName ||
                user?.raw_user_meta_data?.fullName ||
                user.email;
            return user;
        } catch (error) {
            console.error('Error checking auth status:', error);
            window.location.href = 'index.html';
            return null;
        }
    };

    // Extract the file path from a Supabase Storage URL
    const extractFilePath = (url) => {
        if (!url) return null;
        const match = url.match(/\/avatars\/(.+)$/);
        return match ? match[1] : null;
    };

    // Delete the old avatar from storage
    const deleteOldAvatar = async (filePath) => {
        if (!filePath) return;
        try {
            const { error } = await supabase.storage
                .from('avatars')
                .remove([filePath]);
            if (error) {
                console.error('Error deleting old avatar:', error);
            }
        } catch (error) {
            console.error('Exception while deleting old avatar:', error);
        }
    };

    // Fetch user profile data
    const fetchUserProfile = async (user) => {
        try {
            spinner.style.display = 'block';
            const userData = user.user_metadata;
            emailField.value = user.email;
            fullNameField.value = userData.fullName || '';
            birthdateField.value = userData.birthdate || '';
            genderField.value = userData.gender || 'male';
            weightField.value = userData.weight || '';
            heightField.value = userData.height || '';
            medicalInfoField.value = userData.medicalInfo || '';
            countryField.value = userData.country || '';
            if (userData.country === 'Other') {
                customCountryGroup.style.display = 'block';
                customCountryField.value = userData.customCountry || '';
            }
            if (userData.avatarUrl) {
                avatarUrl = userData.avatarUrl;
                avatarPreview.src = avatarUrl;
                oldAvatarPath = extractFilePath(avatarUrl);
            }
            spinner.style.display = 'none';
        } catch (error) {
            console.error('Error fetching user profile:', error);
            displayError('Failed to load profile data. Please try again.');
        }
    };

    // Function to upload avatar to Supabase Storage
    const uploadAvatar = async (file, userId) => {
        try {
            spinner.style.display = 'block';
            clearError();
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('Image size should be less than 2MB');
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Only JPEG, PNG, GIF, and WEBP images are allowed');
            }
            const fileName = `${userId}-${Date.now()}.${file.name.split('.').pop()}`;
            const filePath = `public/${fileName}`;
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            if (error) throw error;
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            if (oldAvatarPath) {
                await deleteOldAvatar(oldAvatarPath);
                oldAvatarPath = filePath;
            }
            return urlData.publicUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        } finally {
            spinner.style.display = 'none';
        }
    };

    // Handle avatar file selection and upload
    if (avatarInput) {
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        avatarPreview.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        throw new Error('User not authenticated');
                    }
                    avatarUrl = await uploadAvatar(file, user.id);
                    const { error } = await supabase.auth.updateUser({
                        data: { avatarUrl }
                    });
                    if (error) throw error;
                    displaySuccess('Profile photo uploaded successfully!');
                } catch (error) {
                    console.error('Error in avatar upload flow:', error);
                    displayError(error.message);
                    if (oldAvatarPath) {
                        const { data: urlData } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(oldAvatarPath);
                        avatarPreview.src = urlData.publicUrl;
                    } else {
                        avatarPreview.src = './assets/default-avatar.png';
                    }
                }
            }
        });
    }

    // Update user profile
    const updateUserProfile = async (e) => {
        e.preventDefault();
        clearError();
        spinner.style.display = 'block';

        try {
            const fullName = fullNameField.value.trim();
            const birthdate = birthdateField.value;
            const gender = genderField.value;
            const weight = parseFloat(weightField.value);
            const height = parseFloat(heightField.value);
            const medicalInfo = medicalInfoField.value.trim();
            const country = countryField.value;
            const customCountry = customCountryField.value.trim();

            if (!country) {
                throw new Error('Please select a country');
            }
            if (country === 'Other' && !customCountry) {
                throw new Error('Please specify your country');
            }
            if (!fullName) {
                throw new Error('Full name is required');
            }
            if (!birthdate) {
                throw new Error('Date of birth is required');
            }
            const birthDate = new Date(birthdate);
            const minDate = new Date('1970-01-01');
            const maxDate = new Date('2006-12-31');
            if (birthDate < minDate || birthDate > maxDate) {
                throw new Error('Date of birth must be between 1970 and 2006.');
            }
            const age = new Date().getFullYear() - birthDate.getFullYear();
            if (age < 18) {
                throw new Error('Sorry!! You must be at least 18 years old.');
            } else if (age > 70) {
                throw new Error('Sorry!! You must be at most 70 years old.');
            }
            if (isNaN(weight) || weight < 20 || weight > 250) {
                throw new Error('Please enter a valid weight between 20kg and 250kg');
            }
            if (isNaN(height) || height < 50 || height > 250) {
                throw new Error('Please enter a valid height between 50cm and 250cm');
            }

            // Generate profile hash
            const profileData = {
                birthdate,
                gender,
                weight,
                height,
                medicalInfo,
                country,
                customCountry: country === 'Other' ? customCountry : ''
            };
            const profileHash = generateProfileHash(profileData);

            // Update user metadata in Supabase
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    fullName,
                    birthdate,
                    gender,
                    weight,
                    height,
                    medicalInfo,
                    country,
                    ...(country === 'Other' && { customCountry }),
                    profileHash,
                    ...(avatarUrl && { avatarUrl })
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            usernameDisplay.textContent = fullName;
            displaySuccess('Profile updated successfully!');
            await supabase.auth.refreshSession();

        } catch (error) {
            console.error('Error updating profile:', error);
            displayError(error.message);
        } finally {
            spinner.style.display = 'none';
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            displayError('Failed to sign out. Please try again.');
        }
    };

    // Initialize the page
    const initPage = async () => {
        const user = await checkAuthStatus();
        if (user) {
            await fetchUserProfile(user);
            profileForm.addEventListener('submit', updateUserProfile);
            logoutBtn.forEach(btn => {
                btn.addEventListener('click', handleLogout);
            });
        }
    };

    initPage();
});