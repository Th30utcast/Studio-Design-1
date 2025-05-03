document.getElementById('loginForm').addEventListener('submit', async function (e) {
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
  
      if (res.ok) {
        const result = await res.json();
  
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("email", result.email);
        localStorage.setItem("userType", result.userType);
        localStorage.setItem("membership", result.membership);
        localStorage.setItem("firstName", result.firstName || "");
        localStorage.setItem("lastName", result.lastName || "");
        localStorage.setItem("phoneNumber", result.phoneNumber || "");
        localStorage.setItem("address", result.address || "");
        
        if (result.token) {
          localStorage.setItem("token", result.token);
        } else {
          console.error("No token received from server");
          alert("Login successful, but authentication token missing.");
        }
      
        window.location.href = 'mainlogged_page.html';
      } else {
        const message = await res.text();
        alert("Login failed: " + message);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while logging in.");
    }
  });