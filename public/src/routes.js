
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

    document.getElementById('sendDeleteDataOtpBtn')?.addEventListener('click', async () => {
        const email = document.getElementById('deleteCookieEmail').value.trim();
    
        if (!email) {
            alert('Please enter a valid email address.');
            return;
        }
    
        try {
            const result = await sendOtp(email);
            if (result.success) {
                alert(`An OTP has been sent to ${email}. Please check your inbox.`);
                document.getElementById('otpSection').classList.remove('d-none'); // Show OTP input section
            } else {
                alert('Failed to send OTP: ' + result.message);
            }
        } catch (error) {
            alert('Error sending OTP: ' + error.message);
        }
    });

    // Verify OTP Button
 
document.getElementById('confirmDeleteCookieDataBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('deleteCookieEmail').value.trim();
    const otp = document.getElementById('deleteCookieOTP').value.trim();

    if (!email || !otp) {
        alert('All fields are required.');
        return;
    }

    try {
        const result = await verifyOtp(email, otp);
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



});