const apiBaseUrl = "https://backendcookie-8qc1.onrender.com/api";

// Delete user account
async function deleteUserAccount() {
    const email = document.getElementById("deleteAccountEmail")?.value;
    const otp = document.getElementById("deleteAccountOTP")?.value;

    if (!email || !otp) return alert("All fields are required.");

    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) return alert("Verification failed: " + error.message);

    try {
        const response = await fetch(`${apiBaseUrl}/delete-user`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
            alert("Account deleted successfully!");
            await supabase.auth.signOut();
            location.reload();
        } else {
            alert("Error deleting account.");
        }
    } catch (err) {
        alert("Server error: " + err.message);
    }
}

// Delete cookie data
async function deleteCookieData() {
    const email = document.getElementById("deleteCookieEmail")?.value;
    const otp = document.getElementById("deleteCookieOTP")?.value;

    if (!email || !otp) return alert("All fields are required.");

    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) return alert("Verification failed: " + error.message);

    // Delete cookies
    document.cookie = "cookiesAccepted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "cookiePreferences=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "consentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    try {
        const response = await fetch(`${apiBaseUrl}/delete-cookie-data`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
            alert("Your cookie preferences and location data have been deleted.");
            location.reload();
        } else {
            alert("Error deleting cookie data.");
        }
    } catch (err) {
        alert("Server error: " + err.message);
    }
}
