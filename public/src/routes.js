// Import necessary dependencies
import { deleteUserAccount } from './delete.js';
import { deleteCookieData } from './delete.js';
import { sendOtp, verifyOtp } from './otp.js'; // Import OTP functions

// Define routes for handling actions
const routes = {
    '/delete-account': deleteUserAccount,
    '/delete-cookie-data': deleteCookieData,
    '/send-otp': sendOtp,          // Route for sending OTP
    '/verify-otp': verifyOtp,     // Route for verifying OTP
};

// Function to handle route navigation and execution
export function handleRoute(route) {
    const handler = routes[route];
    if (handler) {
        handler();
    } else {
        console.error(`No handler found for route: ${route}`);
    }
}

// Attach event listeners for route-based actions
document.addEventListener('DOMContentLoaded', () => {
    // Delete Account Button
    const deleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            handleRoute('/delete-account');
        });
    }

    // Delete Cookie Data Button
    const deleteCookieDataBtn = document.getElementById('confirmDeleteCookieDataBtn');
    if (deleteCookieDataBtn) {
        deleteCookieDataBtn.addEventListener('click', () => {
            handleRoute('/delete-cookie-data');
        });
    }

    // Send OTP Button
    const sendOtpBtn = document.getElementById('sendOtpBtn'); // Assuming this is the ID of the "Send OTP" button
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => {
            handleRoute('/send-otp');
        });
    }

    // Verify OTP Button
    const verifyOtpBtn = document.getElementById('verifyOtpBtn'); // Assuming this is the ID of the "Verify OTP" button
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', () => {
            handleRoute('/verify-otp');
        });
    }
});