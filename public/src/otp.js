// Send OTP Button Click Handler
document.getElementById('sendDeleteDataOtpBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('deleteCookieEmail').value.trim();

    if (!email) {
        alert('Please enter a valid email address.');
        return;
    }

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