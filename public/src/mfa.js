document.addEventListener("DOMContentLoaded", function () {
    const mfaMethod = document.getElementById("mfaMethod");
    const emailInput = document.getElementById("mfaEmail");
    const phoneInput = document.getElementById("mfaPhone");
    const sendMfaBtn = document.getElementById("sendMfaBtn");
    const mfaCodeInput = document.getElementById("mfaCode");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const messageBox = document.getElementById("mfaMessage");

    let consentId = null; // Store consentId globally

    // 🔹 Fetch Consent ID
    async function fetchConsentId() {
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/get-consent-id", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });

            const result = await response.json();
            if (response.ok) {
                consentId = result.consentId;
                console.log("✅ Consent ID:", consentId);
            } else {
                console.error("❌ Error fetching Consent ID:", result.error);
            }
        } catch (error) {
            console.error("❌ Failed to fetch Consent ID:", error);
        }
    }

    fetchConsentId(); // Fetch Consent ID on page load

    // 🔹 Toggle Email/Phone Input Fields
    mfaMethod.addEventListener("change", function () {
        emailInput.classList.toggle("d-none", mfaMethod.value !== "email");
        phoneInput.classList.toggle("d-none", mfaMethod.value === "email");
    });

    // 🔹 Step 1: Send MFA Code (Email or Phone)
    sendMfaBtn.addEventListener("click", async () => {
        const method = mfaMethod.value;
        const contact = method === "email" ? emailInput.value.trim() : phoneInput.value.trim();

        if (!contact) {
            messageBox.innerHTML = `❌ Please enter a valid ${method}.`;
            return;
        }

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/request-mfa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ method, contact }),
            });

            const result = await response.json();
            messageBox.innerHTML = response.ok ? "✅ MFA code sent!" : `❌ ${result.error}`;
        } catch (error) {
            console.error("MFA request error:", error);
            messageBox.innerHTML = "❌ Failed to send MFA code.";
        }
    });

    // 🔹 Step 2: Verify MFA Code & Delete Account
    confirmDeleteBtn.addEventListener("click", async () => {
        const method = mfaMethod.value;
        const contact = method === "email" ? emailInput.value.trim() : phoneInput.value.trim();
        const mfaCode = mfaCodeInput.value.trim();

        if (!contact || !mfaCode) {
            messageBox.innerHTML = "❌ Enter all required fields.";
            return;
        }

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/verify-mfa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ method, contact, mfaCode }),
            });

            const result = await response.json();
            if (response.ok) {
                messageBox.innerHTML = "✅ MFA Verified. Deleting account...";
                await deleteAccount();
            } else {
                messageBox.innerHTML = `❌ ${result.error}`;
            }
        } catch (error) {
            console.error("MFA verification error:", error);
            messageBox.innerHTML = "❌ MFA verification failed.";
        }
    });

    // 🔹 Step 3: Delete Account After MFA Verification
    async function deleteAccount() {
        if (!consentId) {
            alert("❌ Consent ID missing. Please log in again.");
            return;
        }

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/delete-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ consentId }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("✅ Your account has been deleted.");
                localStorage.clear();
                window.location.href = "/"; // Redirect to homepage
            } else {
                alert(`❌ ${result.error}`);
            }
        } catch (error) {
            console.error("Account deletion error:", error);
            alert("❌ Failed to delete account.");
        }
    }
});
