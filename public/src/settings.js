const supabaseUrl = "https://ieyefjxdupzywnmqltnw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlleWVmanhkdXB6eXdubXFsdG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTg2ODIsImV4cCI6MjA1NjQ5NDY4Mn0.Bcl4f67ub3t0MCveOq1zlO9-bD5uRbv12mu-ONG0Whc";
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener("DOMContentLoaded", function () {
    const deleteAllDataBtn = document.getElementById("deleteAllData");

    deleteAllDataBtn.addEventListener("click", async function () {
        try {
            // Step 1: Request OTP
            const { data: user, error } = await supabase.auth.getUser();
            if (error || !user) {
                alert("User not authenticated. Please log in.");
                return;
            }

            const email = user.user.email;
            const { error: otpError } = await supabase.auth.signInWithOtp({ email });

            if (otpError) {
                alert("Failed to send OTP. Try again.");
                return;
            }

            const enteredCode = prompt("Enter the MFA OTP sent to your email:");
            if (!enteredCode) {
                alert("OTP is required!");
                return;
            }

            // Step 2: Verify OTP and Delete Data
            const { data: session, error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: enteredCode,
                type: "email"
            });

            if (verifyError) {
                alert("Invalid OTP! Data deletion canceled.");
                return;
            }

            // Step 3: Send request to delete user data
            fetch("/delete-all-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert("All your data has been deleted.");
                } else {
                    alert("Error deleting data.");
                }
            })
            .catch(error => console.error("Data deletion failed:", error));

        } catch (error) {
            console.error("Error:", error);
        }
    });
});
