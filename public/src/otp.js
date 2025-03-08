// Send OTP Button Click Handler
// otp.js

// Define the sendOtp function
export async function sendOtp(email) {
    try {
        const response = await fetch('https://backendcookie-8qc1.onrender.com/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send OTP');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        throw error;
    }
}

// Define other functions (e.g., verifyOtp) if needed
export async function verifyOtp(email, otp) {
    // Similar implementation for verifying OTP
}

// Confirm Deletion Button Click Handler
document.getElementById('confirmDeleteCookieDataBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('deleteCookieEmail').value.trim();
    const otp = document.getElementById('deleteCookieOTP').value.trim();

    if (!email || !otp) {
        alert('All fields are required.');
        return;
    }

    try {
        const response = await fetch('https://backendcookie-8qc1.onrender.com/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to verify OTP');
        }

        const result = await response.json();
        if (result.success) {
            alert('Your data has been deleted successfully!');
            location.reload(); // Refresh page after deletion
        } else {
            alert('Failed to verify OTP: ' + result.message);
        }
    } catch (error) {
        alert('Error verifying OTP: ' + error.message);
    }
});