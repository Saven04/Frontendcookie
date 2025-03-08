// otp.js

/**
 * Sends an OTP to the user's email address.
 * @param {string} email - The user's email address.
 * @returns {Promise<Object>} - The response from the backend.
 */
export async function sendOtp(email) {
    try {
        // Validate email input
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Please provide a valid email address.');
        }

        // Call the backend API to send OTP
        const response = await fetch('https://backendcookie-8qc1.onrender.com/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        // Handle non-2xx responses
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send OTP');
        }

        // Parse successful response
        const result = await response.json();
        console.log(`OTP sent successfully to ${email}`);
        return result;
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        throw error; // Re-throw the error for the caller to handle
    }
}

/**
 * Verifies the OTP entered by the user.
 * @param {string} email - The user's email address.
 * @param {string} otp - The OTP entered by the user.
 * @returns {Promise<Object>} - The response from the backend.
 */
export async function verifyOtp(email, otp) {
    try {
        // Validate inputs
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Please provide a valid email address.');
        }
        if (!otp || otp.trim().length === 0) {
            throw new Error('Please provide a valid OTP.');
        }

        // Call the backend API to verify OTP
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
        console.log(`OTP verified successfully for ${email}`);
        return result;
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        throw error; // Re-throw the error for the caller to handle
    }
}