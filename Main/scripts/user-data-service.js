import { supabase } from "./config.js";

// Function to get the current user ID
export async function getCurrentUserId() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

// Function to check if user is authenticated
export async function isAuthenticated() {
    const userId = await getCurrentUserId();
    return userId !== null;
}

// Function to sign out the user
export async function signOut() {
    try {
        await supabase.auth.signOut();
        window.location.href = "/login.html";
    } catch (error) {
        console.error("Error signing out:", error);
    }
}

// Function to get user profile data
export async function getUserProfile() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}
