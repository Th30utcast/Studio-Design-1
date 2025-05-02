document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById('loginForm');
  const verify2FABtn = document.getElementById("verify2FABtn");
  const twoFASection = document.getElementById("twoFASection");

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert("Please fill in both fields.");
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (res.ok && result.step === "2fa-required") {
        console.log("2FA required – awaiting code entry");
        localStorage.setItem("pendingEmail", email);
        if (twoFASection) {
          twoFASection.style.display = "block";
        }
        else {
          console.warn("twoFASection not found in the DOM.");
        }
      } else if (res.ok && result.step === "success") {
        const user = result.user;
        storeUserLocally(user);
        window.location.href = "mainlogged_page.html";
      } else {
        alert("Login failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Login JS error:", err);
      alert("An error occurred while logging in.");
    }
  });

  verify2FABtn.addEventListener("click", async () => {
    const code = document.getElementById("twoFACode").value.trim();
    const email = localStorage.getItem("pendingEmail");

    if (!code || !email) {
      alert("Missing verification code or session expired.");
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const result = await res.json();

      if (res.ok && result.step === "success") {
        localStorage.removeItem("pendingEmail");
        storeUserLocally(result.user);
        window.location.href = "mainlogged_page.html";
      } else {
        alert("❌ Invalid or expired code.");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      alert("Verification failed.");
    }
  });

  function storeUserLocally(user) {
    localStorage.setItem("userId", user._id);
    localStorage.setItem("email", user.email);
    localStorage.setItem("userType", user.userType);
    localStorage.setItem("membership", user.membership || "");
    localStorage.setItem("firstName", user.firstName || "");
    localStorage.setItem("lastName", user.lastName || "");
    localStorage.setItem("phoneNumber", user.phoneNumber || "");
    localStorage.setItem("address", JSON.stringify(user.address || {}));
  }
});
