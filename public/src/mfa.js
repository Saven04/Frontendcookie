document.addEventListener("DOMContentLoaded", function () {
    const mfaMethod = document.getElementById("mfaMethod");
    const emailInput = document.getElementById("mfaEmail");
    const phoneInput = document.getElementById("mfaPhone");
    const sendMfaBtn = document.getElementById("sendMfaBtn");
    const mfaCodeInput = document.getElementById("mfaCode");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const messageBox = document.getElementById("mfaMessage");

    // Function to get consent ID from localStorage
    function getConsentId() {
        const consentId = localStorage.getItem("consentId"); // Retrieve from localStorage
        if (consentId) {
            console.log("✅ Consent ID from localStorage:", consentId);
            return consentId;
        } else {
            console.error("❌ Consent ID not found in localStorage.");
            return null;
        }
    }
    
    // Use the function to get consentId
    const consentId = getConsentId();
    if (consentId) {
        console.log("✅ Consent ID:", consentId);
    } else {
        console.error("❌ Consent ID not found.");
    }

    // Toggle Email/Phone Input Fields
    mfaMethod.addEventListener("change", function () {
        if (mfaMethod.value === "email") {
            emailInput.classList.remove("d-none");
            phoneInput.classList.add("d-none");
        } else {
            phoneInput.classList.remove("d-none");
            emailInput.classList.add("d-none");
        }
    });

    // 🔹 Step 1: Send MFA Code (Email or Phone)
    sendMfaBtn.addEventListener("click", async () => {
        const method = mfaMethod.value;
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const contact = method === "email" ? email : phone;
    
        if (!contact) {
            messageBox.innerHTML = `❌ Please enter a valid ${method}.`;
            return;
        }
    
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/request-mfa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method, contact }),
            });
    
            const result = await response.json();
    
            // Check if the response was successful
            if (response.ok) {
                messageBox.innerHTML = "✅ MFA code sent!";
            } else {
                messageBox.innerHTML = `❌ ${result.error || "Something went wrong"}`;
            }
        } catch (error) {
            console.error("MFA request error:", error);
            messageBox.innerHTML = "❌ Failed to send MFA code.";
        }
    });
    
    // 🔹 Step 2: Verify MFA Code
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method, contact, mfaCode }),
            });

            const result = await response.json();
            if (response.ok) {
                messageBox.innerHTML = "✅ MFA Verified. Deleting account...";
                deleteAccount(consentId, mfaCode);
            } else {
                messageBox.innerHTML = `❌ ${result.error}`;
            }
        } catch (error) {
            console.error("MFA verification error:", error);
            messageBox.innerHTML = "❌ MFA verification failed.";
        }
    });

    // 🔹 Step 3: Delete Account After MFA Verification
    async function deleteAccount(consentId, mfaCode) {
        if (!consentId) {
            alert("❌ Consent ID missing. Please log in again.");
            return;
        }

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/delete-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ consentId, mfaCode }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("✅ Your account has been deleted.");
                localStorage.clear(); // Clear user data
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
