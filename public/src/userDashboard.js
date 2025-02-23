document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Unauthorized access! Redirecting to login.");
        window.location.href = "/index.html";
        return;
    }

    // Decode token and fetch user details
    async function fetchUserData() {
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/user", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to fetch user data");

            const userData = await response.json();
            document.getElementById("username").textContent = userData.username;
            document.getElementById("email").textContent = userData.email;
            document.getElementById("consentId").textContent = userData.consentId;
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("Session expired. Please log in again.");
            logout();
        }
    }

    function logout() {
        localStorage.removeItem("token");
        window.location.href = "/index.html";
    }

    document.getElementById("logoutBtn").addEventListener("click", logout);

    fetchUserData();
});
