// ✅ Fetch IP Information (with timeout to prevent unresponsiveness)
async function getIpInfo() {
    try {
        const response = await Promise.race([
            fetch("https://your-backend-url.com/api/get-ipinfo"),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 5000))
        ]);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn("⚠️ IP info fetch failed:", error.message);
        return null;
    }
}

// ✅ Fetch Consent ID (with timeout)
async function fetchConsentID() {
    try {
        const response = await Promise.race([
            fetch("https://backendcookie-8qc1.onrender.com/api/generate-consent-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 5000))
        ]);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        return data.consentId;
    } catch (error) {
        console.warn("⚠️ Consent ID fetch failed:", error.message);
        return generateShortUUID(); // Fallback
    }
}

// ✅ Cookie Handling Functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find((c) => c.startsWith(name + "="))
        ?.split("=")[1] || null;
}

// ✅ Show Custom Modal (prevent duplicate modals)
function showModal(message, type) {
    let modal = document.getElementById("customModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "customModal";
        modal.classList.add("modal", type);
        document.body.appendChild(modal);
    }

    modal.innerHTML = `<div class="modal-content">
        <p>${message}</p>
        <button class="close-button">Close</button>
    </div>`;

    modal.querySelector(".close-button").addEventListener("click", () => modal.remove());

    setTimeout(() => modal.remove(), 3000);
}

// ✅ Reset Button
function resetButton() {
    const registerButton = document.querySelector(".login-button");
    if (registerButton) {
        registerButton.disabled = false;
        registerButton.textContent = "Register";
    }
}

// ✅ Register Form Submission Event Listener
document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = true;
    registerButton.textContent = "Registering...";

    const username = document.getElementById("username")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

    if (!username || !email || !password || !confirmPassword) {
        showModal("❌ All fields are required!", "error");
        resetButton();
        return;
    }

    if (password.length < 6) {
        showModal("❌ Password must be at least 6 characters long.", "error");
        resetButton();
        return;
    }

    if (password !== confirmPassword) {
        showModal("❌ Passwords do not match!", "error");
        resetButton();
        return;
    }

    // ✅ Optimize Consent ID Handling
    let consentId = getCookie("consentId") || (await fetchConsentID());
    setCookie("consentId", consentId, 365);

    // ✅ Fetch IP Info
    const ipInfo = await getIpInfo();

    // ✅ Send Registration Request
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, consentId, ipInfo }),
        });

        const data = await response.json();
        if (response.ok) {
            showModal("✅ Registration successful! Redirecting to login...", "success");
            setTimeout(() => {
                document.getElementById("registerForm").reset();
                window.location.href = "index.html";
            }, 1500);
        } else {
            showModal(`❌ ${data.message || "Registration failed."}`, "error");
        }
    } catch (error) {
        console.error("❌ Registration error:", error);
        showModal("❌ Registration failed. Please try again later.", "error");
    } finally {
        resetButton();
    }
});

// ✅ Generate Short Unique ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}
