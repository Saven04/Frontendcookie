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
    try {
        // Validate inputs
        if (!email || !otp) {
            throw new Error('Email and OTP are required.');
        }

        // Call the backend API to verify the OTP
        const response = await fetch('https://backendcookie-8qc1.onrender.com/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        // Handle non-2xx responses
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to verify OTP');
        }

        // Parse successful response
        const result = await response.json();
        if (result.success) {
            return result; // Return the success response
        } else {
            throw new Error(result.message || 'OTP verification failed');
        }
    } catch (error) {
        // Log and rethrow the error for handling in the calling function
        console.error('Error verifying OTP:', error.message);
        throw error;
    }
}

// Confirm Deletion Button Click Handler
