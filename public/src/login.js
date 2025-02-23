// src/login.js
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Login successful!');
            window.location.href = '/userDashboard.html'; // Redirect to dashboard
        } else {
            alert(data.error || 'Login failed.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again.');
    }
});
