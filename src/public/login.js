
const AUTH_URL = "/api/auth";
const FORGOT_URL = "/api/password";

const loginForm = document.getElementById("loginForm");
const forgotForm = document.getElementById("forgotForm");
const formTitle = document.getElementById("formTitle");

// Toggle to Forgot Password Form
document.getElementById("showForgotForm").addEventListener("click", () => {
    loginForm.style.display = "none";
    forgotForm.style.display = "block";
    formTitle.textContent = "Reset your password";
});

// Toggle back to Login Form
document.getElementById("backToLogin").addEventListener("click", () => {
    forgotForm.style.display = "none";
    loginForm.style.display = "block";
    formTitle.textContent = "Login to continue";
});

// Login Handler
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
        const res = await fetch(`${AUTH_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("name", data.user.name);
            alert(`✅ Login Successful! Welcome ${data.user.name || "User"}`);
            e.target.reset();
            console.log(`${data.user.isPremium}`)
            if (!data.user.isPremium) {
                window.location.href = "/expenses"; // or premiumExpense.html
            } else {
                window.location.href = "/premium"; // or expense.html
            }

        } else {
            alert(`❌ Login Failed: ${data.message}`);
        }
    } catch (err) {
        alert("⚠️ Server error, try again later.");
    }
});

// Forgot Password Handler
forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim();

    try {
        const res = await fetch(`${FORGOT_URL}/forgotpassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`📩 ${data.message}\nCheck your email inbox to reset your password.`);
            e.target.reset();
            // Go back to login after sending email
            document.getElementById("backToLogin").click();
        } else {
            alert(`❌ ${data.message || "Failed to send reset link"}`);
        }
    } catch (err) {
        alert("⚠️ Server error, could not send reset email.");
    }
});
