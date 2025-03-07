const supabaseUrl = "https://bmudmwtihiaifrodrmyz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdWRtd3RpaGlhaWZyb2RybXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjE4OTUsImV4cCI6MjA1NjkzNzg5NX0.3tkW9LNFY8XiWaTCYvAK-3hJn32sGChT-i6ktSNlqog";
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Function to send verification code
async function sendVerificationCode(email) {
    if (!email) return alert("Email is required.");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
        alert("Error sending verification code: " + error.message);
    } else {
        alert("Verification code sent to your email.");
    }
}

// Update password function
async function updatePassword() {
    const email = document.getElementById("passwordEmail")?.value;
    const otp = document.getElementById("passwordOTP")?.value;
    const newPassword = document.getElementById("newPassword")?.value;

    if (!email || !otp || !newPassword) return alert("All fields are required.");

    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) return alert("Verification failed: " + error.message);

    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
    if (passwordError) {
        alert("Error updating password: " + passwordError.message);
    } else {
        alert("Password updated successfully!");
        location.reload();
    }
}

// Update email function
async function updateEmail() {
    const newEmail = document.getElementById("newEmail")?.value;
    if (!newEmail) return alert("New email is required.");

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return alert("Error updating email: " + error.message);

    alert("Email updated successfully!");
    location.reload();
}
