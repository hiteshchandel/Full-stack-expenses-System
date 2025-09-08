const BASE_URL = "/api/auth";

document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const mobile = document.getElementById("signupMobile").value.trim();

    try {
        const res = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, mobile })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`🎉 Signup Successful! Please login.`);
            e.target.reset();
            window.location.href = '/'; // redirect after signup
        } else {
            alert(`❌ Signup Failed: ${data.message}`);
        }
    } catch (err) {
        alert("⚠️ Server error, try again later.");
    }
});
