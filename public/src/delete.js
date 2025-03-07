// Base URL for the backend API
const apiBaseUrl = "https://backendcookie-8qc1.onrender.com/api";

/**
 * Function to delete a user account.
 * This function verifies the OTP and sends a DELETE request to the backend.
 */
export async function deleteUserAccount() {
    const email = document.getElementById("deleteAccountEmail")?.value.trim();
    const otp = document.getElementById("deleteAccountOTP")?.value.trim();

    if (!email || !otp) {
        return alert("All fields are required.");
    }

    try {
        // Verify OTP using Supabase
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
        if (error) {
            return alert("Verification failed: " + error.message);
        }

        // Send DELETE request to the backend to delete the user account
        const response = await fetch(`${apiBaseUrl}/delete-user`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
            alert("Account deleted successfully!");
            await supabase.auth.signOut(); // Sign out the user
            location.reload(); // Refresh the page
        } else {
            alert("Error deleting account: " + result.message);
        }
    } catch (err) {
        alert("Server error: " + err.message);
    }
}

/**
 * Function to delete cookie data.
 * This function verifies the OTP and sends a DELETE request to the backend.
 */
export async function deleteCookieData() {
    const email = document.getElementById("deleteCookieEmail")?.value.trim();
    const otp = document.getElementById("deleteCookieOTP")?.value.trim();

    if (!email || !otp) {
        return alert("All fields are required.");
    }

    try {
        // Verify OTP using Supabase
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
        if (error) {
            return alert("Verification failed: " + error.message);
        }

        // Delete cookies locally
        document.cookie = "cookiesAccepted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "cookiePreferences=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "consentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Send DELETE request to the backend to delete cookie data
        const response = await fetch(`${apiBaseUrl}/delete-cookie-data`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
            alert("Your cookie preferences and location data have been deleted.");
            location.reload(); // Refresh the page
        } else {
            alert("Error deleting cookie data: " + result.message);
        }
    } catch (err) {
        alert("Server error: " + err.message);
    }
}