import React, { useState } from "react";
import supabase from "../supabaseClient";

const MFASettings = () => {
    const [email, setEmail] = useState("");
    const [mfaCode, setMfaCode] = useState("");
    const [message, setMessage] = useState("");

    // 🔹 Step 1: Request MFA Code
    const sendMfaCode = async () => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
            setMessage("❌ Error sending MFA code");
        } else {
            setMessage("✅ MFA code sent to email!");
        }
    };

    // 🔹 Step 2: Verify MFA Code
    const verifyMfa = async () => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: mfaCode,
            type: "email",
        });

        if (error) {
            setMessage("❌ MFA Verification Failed!");
        } else {
            setMessage("✅ MFA Verified Successfully!");
        }
    };

    return (
        <div className="container mt-3">
            <h3>🔒 MFA Settings</h3>
            <input
                type="email"
                className="form-control mb-2"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-primary mb-2" onClick={sendMfaCode}>
                Send MFA Code
            </button>

            <input
                type="text"
                className="form-control mb-2"
                placeholder="Enter MFA Code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
            />
            <button className="btn btn-success" onClick={verifyMfa}>
                Verify MFA
            </button>

            {message && <p className="mt-2">{message}</p>}
        </div>
    );
};

export default MFASettings;
